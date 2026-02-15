#!/usr/bin/env bun
/**
 * Ziit Test Heartbeat
 * 
 * Sends a single test heartbeat to Ziit.app to verify the integration is working.
 * Useful for:
 * - Validating API key configuration
 * - Testing network connectivity
 * - Verifying the Ziit API is responding
 * - Manual testing during development
 * 
 * Usage:
 *   export ZIIT_API_KEY="your-api-key"
 *   bun run ziit:test
 * 
 * Or with custom configuration:
 *   ZIIT_BASE_URL="https://ziit.app" ZIIT_API_KEY="key" bun run ziit:test
 */

import { ZiitClient, type ZiitHeartbeat } from './ziit';

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
    
    const stdout = await proc.stdout.text();
    await proc.exited;
    
    return { stdout: stdout.trim(), code: proc.exitCode || 0 };
  } catch {
    return { stdout: '', code: 1 };
  }
}

async function detectProject(): Promise<string> {
  if (process.env.GITHUB_REPOSITORY) {
    return process.env.GITHUB_REPOSITORY;
  }
  
  const result = await runGitCommand(['remote', 'get-url', 'origin']);
  if (result.code === 0) {
    const match = result.stdout.match(/github\.com[:/](.+?)(?:\.git)?$/);
    if (match) {
      return match[1];
    }
  }
  
  return 'test/project';
}

async function detectBranch(): Promise<string> {
  if (process.env.GITHUB_REF_NAME) {
    return process.env.GITHUB_REF_NAME;
  }
  
  const result = await runGitCommand(['rev-parse', '--abbrev-ref', 'HEAD']);
  if (result.code === 0 && result.stdout && result.stdout !== 'HEAD') {
    return result.stdout;
  }
  
  return 'main';
}

async function main() {
  console.log('🧪 Ziit Heartbeat Test\n');

  // Validate API key
  const apiKey = process.env.ZIIT_API_KEY;
  if (!apiKey) {
    console.error('❌ Error: ZIIT_API_KEY environment variable is required');
    console.log('\n💡 Usage:');
    console.log('  export ZIIT_API_KEY="your-api-key-here"');
    console.log('  bun run ziit:test');
    process.exit(1);
  }

  // Configuration
  const baseUrl = process.env.ZIIT_BASE_URL || 'https://ziit.app';
  const workdir = resolvePathBun(process.env.ZIIT_WORKDIR || process.cwd());
  const editor = process.env.ZIIT_EDITOR || 'github-copilot-agent';

  console.log('⚙️  Configuration:');
  console.log(`  Base URL: ${baseUrl}`);
  console.log(`  API Key: ${apiKey.slice(0, 8)}...`);
  console.log(`  Editor: ${editor}`);
  console.log(`  Working Directory: ${workdir}`);
  console.log('');

  // Detect project and branch
  const project = await detectProject();
  const branch = await detectBranch();

  console.log('📦 Project Info:');
  console.log(`  Project: ${project}`);
  console.log(`  Branch: ${branch}`);
  console.log(`  OS: ${process.platform}`);
  console.log('');

  // Create test heartbeat
  const heartbeat: ZiitHeartbeat = {
    timestamp: Date.now(),
    project,
    language: 'TypeScript',
    editor,
    os: process.platform,
    file: 'test/heartbeat.ts',
    branch,
  };

  console.log('📨 Sending test heartbeat...');
  console.log(`  File: ${heartbeat.file}`);
  console.log(`  Language: ${heartbeat.language}`);
  console.log(`  Timestamp: ${new Date(heartbeat.timestamp).toISOString()}`);
  console.log('');

  // Send heartbeat
  const client = new ZiitClient({ apiKey, baseUrl });
  
  const startTime = Date.now();
  const success = await client.heartbeat(heartbeat);
  const duration = Date.now() - startTime;

  if (success) {
    console.log(`✅ Success! Heartbeat sent in ${duration}ms`);
    console.log('');
    console.log('✨ Your Ziit integration is working correctly!');
    console.log(`   Check your activity at ${baseUrl}/activity`);
    process.exit(0);
  } else {
    console.log(`❌ Failed to send heartbeat (took ${duration}ms)`);
    console.log('');
    console.log('💡 Troubleshooting:');
    console.log('  1. Check that your API key is correct');
    console.log('  2. Verify network connectivity to Ziit.app');
    console.log('  3. Check the console for error messages above');
    console.log('  4. Run health check: bun run ziit:health');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ Test failed with error:', error);
  process.exit(1);
});
