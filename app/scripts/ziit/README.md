# Ziit Heartbeat Client

A lightweight, zero-dependency Bun.js client that tracks code file edits and sends activity heartbeats to [Ziit.app](https://ziit.app). Designed specifically for GitHub Copilot coding agent sessions.

## Features

- **Filesystem Monitoring**: Uses `fs.watch()` (Bun-compatible) for efficient change detection
- **Git-Aware**: Only reports files that are actually modified or untracked (verified via `git status` using `Bun.spawn()`)
- **Smart Filtering**: Includes only relevant code files, ignores build artifacts and dependencies
- **Batched Git Checks**: Checks multiple files at once using `Bun.spawn()` for better performance
- **Debouncing**: Buffers bursts of events to avoid spam (configurable, default 2.5s)
- **Batch Sending**: Groups heartbeats for efficiency (configurable batch size, default 20)
- **Resilient**: Retries on network failures with exponential backoff, gracefully handles SIGINT/SIGTERM
- **Observability**: Tracks stats (files processed, heartbeats sent, failures) with periodic reporting
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

4. **Start in dry-run mode** (optional):
   ```bash
   export ZIIT_DRY_RUN=true
   export ZIIT_VERBOSE=true
   bun run ziit:watch
   ```
   
   This shows what would be sent without actually sending data.

5. **Run the watch daemon for real**:
   ```bash
   export ZIIT_DRY_RUN=false  # or unset ZIIT_DRY_RUN
   bun run ziit:watch
   ```

6. **Test by editing a file**:
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

## API Endpoints

The client sends heartbeats to:

- **Single**: `POST https://ziit.app/api/external/heartbeat`
- **Batch**: `POST https://ziit.app/api/external/batch`

Authorization: `Bearer <ZIIT_API_KEY>`

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

## Security Notes

- **Never commit `ZIIT_API_KEY`** to version control
- Store as a GitHub secret (Codespaces secrets for Copilot agents)
- The daemon only reads files to check git status—it does not upload file contents
- Network requests are sent only to `ZIIT_BASE_URL` (default: `https://ziit.app`)

## License

Part of the ADHD-Closet project. See repository LICENSE.
