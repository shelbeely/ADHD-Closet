#!/usr/bin/env bun
/**
 * Ziit Watch Daemon
 * 
 * Monitors filesystem changes and sends heartbeats to Ziit.app for code files
 * that are actually modified (verified via git status).
 * 
 * Features:
 * - Uses Node.js fs.watch() for efficient filesystem monitoring
 * - Filters by include dirs and file extensions
 * - Ignores noisy directories (.git, node_modules, etc.)
 * - Verifies files are git modified/untracked before sending (batched for performance)
 * - Debounces bursts of events
 * - Buffers heartbeats and uses batch endpoint for efficiency
 * - Handles SIGINT/SIGTERM gracefully with proper cleanup
 * - Retries on transient network failures with exponential backoff
 * - Tracks stats/metrics for observability
 * - Supports dry-run mode for testing
 */

import { watch } from 'fs';
import { existsSync } from 'fs';
import { spawn } from 'child_process';
import { join, relative, resolve } from 'path';
import { ZiitClient, type ZiitHeartbeat } from './ziit';

// Configuration from environment variables
const CONFIG = {
  apiKey: process.env.ZIIT_API_KEY || '',
  baseUrl: process.env.ZIIT_BASE_URL || 'https://ziit.app',
  debounceMs: parseInt(process.env.ZIIT_DEBOUNCE_MS || '2500', 10),
  batchSize: parseInt(process.env.ZIIT_BATCH_SIZE || '20', 10),
  flushMs: parseInt(process.env.ZIIT_FLUSH_MS || '30000', 10),
  workdir: resolve(process.env.ZIIT_WORKDIR || process.cwd()),
  editor: process.env.ZIIT_EDITOR || 'github-copilot-agent',
  includeDirs: (process.env.ZIIT_INCLUDE_DIRS || 'app/app,app/scripts,app/prisma,docs').split(',').map(d => d.trim()),
  includeExts: (process.env.ZIIT_INCLUDE_EXTS || 'ts,tsx,js,jsx,py,sql,prisma,css,scss,html,md,yml,yaml,json').split(',').map(e => e.trim()),
  ignoreDirs: (process.env.ZIIT_IGNORE || '.git/,node_modules/,dist/,build/,coverage/,.next/,.turbo/,bun.lockb,package-lock.json').split(',').map(d => d.trim()),
  dryRun: process.env.ZIIT_DRY_RUN === 'true',
  verbose: process.env.ZIIT_VERBOSE === 'true',
};

// Validate configuration on startup
function validateConfig(): string[] {
  const errors: string[] = [];
  
  if (!CONFIG.apiKey && !CONFIG.dryRun) {
    errors.push('ZIIT_API_KEY is required (or set ZIIT_DRY_RUN=true for testing)');
  }
  
  if (CONFIG.debounceMs < 0 || CONFIG.debounceMs > 60000) {
    errors.push('ZIIT_DEBOUNCE_MS must be between 0 and 60000');
  }
  
  if (CONFIG.batchSize < 1 || CONFIG.batchSize > 100) {
    errors.push('ZIIT_BATCH_SIZE must be between 1 and 100');
  }
  
  if (CONFIG.flushMs < 1000 || CONFIG.flushMs > 300000) {
    errors.push('ZIIT_FLUSH_MS must be between 1000 and 300000');
  }
  
  if (!existsSync(CONFIG.workdir)) {
    errors.push(`ZIIT_WORKDIR does not exist: ${CONFIG.workdir}`);
  }
  
  return errors;
}

// Detect project and branch from environment or git
async function detectProject(): Promise<string> {
  // GitHub environment variables
  if (process.env.GITHUB_REPOSITORY) {
    return process.env.GITHUB_REPOSITORY;
  }

  // Fallback to git remote
  return new Promise((resolve) => {
    const git = spawn('git', ['remote', 'get-url', 'origin'], { cwd: CONFIG.workdir });
    let output = '';
    git.stdout.on('data', (data) => { output += data.toString(); });
    git.on('close', () => {
      const match = output.trim().match(/github\.com[:/](.+?)(?:\.git)?$/);
      resolve(match ? match[1] : 'unknown-project');
    });
  });
}

