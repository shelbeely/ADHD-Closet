#!/usr/bin/env node
/**
 * Ziit Heartbeat Hook Script
 * 
 * Sends heartbeats to Ziit.app from GitHub Copilot hooks.
 * Uses fetch API available in Node.js 18+
 */

/**
 * Send a single heartbeat to Ziit
 */
async function sendHeartbeat(data) {
  const apiKey = process.env.ZIIT_API_KEY;
  const baseUrl = process.env.ZIIT_BASE_URL || 'https://ziit.app';

  if (!apiKey) {
    console.error('[Ziit] ZIIT_API_KEY not set, skipping heartbeat');
    return false;
  }

  try {
    const response = await fetch(`${baseUrl}/api/external/heartbeat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => 'Unknown error');
      console.error(`[Ziit] Heartbeat failed (${response.status}): ${text}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Ziit] Heartbeat error:', error.message);
    return false;
  }
}

/**
 * Get project name from git remote or environment
 */
async function getProjectName() {
  // Try GitHub environment variables first
  const ghRepo = process.env.GITHUB_REPOSITORY;
  if (ghRepo) return ghRepo;

  // Fall back to git remote
  try {
    const { execSync } = require('child_process');
    const remote = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
    const match = remote.match(/github\.com[:/](.+?)(?:\.git)?$/);
    return match ? match[1] : 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * Get current branch from git or environment
 */
async function getBranch() {
  // Try GitHub environment variables first
  const ghRef = process.env.GITHUB_REF_NAME;
  if (ghRef) return ghRef;

  // Fall back to git
  try {
    const { execSync } = require('child_process');
    return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}

/**
 * Detect language from file extension
 */
function detectLanguage(file) {
  const ext = file.split('.').pop()?.toLowerCase();
  const languageMap = {
    ts: 'TypeScript',
    tsx: 'TypeScript',
    js: 'JavaScript',
    jsx: 'JavaScript',
    py: 'Python',
    sql: 'SQL',
    prisma: 'Prisma',
    css: 'CSS',
    scss: 'SCSS',
    html: 'HTML',
    md: 'Markdown',
    yml: 'YAML',
    yaml: 'YAML',
    json: 'JSON',
  };
  return languageMap[ext] || 'Unknown';
}

/**
 * Detect language from command
 */
function detectLanguageFromCommand(command) {
  const firstWord = command.split(' ')[0];
  const commandMap = {
    git: 'Git',
    npm: 'JavaScript',
    yarn: 'JavaScript',
    bun: 'JavaScript',
    node: 'JavaScript',
    npx: 'JavaScript',
    python: 'Python',
    python3: 'Python',
    pip: 'Python',
    docker: 'Docker',
    cargo: 'Rust',
    go: 'Go',
    make: 'Make',
    bash: 'Bash',
    sh: 'Bash',
  };
  return commandMap[firstWord] || 'Shell';
}

/**
 * Main hook handler
 */
async function main() {
  try {
    // Read input from stdin synchronously
    const fs = require('fs');
    const inputData = fs.readFileSync(0, 'utf-8'); // 0 is stdin file descriptor
    
    if (!inputData.trim()) {
      console.error('[Ziit] No input data received');
      process.exit(0);
    }
    
    const input = JSON.parse(inputData);

    // Convert timestamp to ISO 8601 format (required by Ziit API)
    const timestamp = input.timestamp || Date.now();
    const timestampISO = typeof timestamp === 'number'
      ? new Date(timestamp).toISOString()
      : timestamp; // Already a string (assume ISO format)
    
    const cwd = input.cwd || process.cwd();
    const editor = process.env.ZIIT_EDITOR || 'github-copilot-agent';
    const os = process.platform;
    
    // Get project and branch synchronously
    let project = 'unknown';
    let branch = 'unknown';
    
    try {
      const { execSync } = require('child_process');
      const ghRepo = process.env.GITHUB_REPOSITORY;
      if (ghRepo) {
        project = ghRepo;
      } else {
        const remote = execSync('git remote get-url origin 2>/dev/null', { encoding: 'utf8' }).trim();
        const match = remote.match(/github\.com[:/](.+?)(?:\.git)?$/);
        project = match ? match[1] : 'unknown';
      }
      
      const ghRef = process.env.GITHUB_REF_NAME;
      if (ghRef) {
        branch = ghRef;
      } else {
        branch = execSync('git rev-parse --abbrev-ref HEAD 2>/dev/null', { encoding: 'utf8' }).trim();
      }
    } catch (error) {
      // Keep defaults if git commands fail
    }

    // Determine heartbeat based on hook type
    let heartbeat = null;

    // User prompt submitted
    if (input.prompt) {
      // Track user prompts as interaction events
      heartbeat = {
        timestamp: timestampISO,
        project,
        language: 'Interaction',
        editor,
        os,
        file: `[prompt] ${input.prompt.substring(0, 100)}`, // Truncate long prompts
        branch,
      };
    }
    // Error occurred
    else if (input.error) {
      const errorMsg = input.error.message || 'Unknown error';
      const errorName = input.error.name || 'Error';
      heartbeat = {
        timestamp: timestampISO,
        project,
        language: 'Error',
        editor,
        os,
        file: `[${errorName}] ${errorMsg.substring(0, 100)}`,
        branch,
      };
    }
    // Tool use hooks (pre and post)
    else if (input.toolName) {
      const toolName = input.toolName;
      let toolArgs = {};
      
      try {
        toolArgs = typeof input.toolArgs === 'string' 
          ? JSON.parse(input.toolArgs) 
          : input.toolArgs || {};
      } catch {
        // If parsing fails, use empty object
      }

      // Check if this is postToolUse (has toolResult)
      const isPostTool = !!input.toolResult;
      const resultType = input.toolResult?.resultType || 'unknown';

      // File operations (edit, create, view)
      if (['edit', 'create', 'view'].includes(toolName) && toolArgs.path) {
        const file = toolArgs.path.replace(cwd + '/', '');
        const prefix = isPostTool ? `[${resultType}] ` : '';
        heartbeat = {
          timestamp: timestampISO,
          project,
          language: detectLanguage(file),
          editor,
          os,
          file: prefix + file,
          branch,
        };
      }
      // Bash commands
      else if (toolName === 'bash' && toolArgs.command) {
        const command = toolArgs.command;
        // Filter out noisy commands
        const ignoreCommands = ['cd', 'ls', 'pwd', 'clear', 'exit', 'history', 'echo', 'cat'];
        const firstWord = command.split(' ')[0];
        
        if (!ignoreCommands.includes(firstWord)) {
          const prefix = isPostTool ? `[${resultType}] ` : '';
          heartbeat = {
            timestamp: timestampISO,
            project,
            language: detectLanguageFromCommand(command),
            editor,
            os,
            file: `${prefix}[command] ${command.substring(0, 100)}`, // Truncate long commands
            branch,
          };
        }
      }
    }
    // Session events
    else if (input.source || input.reason) {
      const eventType = input.source ? `session-start-${input.source}` : `session-end-${input.reason}`;
      heartbeat = {
        timestamp: timestampISO,
        project,
        language: 'Session',
        editor,
        os,
        file: `[${eventType}]`,
        branch,
      };
    }

    // Send heartbeat if we have one
    if (heartbeat) {
      const success = await sendHeartbeat(heartbeat);
      if (success && process.env.ZIIT_VERBOSE === 'true') {
        console.log(`[Ziit ✓] Sent heartbeat: ${heartbeat.file}`);
      }
    }

  } catch (error) {
    console.error('[Ziit] Hook error:', error.message);
    // Don't fail the hook on errors
  }

  // Always exit 0 to not block the agent
  process.exit(0);
}

main();
