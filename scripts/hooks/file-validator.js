#!/usr/bin/env node
/**
 * File Validator
 * 
 * Runs linting and type checking on changed files
 * Used by postToolUse hook to validate edits
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const APP_DIR = path.join(__dirname, '../../app');

/**
 * Check if file should be linted
 */
function shouldLint(file) {
  const extensions = ['.ts', '.tsx', '.js', '.jsx'];
  const ext = path.extname(file);
  return extensions.includes(ext);
}

/**
 * Check if file should be type-checked
 */
function shouldTypeCheck(file) {
  const extensions = ['.ts', '.tsx'];
  const ext = path.extname(file);
  return extensions.includes(ext);
}

/**
 * Run eslint on specific files
 */
function lintFiles(files) {
  const lintableFiles = files.filter(shouldLint);
  
  if (lintableFiles.length === 0) {
    return { success: true, skipped: true, message: 'No files to lint' };
  }
  
  try {
    // Check if eslint is available
    const eslintPath = path.join(APP_DIR, 'node_modules/.bin/eslint');
    if (!fs.existsSync(eslintPath)) {
      return { success: true, skipped: true, message: 'ESLint not installed' };
    }
    
    // Run eslint on changed files
    const fileArgs = lintableFiles.map(f => `"${f}"`).join(' ');
    const command = `cd ${APP_DIR} && npx eslint ${fileArgs} --quiet`;
    
    execSync(command, { 
      encoding: 'utf8',
      stdio: 'pipe',
    });
    
    return { 
      success: true, 
      skipped: false, 
      filesChecked: lintableFiles.length,
      message: `Linted ${lintableFiles.length} files successfully`,
    };
  } catch (error) {
    return { 
      success: false, 
      skipped: false,
      filesChecked: lintableFiles.length,
      message: 'Lint errors found',
      errors: error.stdout || error.message,
    };
  }
}

/**
 * Run TypeScript type check on specific files
 */
function typeCheckFiles(files) {
  const typeCheckableFiles = files.filter(shouldTypeCheck);
  
  if (typeCheckableFiles.length === 0) {
    return { success: true, skipped: true, message: 'No TypeScript files to check' };
  }
  
  try {
    // Check if tsc is available
    const tscPath = path.join(APP_DIR, 'node_modules/.bin/tsc');
    if (!fs.existsSync(tscPath)) {
      return { success: true, skipped: true, message: 'TypeScript not installed' };
    }
    
    // Run tsc --noEmit to type-check without emitting files
    const fileArgs = typeCheckableFiles.map(f => `"${f}"`).join(' ');
    const command = `cd ${APP_DIR} && npx tsc --noEmit ${fileArgs}`;
    
    execSync(command, { 
      encoding: 'utf8',
      stdio: 'pipe',
    });
    
    return { 
      success: true, 
      skipped: false,
      filesChecked: typeCheckableFiles.length,
      message: `Type-checked ${typeCheckableFiles.length} files successfully`,
    };
  } catch (error) {
    return { 
      success: false, 
      skipped: false,
      filesChecked: typeCheckableFiles.length,
      message: 'Type errors found',
      errors: error.stdout || error.message,
    };
  }
}

/**
 * Validate files (lint + type check)
 */
function validateFiles(files) {
  console.log(`[Validator] Validating ${files.length} files...`);
  
  // Convert to relative paths from app directory
  const relativeFiles = files.map(f => {
    if (f.startsWith('app/')) {
      return f.substring(4); // Remove 'app/' prefix
    }
    return f;
  }).filter(f => {
    // Only validate files in app directory
    const fullPath = path.join(APP_DIR, f);
    return fs.existsSync(fullPath);
  });
  
  if (relativeFiles.length === 0) {
    return { 
      success: true, 
      skipped: true, 
      message: 'No app files to validate',
    };
  }
  
  const lintResult = lintFiles(relativeFiles);
  const typeCheckResult = typeCheckFiles(relativeFiles);
  
  const success = lintResult.success && typeCheckResult.success;
  
  return {
    success,
    lint: lintResult,
    typeCheck: typeCheckResult,
    filesValidated: relativeFiles.length,
  };
}

// Allow usage as module or CLI
if (require.main === module) {
  const files = process.argv.slice(2);
  
  if (files.length === 0) {
    console.error('Usage: node file-validator.js <file1> [file2] ...');
    process.exit(1);
  }
  
  const result = validateFiles(files);
  console.log(JSON.stringify(result, null, 2));
  
  process.exit(result.success ? 0 : 1);
} else {
  module.exports = { validateFiles, lintFiles, typeCheckFiles };
}