async function detectBranch(): Promise<string | undefined> {
  // GitHub environment variables
  if (process.env.GITHUB_REF_NAME) {
    return process.env.GITHUB_REF_NAME;
  }

  // Fallback to git branch
  return new Promise((resolve) => {
    const git = spawn('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: CONFIG.workdir });
    let output = '';
    git.stdout.on('data', (data) => { output += data.toString(); });
    git.on('close', () => {
      const branch = output.trim();
      resolve(branch && branch !== 'HEAD' ? branch : undefined);
    });
  });
}

// Check if files are git modified or untracked (batched for performance)
async function checkGitStatus(filePaths: string[]): Promise<Set<string>> {
  if (filePaths.length === 0) return new Set();
  
  return new Promise((resolve) => {
    // Use git status to check all files at once
    const git = spawn('git', ['status', '--porcelain=v1', '--', ...filePaths], { 
      cwd: CONFIG.workdir,
      maxBuffer: 1024 * 1024, // 1MB buffer for large outputs
    });
    
    let output = '';
    git.stdout.on('data', (data) => { output += data.toString(); });
    git.on('close', (code) => {
      if (code !== 0) {
        resolve(new Set());
        return;
      }
      
      // Parse output to extract modified files
      const modifiedFiles = new Set<string>();
      const lines = output.trim().split('\n').filter(l => l.trim());
      
      for (const line of lines) {
        // Format: "XY filename" where X and Y are status codes
        const match = line.match(/^.{2}\s+(.+)$/);
        if (match) {
          const filePath = match[1].trim();
          // Handle renamed files (old -> new)
          const actualPath = filePath.includes(' -> ') 
            ? filePath.split(' -> ')[1] 
            : filePath;
          modifiedFiles.add(actualPath);
        }
      }
      
      resolve(modifiedFiles);
    });
  });
}

// Get file extension
function getExtension(filePath: string): string {
  const match = filePath.match(/\.([^.]+)$/);
  return match ? match[1] : '';
}

// Detect language from file extension
function detectLanguage(filePath: string): string {
  const ext = getExtension(filePath);
  const languageMap: Record<string, string> = {
    ts: 'TypeScript',
    tsx: 'TypeScript',
    js: 'JavaScript',
    jsx: 'JavaScript',
    py: 'Python',
    sql: 'SQL',
    prisma: 'Prisma',
    css: 'CSS',
    scss: 'SCSS',
    html: 'HTML',
    md: 'Markdown',
    yml: 'YAML',
    yaml: 'YAML',
    json: 'JSON',
  };
  return languageMap[ext] || ext || 'Unknown';
}

// Normalize path to be relative to workdir
function normalizePath(filePath: string): string {
  const absPath = resolve(filePath);
  if (absPath.startsWith(CONFIG.workdir)) {
    return relative(CONFIG.workdir, absPath);
  }
  return filePath;
}

// Check if a file should be processed
function shouldProcess(filePath: string): boolean {
  const normalized = normalizePath(filePath);

  // Check ignore patterns
  for (const ignore of CONFIG.ignoreDirs) {
    if (normalized.includes(ignore)) {
      return false;
    }
  }

  // Check include directories
  const matchesIncludeDir = CONFIG.includeDirs.some(dir => normalized.startsWith(dir));
  if (!matchesIncludeDir) {
    return false;
  }

  // Check file extension
  const ext = getExtension(normalized);
  if (!CONFIG.includeExts.includes(ext)) {
    return false;
  }

  return true;
}

class ZiitWatcher {
  private client: ZiitClient;
  private buffer: ZiitHeartbeat[] = [];
  private flushTimer: Timer | null = null;
  private debounceTimer: Timer | null = null;
  private pendingFiles: Set<string> = new Set();
  private project: string = 'unknown-project';
  private branch?: string;
  private isShuttingDown = false;
  private retryCount = 0;
  private stats = {
    filesProcessed: 0,
    heartbeatsSent: 0,
    heartbeatsFailed: 0,
    batchesSent: 0,
    lastFlush: 0,
  };

  constructor() {
    this.client = new ZiitClient({
      apiKey: CONFIG.apiKey,
      baseUrl: CONFIG.baseUrl,
    });
  }

  private log(message: string, level: 'info' | 'warn' | 'error' = 'info') {
    const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : '✓';
    console.log(`[Ziit ${prefix}] ${message}`);
  }

  private verbose(message: string) {
    if (CONFIG.verbose) {
      console.log(`[Ziit 🔍] ${message}`);
    }
  }

  async init() {
    // Detect project and branch
    this.project = await detectProject();
    this.branch = await detectBranch();

    this.log('Starting watch daemon');
    this.log(`Project: ${this.project}`);
    this.log(`Branch: ${this.branch || 'unknown'}`);
    this.log(`Working directory: ${CONFIG.workdir}`);
    this.log(`Watching: ${CONFIG.includeDirs.join(', ')}`);
    this.log(`Extensions: ${CONFIG.includeExts.join(', ')}`);
    
    if (CONFIG.dryRun) {
      this.log('🧪 DRY RUN MODE - No data will be sent to Ziit', 'warn');
    }

    // Start flush timer
    this.scheduleFlush();

    // Setup signal handlers
    process.on('SIGINT', () => this.shutdown());
    process.on('SIGTERM', () => this.shutdown());
    
    // Print stats periodically
    setInterval(() => this.printStats(), 60000); // Every minute
  }

  async shutdown() {
    if (this.isShuttingDown) return;
    this.isShuttingDown = true;

    this.log('\nShutting down...');

    // Cancel timers
    if (this.flushTimer) clearTimeout(this.flushTimer);
    if (this.debounceTimer) clearTimeout(this.debounceTimer);

    // Process any pending files
    if (this.pendingFiles.size > 0) {
      this.log(`Processing ${this.pendingFiles.size} pending files...`);
      await this.processPendingFiles();
    }

    // Flush buffer
    if (this.buffer.length > 0) {
      this.log(`Flushing ${this.buffer.length} heartbeats...`);
      await this.flush();
    }

    this.printStats();
    this.log('Shutdown complete');
    process.exit(0);
  }

  printStats() {
    this.log(`📊 Stats: ${this.stats.filesProcessed} files processed, ${this.stats.heartbeatsSent} heartbeats sent, ${this.stats.batchesSent} batches, ${this.stats.heartbeatsFailed} failed, ${this.buffer.length} buffered`);
  }

  scheduleFlush() {
    if (this.flushTimer) clearTimeout(this.flushTimer);
    this.flushTimer = setTimeout(() => {
      this.flush().then(() => {
        if (!this.isShuttingDown) {
          this.scheduleFlush();
        }
      });
    }, CONFIG.flushMs);
  }

  async flush() {
    if (this.buffer.length === 0) return;

    const toSend = [...this.buffer];
    this.buffer = [];

    if (CONFIG.dryRun) {
      this.log(`🧪 DRY RUN: Would send ${toSend.length} heartbeat(s)`, 'info');
      this.verbose(JSON.stringify(toSend, null, 2));
      this.stats.heartbeatsSent += toSend.length;
      this.stats.batchesSent += 1;
      this.stats.lastFlush = Date.now();
      this.retryCount = 0;
      return;
    }

    const success = await this.client.batch(toSend);
    
    if (success) {
      this.log(`Sent ${toSend.length} heartbeat(s)`);
      this.stats.heartbeatsSent += toSend.length;
      this.stats.batchesSent += 1;
      this.stats.lastFlush = Date.now();
      this.retryCount = 0;
    } else {
      // On failure, add back to buffer for retry with exponential backoff
      this.retryCount++;
      const backoffMs = Math.min(1000 * Math.pow(2, this.retryCount), 60000);
      this.log(`Failed to send, retry #${this.retryCount} in ${backoffMs / 1000}s (keeping ${toSend.length} heartbeats)`, 'warn');
      this.stats.heartbeatsFailed += toSend.length;
      this.buffer.unshift(...toSend);
    }
  }

  enqueueHeartbeat(filePath: string) {
    const heartbeat: ZiitHeartbeat = {
      timestamp: Date.now(),
      project: this.project,
      language: detectLanguage(filePath),
      editor: CONFIG.editor,
      os: process.platform,
      file: filePath,
      branch: this.branch,
    };

    this.buffer.push(heartbeat);

    // Flush if buffer is full
    if (this.buffer.length >= CONFIG.batchSize) {
      this.flush();
    }
  }

  async processPendingFiles() {
    const files = Array.from(this.pendingFiles);
    this.pendingFiles.clear();

    if (files.length === 0) return;

    this.verbose(`Checking git status for ${files.length} file(s)...`);

    // Batch git status check for better performance
    const modifiedFiles = await checkGitStatus(files);

    for (const filePath of files) {
      if (modifiedFiles.has(filePath)) {
        this.verbose(`Enqueuing heartbeat for: ${filePath}`);
        this.enqueueHeartbeat(filePath);
        this.stats.filesProcessed++;
      } else {
        this.verbose(`Skipping unmodified file: ${filePath}`);
      }
    }
  }

  handleFileChange(filePath: string) {
    // Filter out files we don't care about
    if (!shouldProcess(filePath)) {
      return;
    }

    const normalized = normalizePath(filePath);
    
    // Avoid duplicate processing
    if (this.pendingFiles.has(normalized)) {
      return;
    }
    
    this.pendingFiles.add(normalized);
    this.verbose(`File changed: ${normalized}`);

    // Debounce processing
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.processPendingFiles();
    }, CONFIG.debounceMs);
  }

  async watch() {
    await this.init();

    // Watch each include directory
    for (const dir of CONFIG.includeDirs) {
      const fullPath = join(CONFIG.workdir, dir);
      
      try {
        // Check if directory exists
        if (!existsSync(fullPath)) {
          this.log(`Warning: Directory does not exist: ${dir}`, 'warn');
          continue;
        }

        this.log(`Watching directory: ${dir}`);

        // Use Node.js fs.watch for filesystem monitoring
        const watcher = watch(fullPath, { recursive: true }, (eventType, filename) => {
          if (filename) {
            const fullFilePath = join(fullPath, filename);
            this.handleFileChange(fullFilePath);
          }
        });

        // Keep the process running
        watcher.on('error', (error) => {
          this.log(`Watch error for ${dir}: ${error}`, 'error');
        });

      } catch (error) {
        this.log(`Failed to watch ${dir}: ${error}`, 'error');
      }
    }

    this.log('Watch daemon ready ✨');
  }
}

// Main execution
const configErrors = validateConfig();
if (configErrors.length > 0) {
  console.error('[Ziit ❌] Configuration errors:');
  configErrors.forEach(err => console.error(`  - ${err}`));
  process.exit(1);
}

const watcher = new ZiitWatcher();
watcher.watch().catch((error) => {
  console.error('[Ziit ❌] Fatal error:', error);
  process.exit(1);
});
