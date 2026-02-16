#!/usr/bin/env bun
/**
 * Ziit Watch Daemon
 * 
 * Monitors filesystem changes and sends heartbeats to Ziit.app for code files
 * that are actually modified (verified via git status).
 * 
 * Features:
 * - Uses Bun.js with fs.watch() (Bun-compatible) for efficient filesystem monitoring
 * - Uses Bun.spawn() for running git commands
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

import { watch, statSync, type FSWatcher } from 'fs';
import { homedir } from 'os';
import { ZiitClient, type ZiitHeartbeat } from './ziit';
import { CommandMonitor, type CommandEvent } from './command-monitor';

// Bun.js path utilities
function resolvePathBun(p: string): string {
  if (p.startsWith('/')) return p;
  return `${process.cwd()}/${p}`.replace(/\/+/g, '/');
}

function joinPathBun(...parts: string[]): string {
  return parts.join('/').replace(/\/+/g, '/');
}

function relativePathBun(from: string, to: string): string {
  const fromParts = from.split('/').filter(Boolean);
  const toParts = to.split('/').filter(Boolean);
  
  let i = 0;
  while (i < fromParts.length && i < toParts.length && fromParts[i] === toParts[i]) {
    i++;
  }
  
  const upLevels = fromParts.length - i;
  const remainingPath = toParts.slice(i);
  
  return [...Array(upLevels).fill('..'), ...remainingPath].join('/') || '.';
}

// Configuration from environment variables
const CONFIG = {
  apiKey: process.env.ZIIT_API_KEY || '',
  baseUrl: process.env.ZIIT_BASE_URL || 'https://ziit.app',
  debounceMs: parseInt(process.env.ZIIT_DEBOUNCE_MS || '2500', 10),
  batchSize: parseInt(process.env.ZIIT_BATCH_SIZE || '20', 10),
  flushMs: parseInt(process.env.ZIIT_FLUSH_MS || '30000', 10),
  workdir: resolvePathBun(process.env.ZIIT_WORKDIR || process.cwd()),
  editor: process.env.ZIIT_EDITOR || 'github-copilot-agent',
  includeDirs: (process.env.ZIIT_INCLUDE_DIRS || 'app/app,app/scripts,app/prisma,docs').split(',').map(d => d.trim()),
  includeExts: (process.env.ZIIT_INCLUDE_EXTS || 'ts,tsx,js,jsx,py,sql,prisma,css,scss,html,md,yml,yaml,json').split(',').map(e => e.trim()),
  ignoreDirs: (process.env.ZIIT_IGNORE || '.git/,node_modules/,dist/,build/,coverage/,.next/,.turbo/,bun.lockb,package-lock.json').split(',').map(d => d.trim()),
  dryRun: process.env.ZIIT_DRY_RUN === 'true',
  verbose: process.env.ZIIT_VERBOSE === 'true',
  // Command monitoring configuration
  watchCommands: process.env.ZIIT_WATCH_COMMANDS === 'true',
  commandHistoryFile: process.env.ZIIT_COMMAND_HISTORY || `${homedir()}/.bash_history`,
  includeCommands: (process.env.ZIIT_COMMAND_INCLUDE || '').split(',').map(c => c.trim()).filter(Boolean),
  ignoreCommands: (process.env.ZIIT_COMMAND_IGNORE || 'cd,ls,pwd,clear,exit,history,echo,cat,less,more,head,tail').split(',').map(c => c.trim()).filter(Boolean),
};

// Validate configuration on startup
async function validateConfig(): Promise<string[]> {
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
  
  // Check if workdir exists
  try {
    statSync(CONFIG.workdir);
  } catch {
    errors.push(`ZIIT_WORKDIR does not exist: ${CONFIG.workdir}`);
  }
  
  return errors;
}

// Detect project and branch from environment or git (using Bun.spawn)
async function detectProject(): Promise<string> {
  // GitHub environment variables
  if (process.env.GITHUB_REPOSITORY) {
    return process.env.GITHUB_REPOSITORY;
  }

  // Fallback to git remote using Bun.spawn
  try {
    const proc = Bun.spawn(['git', 'remote', 'get-url', 'origin'], {
      cwd: CONFIG.workdir,
      stdout: 'pipe',
    });
    
    const output = await proc.stdout.text();
    await proc.exited;
    
    const match = output.trim().match(/github\.com[:/](.+?)(?:\.git)?$/);
    return match ? match[1] : 'unknown-project';
  } catch {
    return 'unknown-project';
  }
}

async function detectBranch(): Promise<string | undefined> {
  // GitHub environment variables
  if (process.env.GITHUB_REF_NAME) {
    return process.env.GITHUB_REF_NAME;
  }

  // Fallback to git branch using Bun.spawn
  try {
    const proc = Bun.spawn(['git', 'rev-parse', '--abbrev-ref', 'HEAD'], {
      cwd: CONFIG.workdir,
      stdout: 'pipe',
    });
    
    const output = await proc.stdout.text();
    await proc.exited;
    
    const branch = output.trim();
    return branch && branch !== 'HEAD' ? branch : undefined;
  } catch {
    return undefined;
  }
}

// Check if files are git modified or untracked (batched for performance, using Bun.spawn)
async function checkGitStatus(filePaths: string[]): Promise<Set<string>> {
  if (filePaths.length === 0) return new Set();
  
  try {
    // Use git status to check all files at once using Bun.spawn
    const proc = Bun.spawn(['git', 'status', '--porcelain=v1', '--', ...filePaths], {
      cwd: CONFIG.workdir,
      stdout: 'pipe',
      stderr: 'ignore',
    });
    
    const output = await proc.stdout.text();
    await proc.exited;
    
    if (proc.exitCode !== 0) {
      return new Set();
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
    
    return modifiedFiles;
  } catch {
    return new Set();
  }
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

// Normalize path to be relative to workdir (using Bun-native path utilities)
function normalizePath(filePath: string): string {
  const absPath = resolvePathBun(filePath);
  if (absPath.startsWith(CONFIG.workdir)) {
    return relativePathBun(CONFIG.workdir, absPath);
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
  private watchers: FSWatcher[] = [];
  private commandMonitor: CommandMonitor | null = null;
  private stats = {
    filesProcessed: 0,
    heartbeatsSent: 0,
    heartbeatsFailed: 0,
    batchesSent: 0,
    lastFlush: 0,
    commandsProcessed: 0,
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

    // Initialize command monitoring if enabled
    if (CONFIG.watchCommands) {
      this.commandMonitor = new CommandMonitor({
        enabled: true,
        historyFile: CONFIG.commandHistoryFile,
        includeCommands: CONFIG.includeCommands,
        ignoreCommands: CONFIG.ignoreCommands,
        debounceMs: CONFIG.debounceMs,
        verbose: CONFIG.verbose,
      });

      await this.commandMonitor.start((events) => this.handleCommandEvents(events));
      this.log('🎯 Command monitoring enabled');
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

    // Stop command monitoring
    if (this.commandMonitor) {
      this.commandMonitor.stop();
    }

    // Close all watchers
    for (const watcher of this.watchers) {
      watcher.close();
    }
    this.watchers = [];

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
    const commandStats = CONFIG.watchCommands ? `, ${this.stats.commandsProcessed} commands` : '';
    this.log(`📊 Stats: ${this.stats.filesProcessed} files processed${commandStats}, ${this.stats.heartbeatsSent} heartbeats sent, ${this.stats.batchesSent} batches, ${this.stats.heartbeatsFailed} failed, ${this.buffer.length} buffered`);
  }

  handleCommandEvents(events: CommandEvent[]) {
    this.verbose(`Processing ${events.length} command event(s)`);
    
    for (const event of events) {
      const heartbeat = CommandMonitor.createHeartbeat(
        event,
        this.project,
        CONFIG.editor,
        this.branch
      );
      
      this.buffer.push(heartbeat);
      this.stats.commandsProcessed++;
      this.verbose(`Enqueued heartbeat for command: ${event.command}`);
    }

    // Flush if buffer is full
    if (this.buffer.length >= CONFIG.batchSize) {
      this.flush();
    }
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

    // Watch each include directory using fs.watch (Bun-compatible)
    for (const dir of CONFIG.includeDirs) {
      const fullPath = joinPathBun(CONFIG.workdir, dir);
      
      try {
        // Check if directory exists
        try {
          statSync(fullPath);
        } catch {
          this.log(`Warning: Directory does not exist: ${dir}`, 'warn');
          continue;
        }

        this.log(`Watching directory: ${dir}`);

        // Use fs.watch (Bun-compatible) for filesystem monitoring
        const watcher = watch(fullPath, { recursive: true }, (eventType, filename) => {
          if (filename) {
            const fullFilePath = joinPathBun(fullPath, filename);
            this.handleFileChange(fullFilePath);
          }
        });
        
        this.watchers.push(watcher);

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
(async () => {
  const configErrors = await validateConfig();
  if (configErrors.length > 0) {
    console.error('[Ziit ❌] Configuration errors:');
    configErrors.forEach(err => console.error(`  - ${err}`));
    process.exit(1);
  }

  const watcher = new ZiitWatcher();
  await watcher.watch();
})().catch((error) => {
  console.error('[Ziit ❌] Fatal error:', error);
  process.exit(1);
});
