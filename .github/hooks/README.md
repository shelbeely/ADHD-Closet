# GitHub Copilot Hooks for Ziit Heartbeat

This directory contains GitHub Copilot hooks that integrate Ziit.app heartbeat tracking into Copilot coding agent sessions.

## Overview

We upgraded from a background watch daemon to GitHub Copilot's native hook system, using **all 6 available hook types** for comprehensive activity tracking:

- ✅ `sessionStart` - When sessions begin
- ✅ `sessionEnd` - When sessions end
- ✅ `userPromptSubmitted` - User interactions
- ✅ `preToolUse` - Before tool execution
- ✅ `postToolUse` - After tool execution (with results)
- ✅ `errorOccurred` - Error tracking

This provides complete coverage of Copilot agent activity without requiring daemon management.

## Files

- **`hooks.json`** - Hook configuration file that defines which hooks to execute and when
- **`ziit-heartbeat.js`** - Node.js script that sends heartbeats to Ziit.app

## How It Works

GitHub Copilot automatically executes hooks at configured lifecycle events during agent sessions. This enables passive tracking of coding activity without requiring a background daemon.

### Hook Events

We use all 6 available hook types for comprehensive coverage:

| Hook | When It Runs | What We Track |
|------|-------------|---------------|
| `sessionStart` | Session begins or resumes | Session start event with source (new/resume/startup) |
| `sessionEnd` | Session completes or terminates | Session end event with reason (complete/error/abort/timeout/user_exit) |
| `userPromptSubmitted` | User submits a prompt | User interaction - tracks prompt text (truncated to 100 chars) |
| `preToolUse` | Before any tool executes | File edits, bash commands, and other tool uses |
| `postToolUse` | After tool completes | Tool execution results (success/failure/denied) |
| `errorOccurred` | Error during execution | Error name and message for debugging |

### Heartbeat Data

Each heartbeat sent to Ziit.app includes:

```javascript
{
  timestamp: 1704614400000,      // Unix timestamp in milliseconds
  project: "owner/repo",          // GitHub repository
  language: "TypeScript",         // Detected from file extension or command
  editor: "github-copilot-agent", // Editor identifier
  os: "linux",                    // Operating system
  file: "app/page.tsx",           // File path or event description
  branch: "main"                  // Git branch
}
```

### Language Detection

- **File operations**: Detected from file extension (`.ts` → TypeScript, `.py` → Python, etc.)
- **Bash commands**: Detected from command name (`git` → Git, `npm` → JavaScript, etc.)
- **Session events**: Labeled as "Session"
- **User prompts**: Labeled as "Interaction"
- **Errors**: Labeled as "Error"

### Filtering

The script automatically filters noisy commands to reduce spam:
- Ignored commands: `cd`, `ls`, `pwd`, `clear`, `exit`, `history`, `echo`, `cat`
- Long commands and prompts are truncated to 100 characters
- Tool results include success/failure status prefix

## Configuration

### Environment Variables

Hooks receive environment variables defined in `hooks.json`:

- **`ZIIT_API_KEY`** (required): Your Ziit API key from https://ziit.app/settings
- **`ZIIT_BASE_URL`** (optional): API base URL (default: `https://ziit.app`)
- **`ZIIT_EDITOR`** (optional): Editor identifier (default: `github-copilot-agent`)
- **`ZIIT_VERBOSE`** (optional): Enable verbose logging (default: `false`)

### GitHub Repository Secrets

The `ZIIT_API_KEY` must be stored as a repository secret:

1. Go to **Settings** → **Secrets and variables** → **Codespaces**
2. Click **New repository secret**
3. Name: `ZIIT_API_KEY`
4. Value: Your API key from Ziit.app

## Testing Hooks Locally

You can test hooks locally by piping test input into the script:

```bash
# Test session start
echo '{"timestamp":1704614400000,"cwd":"/tmp","source":"new","initialPrompt":"Create a feature"}' | node .github/hooks/ziit-heartbeat.js

# Test file edit (preToolUse)
echo '{"timestamp":1704614400000,"cwd":"/tmp","toolName":"edit","toolArgs":"{\"path\":\"/tmp/app/page.tsx\"}"}' | node .github/hooks/ziit-heartbeat.js

# Test bash command
echo '{"timestamp":1704614400000,"cwd":"/tmp","toolName":"bash","toolArgs":"{\"command\":\"npm test\"}"}' | node .github/hooks/ziit-heartbeat.js

# Test error
echo '{"timestamp":1704614400000,"cwd":"/tmp","error":{"message":"Network timeout","name":"TimeoutError"}}' | node .github/hooks/ziit-heartbeat.js
```

## Debugging

Enable verbose mode to see detailed output:

```bash
export ZIIT_VERBOSE=true
# Then run Copilot or test the hook manually
```

Check Copilot session logs for hook execution details. Hooks are designed to never block the agent - they always exit with code 0 even on errors.

## Advantages Over Daemon

The hooks approach has several advantages over the watch daemon:

1. **Native integration** - No background process management needed
2. **More reliable** - Executed directly by Copilot's hook system
3. **Exact tracking** - Captures exact tool usage, not filesystem changes
4. **Lower overhead** - Runs only on events, not continuously
5. **Session-aware** - Tracks session lifecycle events
6. **Error tracking** - Captures agent errors for debugging

## Further Reading

- [GitHub Copilot Hooks Documentation](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/use-hooks)
- [Hooks Configuration Reference](https://docs.github.com/en/copilot/reference/hooks-configuration)
- [Ziit.app Documentation](https://docs.ziit.app)
- [Main Ziit README](../../app/scripts/ziit/README.md)
