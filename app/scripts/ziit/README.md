# Ziit Heartbeat Client

A lightweight, zero-dependency Bun.js client that tracks code file edits **and shell command execution**, sending activity heartbeats to [Ziit.app](https://ziit.app). Designed specifically for GitHub Copilot coding agent sessions.

## ⚠️ Important: What This Daemon Does NOT Do

**The Ziit daemon is a passive monitoring tool. It does NOT:**

- ❌ Execute Linux commands like `cd`, `ls`, `mkdir`, etc.
- ❌ Have a command interface or shell
- ❌ Run arbitrary user commands
- ❌ Process or interpret command input

**What it DOES do:**

- ✅ Monitor filesystem changes using `fs.watch()`
- ✅ Monitor shell command execution by watching bash history (optional, enabled via `ZIIT_WATCH_COMMANDS=true`)
- ✅ Run specific Git commands (`git status`, `git remote`, `git rev-parse`) internally to verify file modifications
- ✅ Send file change and command execution metadata to Ziit.app API

This is purely a **passive monitoring daemon** that tracks your coding activity (file edits and command execution) and reports it. It has no command execution capabilities beyond the specific Git commands it needs for verification.

## Features

- **Filesystem Monitoring**: Uses `fs.watch()` (Bun-compatible) for efficient change detection
- **Command Monitoring**: Watches bash history for command execution (optional, configurable)
- **Git-Aware**: Only reports files that are actually modified or untracked (verified via `git status` using `Bun.spawn()`)
- **Smart Filtering**: Includes only relevant code files and commands, ignores noise
- **Batched Git Checks**: Checks multiple files at once using `Bun.spawn()` for better performance
- **Debouncing**: Buffers bursts of events to avoid spam (configurable, default 2.5s)
- **Batch Sending**: Groups heartbeats for efficiency (configurable batch size, default 20)
- **Resilient**: Retries on network failures with exponential backoff, gracefully handles SIGINT/SIGTERM
- **Observability**: Tracks stats (files processed, commands processed, heartbeats sent, failures) with periodic reporting
- **Minimal Logging**: Clean stdout output with emoji indicators, errors logged but don't crash the daemon
- **Dry-Run Mode**: Test configuration without sending data (set `ZIIT_DRY_RUN=true`)
- **Verbose Mode**: Enable detailed logging for debugging (set `ZIIT_VERBOSE=true`)
- **Health Check**: Built-in diagnostic script to verify setup

## Environment Variables

### Required

- **`ZIIT_API_KEY`**: Your Ziit API key (get from [Ziit.app settings](https://ziit.app/settings))
  - **IMPORTANT**: Store as a GitHub repository secret named `ZIIT_API_KEY`

### Optional (with defaults)

| Variable | Default | Description |
|----------|---------|-------------|
| `ZIIT_BASE_URL` | `https://ziit.app` | Ziit API base URL |
| `ZIIT_DEBOUNCE_MS` | `2500` | Milliseconds to wait before processing file changes |
| `ZIIT_BATCH_SIZE` | `20` | Number of heartbeats to batch before sending |
| `ZIIT_FLUSH_MS` | `30000` | Milliseconds between automatic buffer flushes |
| `ZIIT_WORKDIR` | `process.cwd()` | Root directory to watch (auto-set in GitHub Actions) |
| `ZIIT_EDITOR` | `github-copilot-agent` | Editor name to report |
| `ZIIT_INCLUDE_DIRS` | `app/app,app/scripts,app/prisma,docs` | Comma-separated list of directories to watch |
| `ZIIT_INCLUDE_EXTS` | `ts,tsx,js,jsx,py,sql,prisma,css,scss,html,md,yml,yaml,json` | Comma-separated list of file extensions to track |
| `ZIIT_IGNORE` | `.git/,node_modules/,dist/,build/,coverage/,.next/,.turbo/` | Comma-separated list of paths to ignore |
| `ZIIT_DRY_RUN` | `false` | If `true`, logs heartbeats without sending to API |
| `ZIIT_VERBOSE` | `false` | If `true`, enables detailed debug logging |

### Command Monitoring (Optional)

| Variable | Default | Description |
|----------|---------|-------------|
| `ZIIT_WATCH_COMMANDS` | `false` | Enable command execution monitoring |
| `ZIIT_COMMAND_HISTORY` | `~/.bash_history` | Path to bash history file to monitor |
| `ZIIT_COMMAND_INCLUDE` | _(empty)_ | Comma-separated list of commands to track (empty = track all non-ignored) |
| `ZIIT_COMMAND_IGNORE` | `cd,ls,pwd,clear,exit,history,echo,cat,less,more,head,tail` | Comma-separated list of commands to ignore |

## Usage

### Local Development

1. **Get your Ziit API key** from [Ziit.app settings](https://ziit.app/settings)

2. **Run health check first**:
   ```bash
   cd app
   export ZIIT_API_KEY="your-api-key-here"
   bun run ziit:health
   ```
   
   This verifies your setup before starting the daemon.

3. **Send a test heartbeat** (recommended for first time):
   ```bash
   export ZIIT_API_KEY="your-api-key-here"
   bun run ziit:test
   ```
   
   This sends a single test heartbeat to verify your API key and network connectivity.
   You should see a success message and can check your activity at https://ziit.app/activity

4. **Test command monitoring** (optional):
   ```bash
   bun run ziit:test:commands
   ```
   
   This tests the command monitoring functionality in isolation to verify it works correctly.

5. **Start in dry-run mode** (optional):
   ```bash
   export ZIIT_DRY_RUN=true
   export ZIIT_VERBOSE=true
   bun run ziit:watch
   ```
   
   This shows what would be sent without actually sending data.

6. **Enable command monitoring** (optional):
   ```bash
   export ZIIT_WATCH_COMMANDS=true
   export ZIIT_VERBOSE=true
   bun run ziit:watch
   ```
   
   This enables tracking of shell commands in addition to file changes.

7. **Run the watch daemon for real**:
   ```bash
   export ZIIT_DRY_RUN=false  # or unset ZIIT_DRY_RUN
   bun run ziit:watch
   ```

8. **Test by editing a file**:
   - Edit any TypeScript file in `app/app/`
   - Save the file
   - Check terminal for `[Ziit ✓] Sent X heartbeat(s)` message

7. **Stop the daemon**: Press `Ctrl+C` (it will flush pending heartbeats before exiting)

### GitHub Copilot Agent Sessions

The daemon automatically starts in the background when a Copilot coding agent session begins.

**Setup** (already configured in this repository):

1. Add `ZIIT_API_KEY` as a repository secret:
   - Go to **Settings** → **Secrets and variables** → **Codespaces** → **New repository secret**
   - Name: `ZIIT_API_KEY`
   - Value: Your Ziit API key

2. The workflow `.github/workflows/copilot-setup-steps.yml` automatically:
   - Starts the daemon in the background
   - Passes required environment variables
   - Logs the daemon PID to `GITHUB_STEP_SUMMARY`

**Logs**:
- Daemon output: `/tmp/ziit-watch.log`
- View logs: `cat /tmp/ziit-watch.log`

## How It Works

### File Monitoring Flow

1. **File Monitoring**: Watches specified directories recursively using `fs.watch()` (fully supported by Bun.js)
2. **Filtering**: 
   - Checks if file is in included directories
   - Checks if file extension is in the include list
   - Ignores noisy directories (node_modules, .git, etc.)
   - Deduplicates events within debounce window
3. **Git Verification**: Runs `git status --porcelain=v1 -- <files...>` via `Bun.spawn()` to verify files are actually modified or untracked (batched for performance)
4. **Debouncing**: Collects distinct files touched during debounce period (default 2.5s)
5. **Buffering**: Queues heartbeats in memory with project metadata
6. **Batching**: Sends heartbeats in batches of 20 (or when buffer is full)
7. **Flushing**: Automatically flushes buffer every 30s
8. **Retry Logic**: On network failure, keeps heartbeats in buffer and retries with exponential backoff (1s, 2s, 4s, 8s... up to 60s)
9. **Stats Tracking**: Reports files processed, heartbeats sent, failures every minute

### Command Monitoring Flow (Optional)

When `ZIIT_WATCH_COMMANDS=true`:

1. **History Monitoring**: Watches `~/.bash_history` file for changes using `fs.watch()`
2. **Command Parsing**: When history file changes:
   - Reads new content from last read position
   - Parses new command entries
   - Extracts base command (first word)
3. **Filtering**: 
   - Checks against ignore list (cd, ls, pwd, etc.)
   - If include list is provided, only tracks specified commands
   - Otherwise tracks all non-ignored commands
4. **Language Detection**: Detects language from command:
   - `git` → Git
   - `npm`, `yarn`, `bun` → JavaScript
   - `python`, `python3` → Python
   - `docker` → Docker
   - etc.
5. **Debouncing**: Collects commands within debounce window
6. **Heartbeat Creation**: Creates heartbeat with format `[command] <full command>`
7. **Buffering & Sending**: Uses same buffer/batch system as file monitoring

**Example heartbeat for command:**
```json
{
  "timestamp": 1771213890906,
  "project": "shelbeely/ADHD-Closet",
  "language": "Git",
  "editor": "github-copilot-agent",
  "os": "linux",
  "file": "[command] git commit -m 'Add feature'",
  "branch": "main"
}
```

## API Endpoints

The client sends heartbeats to:

- **Single**: `POST https://ziit.app/api/external/heartbeat` ✅ Working
- **Batch**: `POST https://ziit.app/api/external/batch` ✅ Working (fixed to match official spec)

Authorization: `Bearer <ZIIT_API_KEY>`

**Note**: The batch endpoint now correctly sends an array of heartbeats directly (not wrapped in `{ heartbeats: [...] }`), matching the official Ziit API specification at https://docs.ziit.app/api/batch. The client includes fallback logic to send heartbeats individually if the batch endpoint is unavailable, ensuring reliability.

**Heartbeat payload**:
```json
{
  "timestamp": 1707972360000,
  "project": "shelbeely/ADHD-Closet",
  "language": "TypeScript",
  "editor": "github-copilot-agent",
  "os": "linux",
  "file": "app/app/api/items/route.ts",
  "branch": "copilot/add-ziit-client"
}
```

**Batch payload**:
```json
{
  "heartbeats": [
    { "timestamp": ..., "project": ..., ... },
    { "timestamp": ..., "project": ..., ... }
  ]
}
```

## Architecture

### Files

- **`ziit.ts`**: Minimal API client (ZiitClient class)
- **`watch-daemon.ts`**: Filesystem watcher daemon (main entry point)
- **`health-check.ts`**: Diagnostic script to verify setup
- **`test-heartbeat.ts`**: Send a single test heartbeat to verify integration
- **`README.md`**: This file

### Scripts

Run from `app/` directory:

- **`bun run ziit:watch`**: Start the watch daemon
- **`bun run ziit:health`**: Run health check diagnostic
- **`bun run ziit:test`**: Send a test heartbeat to verify integration

### Zero Dependencies

This client uses only Bun.js-compatible APIs:
- `fs.watch()` for filesystem monitoring (Bun-compatible, recursive watching)
- `fs.statSync()` for file/directory checks
- `Bun.spawn()` for spawning git processes (Bun-native)
- `fetch()` for HTTP requests (Bun-native)
- Custom path manipulation functions (no dependencies)

No external packages required. **100% Bun.js compatible.**

## Troubleshooting

### Quick Test

To quickly verify your Ziit integration is working:

```bash
cd app
export ZIIT_API_KEY="your-api-key-here"
bun run ziit:test
```

This sends a single test heartbeat and reports success/failure immediately.
If successful, check https://ziit.app/activity to see the heartbeat.

### Daemon not starting

1. **Run health check**:
   ```bash
   cd app
   export ZIIT_API_KEY="your-key"
   bun run ziit:health
   ```
   This will identify configuration issues.

2. **Enable verbose logging**:
   ```bash
   export ZIIT_VERBOSE=true
   bun run ziit:watch
   ```

### Daemon not sending heartbeats

1. **Check API key**: Ensure `ZIIT_API_KEY` is set correctly
2. **Check file paths**: Verify you're editing files in included directories
3. **Check git status**: File must show in `git status` as modified or untracked
4. **Check logs**: View `/tmp/ziit-watch.log` for errors (in GitHub Actions)
5. **Try dry-run mode**:
   ```bash
   export ZIIT_DRY_RUN=true
   export ZIIT_VERBOSE=true
   bun run ziit:watch
   # Edit a file and see if it's detected
   ```

### Too many heartbeats

- Increase `ZIIT_DEBOUNCE_MS` to wait longer before processing events
- Adjust `ZIIT_INCLUDE_DIRS` to watch fewer directories
- Adjust `ZIIT_INCLUDE_EXTS` to track fewer file types

### Not enough heartbeats

- Decrease `ZIIT_DEBOUNCE_MS` for more responsive tracking
- Add directories to `ZIIT_INCLUDE_DIRS`
- Add file extensions to `ZIIT_INCLUDE_EXTS`

## Frequently Asked Questions

### Does the daemon recognize or execute Linux commands like 'cd'?

**No.** The Ziit daemon is a passive monitoring tool that does NOT execute user commands or have any command interface. 

**What it does:**
1. Monitors filesystem changes using Node.js `fs.watch()` API
2. **Optionally monitors when YOU run commands** by watching bash history file (enable with `ZIIT_WATCH_COMMANDS=true`)
3. Runs specific Git commands internally (`git status`, `git remote get-url`, `git rev-parse`) to verify which files are modified
4. Sends file change and command execution metadata to Ziit.app API

It cannot and will not execute arbitrary Linux commands, shell scripts, or interpret user command input. It's purely for tracking your activity (file edits and command execution).

### How does command monitoring work?

When `ZIIT_WATCH_COMMANDS=true`, the daemon watches `~/.bash_history` for new entries. When you run a command in your shell:

1. Bash appends it to the history file
2. The daemon detects the file change
3. Parses the new command
4. Checks if it should be tracked (based on include/ignore lists)
5. Sends a heartbeat with the command info

**The daemon does NOT execute the command** - it only sees that you ran it.

### What commands does it actually run internally?

The daemon internally runs only these three Git commands via `Bun.spawn()`:

- `git remote get-url origin` - Once at startup to detect project name
- `git rev-parse --abbrev-ref HEAD` - Once at startup to detect current branch  
- `git status --porcelain=v1 -- <files>` - Periodically to verify which files are modified

These commands are hard-coded in the daemon implementation and cannot be changed via configuration.

### What commands are tracked by command monitoring?

By default, command monitoring tracks all commands **except** these common navigation/viewing commands:
- `cd`, `ls`, `pwd`, `clear`, `exit`, `history`, `echo`, `cat`, `less`, `more`, `head`, `tail`

You can customize this with:
- `ZIIT_COMMAND_INCLUDE` - Only track specific commands (e.g., `git,npm,docker`)
- `ZIIT_COMMAND_IGNORE` - Add more commands to ignore

**Examples of tracked commands:**
- `git commit -m "Fix bug"` → Sends heartbeat with language: Git
- `npm run build` → Sends heartbeat with language: JavaScript
- `docker-compose up` → Sends heartbeat with language: Docker
- `python train.py` → Sends heartbeat with language: Python

### Can I add custom command execution?

No. The daemon architecture is specifically designed as a passive monitoring tool. Adding command execution would:

- Introduce security risks
- Violate the single-responsibility principle
- Conflict with its purpose as a lightweight heartbeat tracker

If you need to execute commands based on file changes, use a dedicated tool like `nodemon`, `watchman`, or custom shell scripts with `inotifywait`.

## Security Notes

- **Never commit `ZIIT_API_KEY`** to version control
- Store as a GitHub secret (Codespaces secrets for Copilot agents)
- The daemon only reads files to check git status—it does not upload file contents
- Network requests are sent only to `ZIIT_BASE_URL` (default: `https://ziit.app`)
- The daemon does not execute user commands or have a command interface (security by design)

## License

Part of the ADHD-Closet project. See repository LICENSE.
