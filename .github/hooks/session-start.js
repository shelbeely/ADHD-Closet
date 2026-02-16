#!/usr/bin/env node
/**
 * Session Start Hook
 * 
 * Runs at the start of a Copilot session
 * - Verifies environment
 * - Checks dependencies
 * - Loads repository memory
 * - Initializes telemetry
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load utilities
const { detectRuntime } = require('../../scripts/hooks/runtime-detector');
const { getSessionId, initSession, addEvent } = require('../../scripts/hooks/telemetry');

const REPO_ROOT = path.join(__dirname, '../..');
const APP_DIR = path.join(REPO_ROOT, 'app');
const MEMORY_DIR = path.join(REPO_ROOT, '.github/memory');

/**
 * Verify environment setup
 */
function verifyEnvironment() {
  const checks = {
    runtime: null,
    docker: false,
    git: false,
    nodeModules: false,
    prismaClient: false,
    envFile: false,
  };
  
  // Check runtime
  const runtime = detectRuntime(REPO_ROOT);
  checks.runtime = runtime.runtime;
  
  // Check docker
  try {
    execSync('docker --version', { stdio: 'ignore' });
    checks.docker = true;
  } catch {}
  
  // Check git
  try {
    execSync('git --version', { stdio: 'ignore' });
    checks.git = true;
  } catch {}
  
  // Check node_modules
  checks.nodeModules = fs.existsSync(path.join(APP_DIR, 'node_modules'));
  
  // Check Prisma Client
  checks.prismaClient = fs.existsSync(path.join(APP_DIR, 'node_modules/@prisma/client'));
  
  // Check .env file
  checks.envFile = fs.existsSync(path.join(APP_DIR, '.env'));
  
  return checks;
}

/**
 * Load repository memory
 */
function loadMemory() {
  const memoryFiles = [];
  
  if (!fs.existsSync(MEMORY_DIR)) {
    return { loaded: false, files: [], reason: 'Memory directory not found' };
  }
  
  try {
    const files = fs.readdirSync(MEMORY_DIR);
    files.forEach(file => {
      if (file.endsWith('.md')) {
        memoryFiles.push(file);
      }
    });
    
    return { loaded: true, files: memoryFiles, count: memoryFiles.length };
  } catch (error) {
    return { loaded: false, files: [], reason: error.message };
  }
}

/**
 * Get repository info
 */
function getRepoInfo() {
  const info = {
    repository: process.env.GITHUB_REPOSITORY || 'unknown',
    branch: 'unknown',
    commit: 'unknown',
    runId: process.env.GITHUB_RUN_ID,
  };
  
  try {
    // Get branch
    const branchRef = process.env.GITHUB_REF_NAME;
    if (branchRef) {
      info.branch = branchRef;
    } else {
      info.branch = execSync('git rev-parse --abbrev-ref HEAD 2>/dev/null', { 
        encoding: 'utf8',
        cwd: REPO_ROOT,
      }).trim();
    }
    
    // Get commit
    info.commit = execSync('git rev-parse --short HEAD 2>/dev/null', { 
      encoding: 'utf8',
      cwd: REPO_ROOT,
    }).trim();
  } catch {}
  
  return info;
}

/**
 * Main function
 */
async function main() {
  const startTime = Date.now();
  
  try {
    // Read hook input from stdin
    let input = {};
    try {
      const inputData = fs.readFileSync(0, 'utf-8');
      if (inputData.trim()) {
        input = JSON.parse(inputData);
      }
    } catch {
      // No input or parse error, continue with defaults
    }
    
    // Get session ID
    const sessionId = getSessionId();
    
    // Verify environment
    console.log('[SessionStart] Verifying environment...');
    const environment = verifyEnvironment();
    
    // Load memory
    console.log('[SessionStart] Loading repository memory...');
    const memory = loadMemory();
    
    // Get repo info
    const repoInfo = getRepoInfo();
    
    // Initialize telemetry
    const session = initSession(sessionId, {
      type: 'copilot-coding-agent',
      source: input.source || 'unknown',
      repository: repoInfo.repository,
      branch: repoInfo.branch,
      commit: repoInfo.commit,
      environment,
      memory,
    });
    
    // Add session start event
    addEvent(sessionId, {
      type: 'session-start',
      source: input.source || 'unknown',
      environment,
      memory,
    });
    
    const duration = Date.now() - startTime;
    
    // Print summary
    console.log('[SessionStart] ✓ Session initialized');
    console.log(`  Session ID: ${sessionId}`);
    console.log(`  Repository: ${repoInfo.repository}`);
    console.log(`  Branch: ${repoInfo.branch}`);
    console.log(`  Commit: ${repoInfo.commit}`);
    console.log(`  Runtime: ${environment.runtime}`);
    console.log(`  Memory Files: ${memory.count || 0}`);
    console.log(`  Duration: ${duration}ms`);
    
    // Warnings
    if (!environment.nodeModules) {
      console.warn('[SessionStart] ⚠ node_modules not found - run "bun install" or "npm install"');
    }
    if (!environment.prismaClient) {
      console.warn('[SessionStart] ⚠ Prisma Client not generated - run "npm run prisma:generate"');
    }
    if (!environment.envFile) {
      console.warn('[SessionStart] ⚠ .env file not found - copy .env.example and configure');
    }
    
  } catch (error) {
    console.error('[SessionStart] Error:', error.message);
    // Don't fail the hook
  }
  
  process.exit(0);
}

main();
