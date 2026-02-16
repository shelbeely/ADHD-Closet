#!/usr/bin/env node
/**
 * Pre Tool Use Hook
 * 
 * Runs before a tool is executed
 * - Logs commands being executed
 * - Tracks tool usage patterns
 */

const fs = require('fs');

// Load utilities
const { getSessionId, loadSession, addEvent, updateSession } = require('../../scripts/hooks/telemetry');

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
    
    const toolName = input.toolName;
    let toolArgs = input.toolArgs;
    
    // Parse args if string
    try {
      if (typeof toolArgs === 'string') {
        toolArgs = JSON.parse(toolArgs);
      }
    } catch {
      // Keep as string if parsing fails
    }
    
    // Track bash commands
    if (toolName === 'bash' && toolArgs?.command) {
      const command = toolArgs.command;
      
      const sessionId = getSessionId();
      const session = loadSession(sessionId);
      
      if (session) {
        // Track commands
        if (!session.commandsExecuted) session.commandsExecuted = [];
        session.commandsExecuted.push({
          timestamp: Date.now(),
          command: command.substring(0, 200), // Truncate long commands
        });
        
        updateSession(sessionId, session);
        
        // Add event
        addEvent(sessionId, {
          type: 'command-execution',
          command: command.substring(0, 200),
        });
      }
      
      // Log for visibility
      if (process.env.HOOK_VERBOSE === 'true') {
        console.log(`[PreToolUse] Command: ${command}`);
      }
    }
    
    // Track file operations
    if (['edit', 'create', 'view'].includes(toolName) && toolArgs?.path) {
      if (process.env.HOOK_VERBOSE === 'true') {
        console.log(`[PreToolUse] ${toolName}: ${toolArgs.path}`);
      }
    }
    
  } catch (error) {
    console.error('[PreToolUse] Error:', error.message);
    // Don't fail the hook
  }
  
  process.exit(0);
}

main();
