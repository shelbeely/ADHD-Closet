#!/usr/bin/env node
/**
 * Post Tool Use Hook
 * 
 * Runs after a tool is executed
 * - Detects file edits
 * - Runs lint/format on changed files
 * - Runs type checks
 * - Records changes in telemetry
 */

const fs = require('fs');
const path = require('path');

// Load utilities
const { validateFiles } = require('../../scripts/hooks/file-validator');
const { getSessionId, loadSession, addEvent, updateSession } = require('../../scripts/hooks/telemetry');

const REPO_ROOT = path.join(__dirname, '../..');

/**
 * Extract file paths from tool usage
 */
function extractFilePaths(toolName, toolArgs) {
  const files = [];
  
  try {
    let args = toolArgs;
    if (typeof toolArgs === 'string') {
      args = JSON.parse(toolArgs);
    }
    
    // File operations
    if (['edit', 'create', 'view'].includes(toolName) && args.path) {
      files.push(args.path);
    }
    
    // Multiple file operations
    if (toolName === 'fill_form' && args.fields) {
      args.fields.forEach(field => {
        if (field.path) files.push(field.path);
      });
    }
  } catch (error) {
    // Ignore parsing errors
  }
  
  return files;
}

/**
 * Should validate this tool usage?
 */
function shouldValidate(toolName, resultType) {
  // Only validate successful file edits
  const editTools = ['edit', 'create'];
  const successTypes = ['success', 'content'];
  
  return editTools.includes(toolName) && successTypes.includes(resultType);
}

/**
 * Convert absolute paths to relative
 */
function toRelativePath(filePath) {
  if (filePath.startsWith(REPO_ROOT)) {
    return filePath.substring(REPO_ROOT.length + 1);
  }
  return filePath;
}

/**
 * Main function
 */
async function main() {
  const startTime = Date.now();
  
  try {
    // Read hook input from stdin
    const inputData = fs.readFileSync(0, 'utf-8');
    if (!inputData.trim()) {
      process.exit(0);
    }
    
    const input = JSON.parse(inputData);
    
    const toolName = input.toolName;
    const toolArgs = input.toolArgs;
    const toolResult = input.toolResult || {};
    const resultType = toolResult.resultType || 'unknown';
    
    // Check if we should validate
    if (!shouldValidate(toolName, resultType)) {
      process.exit(0);
    }
    
    // Extract file paths
    const files = extractFilePaths(toolName, toolArgs);
    if (files.length === 0) {
      process.exit(0);
    }
    
    const relativeFiles = files.map(toRelativePath);
    
    console.log(`[PostToolUse] Validating ${files.length} files...`);
    
    // Validate files
    const validation = validateFiles(relativeFiles);
    
    // Update telemetry
    const sessionId = getSessionId();
    let session = loadSession(sessionId);
    
    if (session) {
      // Track changed files
      if (!session.filesChanged) session.filesChanged = [];
      relativeFiles.forEach(f => {
        if (!session.filesChanged.includes(f)) {
          session.filesChanged.push(f);
        }
      });
      
      // Track validation results
      if (!session.validations) session.validations = [];
      session.validations.push({
        timestamp: Date.now(),
        files: relativeFiles,
        result: validation,
      });
      
      updateSession(sessionId, session);
      
      // Add event
      addEvent(sessionId, {
        type: 'file-validation',
        toolName,
        files: relativeFiles,
        validation,
      });
    }
    
    const duration = Date.now() - startTime;
    
    // Print results
    if (validation.success) {
      console.log(`[PostToolUse] ✓ Validation passed (${duration}ms)`);
    } else {
      console.log(`[PostToolUse] ✗ Validation failed (${duration}ms)`);
      
      if (validation.lint && !validation.lint.success) {
        console.log('[PostToolUse] Lint errors:');
        console.log(validation.lint.errors);
      }
      
      if (validation.typeCheck && !validation.typeCheck.success) {
        console.log('[PostToolUse] Type errors:');
        console.log(validation.typeCheck.errors);
      }
    }
    
  } catch (error) {
    console.error('[PostToolUse] Error:', error.message);
    // Don't fail the hook
  }
  
  process.exit(0);
}

main();
