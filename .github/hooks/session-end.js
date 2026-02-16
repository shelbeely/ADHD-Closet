#!/usr/bin/env node
/**
 * Session End Hook
 * 
 * Runs at the end of a Copilot session
 * - Generates session summary
 * - Updates repository knowledge
 * - Persists telemetry
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load utilities
const { getSessionId, loadSession, endSession, getSessionSummary } = require('../../scripts/hooks/telemetry');
const { updateKnowledge } = require('../../scripts/hooks/knowledge-updater');

/**
 * Generate markdown summary
 */
function generateMarkdownSummary(summary) {
  const lines = [
    '# Copilot Session Summary',
    '',
    `**Session ID:** ${summary.sessionId}`,
    `**Start Time:** ${summary.startTime}`,
    `**End Time:** ${summary.endTime}`,
    `**Duration:** ${Math.round(summary.duration / 1000)}s`,
    '',
    '## Activity',
    '',
    `- **Events:** ${summary.eventCount}`,
    `- **Files Changed:** ${summary.filesChanged?.length || 0}`,
    `- **Commands Executed:** ${summary.commandsExecuted?.length || 0}`,
    `- **Errors Occurred:** ${summary.errorsOccurred?.length || 0}`,
    '',
  ];
  
  if (summary.eventTypes && Object.keys(summary.eventTypes).length > 0) {
    lines.push('## Event Types');
    lines.push('');
    for (const [type, count] of Object.entries(summary.eventTypes)) {
      lines.push(`- **${type}:** ${count}`);
    }
    lines.push('');
  }
  
  if (summary.filesChanged && summary.filesChanged.length > 0) {
    lines.push('## Files Changed');
    lines.push('');
    summary.filesChanged.slice(0, 20).forEach(file => {
      lines.push(`- \`${file}\``);
    });
    if (summary.filesChanged.length > 20) {
      lines.push(`- _...and ${summary.filesChanged.length - 20} more_`);
    }
    lines.push('');
  }
  
  if (summary.commandsExecuted && summary.commandsExecuted.length > 0) {
    lines.push('## Commands Executed');
    lines.push('');
    summary.commandsExecuted.slice(0, 10).forEach(cmd => {
      const cmdStr = typeof cmd === 'string' ? cmd : cmd.command;
      lines.push(`- \`${cmdStr}\``);
    });
    if (summary.commandsExecuted.length > 10) {
      lines.push(`- _...and ${summary.commandsExecuted.length - 10} more_`);
    }
    lines.push('');
  }
  
  if (summary.errorsOccurred && summary.errorsOccurred.length > 0) {
    lines.push('## Errors');
    lines.push('');
    summary.errorsOccurred.forEach(err => {
      const name = typeof err === 'string' ? err : err.name;
      const message = typeof err === 'string' ? '' : err.message;
      lines.push(`- **${name}:** ${message}`);
    });
    lines.push('');
  }
  
  return lines.join('\n');
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
    
    const sessionId = getSessionId();
    const reason = input.reason || 'unknown';
    
    console.log('[SessionEnd] Finalizing session...');
    
    // End session in telemetry
    const session = endSession(sessionId, {
      reason,
    });
    
    // Generate summary
    const summary = getSessionSummary(sessionId);
    
    if (summary) {
      // Save markdown summary
      const summaryPath = path.join(__dirname, '../telemetry/sessions', `${sessionId}-summary.md`);
      const markdownSummary = generateMarkdownSummary(summary);
      fs.writeFileSync(summaryPath, markdownSummary);
      console.log(`[SessionEnd] Summary saved: ${summaryPath}`);
      
      // Update knowledge if files changed
      if (summary.filesChanged && summary.filesChanged.length > 0) {
        console.log('[SessionEnd] Updating repository knowledge...');
        try {
          const knowledgeResult = updateKnowledge();
          if (knowledgeResult) {
            console.log(`[SessionEnd] Knowledge updated: ${knowledgeResult.summaryFile}`);
          }
        } catch (error) {
          console.error('[SessionEnd] Failed to update knowledge:', error.message);
        }
      }
      
      const duration = Date.now() - startTime;
      
      // Print summary
      console.log('[SessionEnd] ✓ Session finalized');
      console.log(`  Session ID: ${sessionId}`);
      console.log(`  Duration: ${Math.round(summary.duration / 1000)}s`);
      console.log(`  Events: ${summary.eventCount}`);
      console.log(`  Files Changed: ${summary.filesChanged?.length || 0}`);
      console.log(`  Commands: ${summary.commandsExecuted?.length || 0}`);
      console.log(`  Errors: ${summary.errorsOccurred?.length || 0}`);
      console.log(`  Finalization Time: ${duration}ms`);
    } else {
      console.warn('[SessionEnd] No session data found');
    }
    
  } catch (error) {
    console.error('[SessionEnd] Error:', error.message);
    // Don't fail the hook
  }
  
  process.exit(0);
}

main();
