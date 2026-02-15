#!/usr/bin/env bun
/**
 * Ziit Health Check
 * 
 * Diagnostic script to verify Ziit daemon setup and configuration.
 * Useful for debugging why the daemon might not be working.
 * 
 * Uses Bun.js native APIs exclusively.
 */

import { statSync } from 'fs';

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
}

const results: CheckResult[] = [];

function check(name: string, status: 'pass' | 'fail' | 'warn', message: string) {
  results.push({ name, status, message });
}

function resolvePathBun(p: string): string {
  if (p.startsWith('/')) return p;
  return `${process.cwd()}/${p}`.replace(/\/+/g, '/');
}

async function runGitCommand(args: string[]): Promise<{ stdout: string; code: number }> {
  try {
    const proc = Bun.spawn(['git', ...args], {
      stdout: 'pipe',
      stderr: 'ignore',
    });
    
    const stdout = await new Response(proc.stdout).text();
    await proc.exited;
    
    return { stdout: stdout.trim(), code: proc.exitCode || 0 };
  } catch {
    return { stdout: '', code: 1 };
  }
}

async function main() {
  console.log('🏥 Ziit Health Check\n');

  // Check 1: ZIIT_API_KEY
  const apiKey = process.env.ZIIT_API_KEY;
  if (apiKey) {
    check('API Key', 'pass', `Set (${apiKey.slice(0, 8)}...)`);
  } else {
    check('API Key', 'fail', 'ZIIT_API_KEY environment variable not set');
  }

  // Check 2: Working directory
  const workdir = resolvePathBun(process.env.ZIIT_WORKDIR || process.cwd());
  try {
    statSync(workdir);
    check('Working Directory', 'pass', workdir);
  } catch {
    check('Working Directory', 'fail', `Does not exist: ${workdir}`);
  }

  // Check 3: Git repository
  const gitCheck = await runGitCommand(['rev-parse', '--git-dir']);
  if (gitCheck.code === 0) {
    check('Git Repository', 'pass', 'Valid git repository');
  } else {
    check('Git Repository', 'fail', 'Not a git repository or git not available');
  }

  // Check 4: Include directories
  const includeDirs = (process.env.ZIIT_INCLUDE_DIRS || 'app/app,app/scripts,app/prisma,docs').split(',');
  let dirsFound = 0;
  for (const dir of includeDirs) {
    const dirPath = `${workdir}/${dir.trim()}`;
    try {
      statSync(dirPath);
      dirsFound++;
    } catch {
      // Directory doesn't exist
    }
  }
  
  if (dirsFound === includeDirs.length) {
    check('Include Directories', 'pass', `All ${includeDirs.length} directories exist`);
  } else if (dirsFound > 0) {
    check('Include Directories', 'warn', `${dirsFound}/${includeDirs.length} directories exist`);
  } else {
    check('Include Directories', 'fail', 'No include directories found');
  }

  // Check 5: Git status functionality
  const statusCheck = await runGitCommand(['status', '--porcelain=v1']);
  if (statusCheck.code === 0) {
    const modifiedFiles = statusCheck.stdout.split('\n').filter(l => l.trim()).length;
    check('Git Status', 'pass', `Working (${modifiedFiles} modified files detected)`);
  } else {
    check('Git Status', 'fail', 'Cannot run git status');
  }

  // Check 6: Project detection
  const remoteCheck = await runGitCommand(['remote', 'get-url', 'origin']);
  if (remoteCheck.code === 0) {
    const match = remoteCheck.stdout.match(/github\.com[:/](.+?)(?:\.git)?$/);
    const project = match ? match[1] : 'unknown';
    check('Project Detection', 'pass', project);
  } else if (process.env.GITHUB_REPOSITORY) {
    check('Project Detection', 'pass', `From env: ${process.env.GITHUB_REPOSITORY}`);
  } else {
    check('Project Detection', 'warn', 'Cannot detect project name');
  }

  // Check 7: Branch detection
  const branchCheck = await runGitCommand(['rev-parse', '--abbrev-ref', 'HEAD']);
  if (branchCheck.code === 0 && branchCheck.stdout && branchCheck.stdout !== 'HEAD') {
    check('Branch Detection', 'pass', branchCheck.stdout);
  } else if (process.env.GITHUB_REF_NAME) {
    check('Branch Detection', 'pass', `From env: ${process.env.GITHUB_REF_NAME}`);
  } else {
    check('Branch Detection', 'warn', 'Cannot detect branch name');
  }

  // Check 8: Network connectivity (optional, only if API key is set)
  if (apiKey) {
    const baseUrl = process.env.ZIIT_BASE_URL || 'https://ziit.app';
    try {
      const response = await fetch(`${baseUrl}/`, { method: 'HEAD' });
      check('Network', 'pass', `Can reach ${baseUrl} (${response.status})`);
    } catch (error) {
      check('Network', 'warn', `Cannot reach ${baseUrl}: ${error}`);
    }
  }

  // Print results
  console.log('Results:\n');
  
  let passCount = 0;
  let failCount = 0;
  let warnCount = 0;

  for (const result of results) {
    const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
    console.log(`${icon} ${result.name}: ${result.message}`);
    
    if (result.status === 'pass') passCount++;
    else if (result.status === 'fail') failCount++;
    else warnCount++;
  }

  console.log(`\n📊 Summary: ${passCount} passed, ${failCount} failed, ${warnCount} warnings`);

  // Print configuration
  console.log('\n⚙️  Configuration:');
  console.log(`  ZIIT_BASE_URL: ${process.env.ZIIT_BASE_URL || 'https://ziit.app'}`);
  console.log(`  ZIIT_DEBOUNCE_MS: ${process.env.ZIIT_DEBOUNCE_MS || '2500'}`);
  console.log(`  ZIIT_BATCH_SIZE: ${process.env.ZIIT_BATCH_SIZE || '20'}`);
  console.log(`  ZIIT_FLUSH_MS: ${process.env.ZIIT_FLUSH_MS || '30000'}`);
  console.log(`  ZIIT_EDITOR: ${process.env.ZIIT_EDITOR || 'github-copilot-agent'}`);
  console.log(`  ZIIT_DRY_RUN: ${process.env.ZIIT_DRY_RUN || 'false'}`);
  console.log(`  ZIIT_VERBOSE: ${process.env.ZIIT_VERBOSE || 'false'}`);

  if (failCount > 0) {
    console.log('\n💡 Tip: Fix the failed checks above before running the daemon.');
    process.exit(1);
  } else if (warnCount > 0) {
    console.log('\n💡 Tip: The daemon should work, but warnings may indicate configuration issues.');
    process.exit(0);
  } else {
    console.log('\n✨ All checks passed! The daemon should work correctly.');
    process.exit(0);
  }
}

main().catch((error) => {
  console.error('❌ Health check failed:', error);
  process.exit(1);
});
