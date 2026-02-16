#!/usr/bin/env node
/**
 * Error Occurred Hook
 * 
 * Runs when an error occurs
 * - Captures error details
 * - Tracks error patterns
 * - Provides debugging context
 */

const fs = require('fs');

// Load utilities
const { getSessionId, loadSession, addEvent, updateSession, appendMetric } = require('../../scripts/hooks/telemetry');

/**
 * Main function
 */
async function main() {
  try {
    // Read hook input from stdin
    const inputData = fs.readFileSync(0, 'utf-8');
    if (!inputData.trim()) {
      process.exit(0);
    }
    
    const input = JSON.parse(inputData);
    
    const error = input.error || {};
    const errorName = error.name || 'UnknownError';
    const errorMessage = error.message || 'No error message';
    const errorStack = error.stack || '';
    
    const sessionId = getSessionId();
    const session = loadSession(sessionId);
    
    if (session) {
      // Track errors
      if (!session.errorsOccurred) session.errorsOccurred = [];
      session.errorsOccurred.push({
        timestamp: Date.now(),
        name: errorName,
        message: errorMessage.substring(0, 500), // Truncate long messages
      });
      
      updateSession(sessionId, session);
      
      // Add event
      addEvent(sessionId, {
        type: 'error',
        errorName,
        errorMessage: errorMessage.substring(0, 500),
      });
      
      // Add metric
      appendMetric({
        type: 'error',
        errorName,
        sessionId,
      });
    }
    
    // Log for visibility
    console.error(`[ErrorOccurred] ${errorName}: ${errorMessage}`);
    
    // Print stack trace if verbose
    if (process.env.HOOK_VERBOSE === 'true' && errorStack) {
      console.error('[ErrorOccurred] Stack trace:');
      console.error(errorStack.split('\n').slice(0, 10).join('\n')); // First 10 lines
    }
    
  } catch (error) {
    console.error('[ErrorOccurred] Hook error:', error.message);
    // Don't fail the hook
  }
  
  process.exit(0);
}

main();
