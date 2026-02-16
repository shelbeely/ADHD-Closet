#!/usr/bin/env bun
/**
 * Test Command Monitoring
 * 
 * Tests the command monitoring functionality by simulating bash history updates
 */

import { writeFileSync, readFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

// Create a temporary history file
const testHistoryFile = join(tmpdir(), `test-history-${Date.now()}.txt`);
writeFileSync(testHistoryFile, '# Initial history\n');

console.log('🧪 Testing Command Monitoring');
console.log(`Test history file: ${testHistoryFile}`);
console.log('');

// Set up environment for testing
process.env.ZIIT_API_KEY = 'test-key';
process.env.ZIIT_DRY_RUN = 'true';
process.env.ZIIT_VERBOSE = 'true';
process.env.ZIIT_WATCH_COMMANDS = 'true';
process.env.ZIIT_COMMAND_HISTORY = testHistoryFile;
process.env.ZIIT_DEBOUNCE_MS = '500'; // Faster for testing

// Import after setting env vars
const { CommandMonitor } = await import('./command-monitor');

const monitor = new CommandMonitor({
  enabled: true,
  historyFile: testHistoryFile,
  includeCommands: [],
  ignoreCommands: ['cd', 'ls', 'pwd'],
  debounceMs: 500,
  verbose: true,
});

let receivedCommands: any[] = [];

// Start monitoring
await monitor.start((events) => {
  console.log(`📬 Received ${events.length} command event(s):`);
  for (const event of events) {
    console.log(`  - ${event.command} (${new Date(event.timestamp).toISOString()})`);
    receivedCommands.push(event);
  }
});

console.log('✅ Command monitor started');
console.log('');

// Simulate command execution by appending to history
console.log('📝 Simulating command execution...');

// Test 1: Commands that should be tracked
console.log('Test 1: Adding trackable commands');
writeFileSync(testHistoryFile, readFileSync(testHistoryFile, 'utf-8') + 'git status\n', 'utf-8');
await new Promise(resolve => setTimeout(resolve, 100));

writeFileSync(testHistoryFile, readFileSync(testHistoryFile, 'utf-8') + 'npm run build\n', 'utf-8');
await new Promise(resolve => setTimeout(resolve, 100));

writeFileSync(testHistoryFile, readFileSync(testHistoryFile, 'utf-8') + 'docker ps\n', 'utf-8');
await new Promise(resolve => setTimeout(resolve, 100));

// Test 2: Commands that should be ignored
console.log('Test 2: Adding ignorable commands');
writeFileSync(testHistoryFile, readFileSync(testHistoryFile, 'utf-8') + 'cd /tmp\n', 'utf-8');
await new Promise(resolve => setTimeout(resolve, 100));

writeFileSync(testHistoryFile, readFileSync(testHistoryFile, 'utf-8') + 'ls -la\n', 'utf-8');
await new Promise(resolve => setTimeout(resolve, 100));

// Wait for debouncing
console.log('⏳ Waiting for debounce...');
await new Promise(resolve => setTimeout(resolve, 1000));

// Test heartbeat creation
console.log('');
console.log('📊 Testing heartbeat creation:');
if (receivedCommands.length > 0) {
  const testEvent = receivedCommands[0];
  const heartbeat = CommandMonitor.createHeartbeat(
    testEvent,
    'test/project',
    'test-editor',
    'main'
  );
  console.log('Sample heartbeat:', JSON.stringify(heartbeat, null, 2));
}

// Clean up
monitor.stop();
console.log('');
console.log('🧹 Cleaning up...');
try {
  unlinkSync(testHistoryFile);
  console.log('✅ Test history file removed');
} catch (error) {
  console.error('⚠️  Failed to remove test file:', error);
}

// Summary
console.log('');
console.log('📈 Test Summary:');
console.log(`Total commands received: ${receivedCommands.length}`);
console.log(`Expected: 3 trackable commands (git, npm, docker)`);
console.log(`Ignored commands should not appear: cd, ls`);
console.log('');

if (receivedCommands.length === 3) {
  const commands = receivedCommands.map(e => e.command.split(' ')[0]);
  if (commands.includes('git') && commands.includes('npm') && commands.includes('docker')) {
    console.log('✅ Test PASSED: All expected commands tracked, ignored commands filtered');
    process.exit(0);
  }
}

console.log('❌ Test FAILED: Unexpected number of commands or missing commands');
console.log('Received commands:', receivedCommands.map(e => e.command));
process.exit(1);
