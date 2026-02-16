#!/usr/bin/env node
/**
 * Runtime Detector Utility
 * 
 * Detects available JavaScript runtime (bun vs npm/node)
 * Used by hooks to choose the appropriate package manager
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Check if a command exists
 */
function commandExists(command) {
  try {
    execSync(`which ${command}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get runtime version
 */
function getVersion(command) {
  try {
    const version = execSync(`${command} --version`, { encoding: 'utf8' }).trim();
    return version;
  } catch {
    return 'unknown';
  }
}

/**
 * Check if project prefers bun (via packageManager field)
 */
function projectPrefersBun(cwd) {
  try {
    const pkgPath = path.join(cwd, 'app', 'package.json');
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      return pkg.packageManager?.startsWith('bun');
    }
  } catch {
    // Ignore errors
  }
  return false;
}

/**
 * Detect runtime
 * Returns: { runtime: 'bun' | 'npm', command: string, version: string, available: string[] }
 */
function detectRuntime(cwd = process.cwd()) {
  const hasBun = commandExists('bun');
  const hasNpm = commandExists('npm');
  const prefersBun = projectPrefersBun(cwd);
  
  const available = [];
  if (hasBun) available.push('bun');
  if (hasNpm) available.push('npm');
  
  // Prefer bun if available and project uses it
  if (hasBun && prefersBun) {
    return {
      runtime: 'bun',
      command: 'bun',
      version: getVersion('bun'),
      available,
    };
  }
  
  // Fall back to npm if available
  if (hasNpm) {
    return {
      runtime: 'npm',
      command: 'npm',
      version: getVersion('npm'),
      available,
    };
  }
  
  // Fall back to bun if only bun available
  if (hasBun) {
    return {
      runtime: 'bun',
      command: 'bun',
      version: getVersion('bun'),
      available,
    };
  }
  
  // No runtime available
  return {
    runtime: 'none',
    command: null,
    version: null,
    available,
  };
}

// Allow usage as module or CLI
if (require.main === module) {
  const runtime = detectRuntime();
  console.log(JSON.stringify(runtime, null, 2));
} else {
  module.exports = { detectRuntime, commandExists };
}
