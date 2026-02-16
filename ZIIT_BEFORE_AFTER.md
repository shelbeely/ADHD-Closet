# Ziit Heartbeat: Before & After

## Architecture Comparison

### Before: Watch Daemon (Continuous Monitoring)

```
┌─────────────────────────────────────────────────────────┐
│ GitHub Copilot Session                                  │
│                                                         │
│  ┌────────────────────────────────────────────┐        │
│  │ copilot-setup-steps.yml                    │        │
│  │                                             │        │
│  │  $ nohup bun run ziit:watch &              │        │
│  │  ZIIT_PID=12345                            │        │
│  └────────────┬────────────────────────────────┘        │
│               │                                         │
│               ▼                                         │
│  ┌────────────────────────────────────────────┐        │
│  │ Watch Daemon (Background Process)          │        │
│  │                                             │        │
│  │  • fs.watch() monitoring filesystem        │        │
│  │  • Watching ~/.bash_history                │        │
│  │  • git status checks (batched)             │        │
│  │  • Debouncing (2.5s)                       │        │
│  │  • Buffering heartbeats                    │        │
│  │  • Batch sending (20 at a time)            │        │
│  │  • Running continuously                    │        │
│  │                                             │        │
│  │  Logs: /tmp/ziit-watch.log                 │        │
│  └────────────┬────────────────────────────────┘        │
│               │                                         │
│               ▼                                         │
│         Ziit.app API                                    │
└─────────────────────────────────────────────────────────┘

Issues:
  ❌ Daemon management (start/stop, PID tracking)
  ❌ Continuous resource usage
  ❌ Filesystem polling overhead
  ❌ Log file management
  ❌ Risk of daemon crashes
  ❌ Tracks filesystem changes, not actual tool usage
```

### After: GitHub Copilot Hooks (Event-Driven)

```
┌─────────────────────────────────────────────────────────────────┐
│ GitHub Copilot Session                                          │
│                                                                 │
│  ┌────────────────────────────────────────────────┐            │
│  │ Copilot Hook System                            │            │
│  │                                                 │            │
│  │  sessionStart ────────┐                        │            │
│  │  sessionEnd ──────────┤                        │            │
│  │  userPromptSubmitted ─┤                        │            │
│  │  preToolUse ──────────┼─► .github/hooks/       │            │
│  │  postToolUse ─────────┤   ziit-heartbeat.js    │            │
│  │  errorOccurred ───────┘                        │            │
│  │                                                 │            │
│  │  Configured in: .github/hooks/hooks.json       │            │
│  └────────────┬────────────────────────────────────┘            │
│               │                                                 │
│               ▼                                                 │
│  ┌────────────────────────────────────────────────────┐        │
│  │ Hook Script Execution (On-Demand)                  │        │
│  │                                                     │        │
│  │  1. Read JSON input from stdin                     │        │
│  │  2. Parse event data (timestamp, cwd, toolName...) │        │
│  │  3. Extract context (project, branch from git)     │        │
│  │  4. Detect language (file ext or command)          │        │
│  │  5. Filter noisy commands (cd, ls, pwd...)         │        │
│  │  6. Format heartbeat                               │        │
│  │  7. Send to Ziit.app API (async fetch)             │        │
│  │  8. Exit with code 0 (never blocks)                │        │
│  │                                                     │        │
│  │  Duration: ~100-300ms per event                    │        │
│  └────────────┬────────────────────────────────────────┘        │
│               │                                                 │
│               ▼                                                 │
│         Ziit.app API                                            │
└─────────────────────────────────────────────────────────────────┘

Benefits:
  ✅ Native Copilot integration
  ✅ No daemon management
  ✅ Event-driven (only runs when needed)
  ✅ Tracks actual tool usage with results
  ✅ Lower overhead
  ✅ Session-aware
  ✅ Error tracking
  ✅ Always exits cleanly
```

## Event Flow Comparison

### Old Flow (Daemon)
```
File Edit                    Daemon Detects          Send Heartbeat
    ↓                             ↓                        ↓
Save file  →  fs.watch() event  →  Debounce  →  git status  →  Buffer  →  Ziit API
(any tool)     (triggers)           (2.5s)     (verify)       (batch)     (20/batch)
```

### New Flow (Hooks)
```
File Edit                    Hook Triggered         Send Heartbeat
    ↓                             ↓                        ↓
preToolUse  →  ziit-heartbeat.js  →  Parse  →  Format  →  Ziit API
(Copilot)      (stdin JSON)          event     heartbeat   (single)
    ↓
postToolUse  →  ziit-heartbeat.js  →  Parse  →  Format  →  Ziit API
(Copilot)      (with result)          event     heartbeat   (single)
```

## Hook Types & Coverage

### All 6 GitHub Copilot Hook Types Implemented

```
┌──────────────────────────────────────────────────────────────┐
│ Session Lifecycle                                            │
├──────────────────────────────────────────────────────────────┤
│ sessionStart      → Tracks: new/resume/startup              │
│ sessionEnd        → Tracks: complete/error/abort/timeout     │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ User Interaction                                             │
├──────────────────────────────────────────────────────────────┤
│ userPromptSubmitted  → Tracks: prompt text (100 char max)   │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Tool Execution                                               │
├──────────────────────────────────────────────────────────────┤
│ preToolUse    → Tracks: edit/create/view/bash invocations   │
│ postToolUse   → Tracks: success/failure/denied results      │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Error Handling                                               │
├──────────────────────────────────────────────────────────────┤
│ errorOccurred  → Tracks: error name & message for debugging │
└──────────────────────────────────────────────────────────────┘
```

## Data Tracked

### Heartbeat Structure (Both Old & New)
```json
{
  "timestamp": 1704614400000,       // Unix timestamp (ms)
  "project": "shelbeely/ADHD-Closet", // From git remote or env
  "language": "TypeScript",         // From file ext or command
  "editor": "github-copilot-agent", // Fixed identifier
  "os": "linux",                    // From process.platform
  "file": "app/page.tsx",           // Path or event description
  "branch": "main"                  // From git or env
}
```

### Language Detection
```
File Extensions:
  .ts/.tsx    → TypeScript
  .js/.jsx    → JavaScript
  .py         → Python
  .sql        → SQL
  .prisma     → Prisma
  .css/.scss  → CSS/SCSS
  .html       → HTML
  .md         → Markdown
  .yml/.yaml  → YAML
  .json       → JSON

Commands:
  git         → Git
  npm/yarn    → JavaScript
  python      → Python
  docker      → Docker
  cargo       → Rust
  go          → Go

Special:
  [session-*] → Session
  [prompt]    → Interaction
  [Error]     → Error
```

## File Changes

```
Files Added: 4
  ✅ .github/hooks/hooks.json            (1.3 KB, config)
  ✅ .github/hooks/ziit-heartbeat.js     (7.5 KB, implementation)
  ✅ .github/hooks/README.md             (5.5 KB, docs)
  ✅ .github/hooks/test-hooks.sh         (2.4 KB, testing)

Files Modified: 2
  📝 .github/workflows/copilot-setup-steps.yml  (removed daemon)
  📝 app/scripts/ziit/README.md                 (added hooks docs)

Total Changes: +824 lines, -31 lines
```

## Testing Results

```
$ bash .github/hooks/test-hooks.sh

Testing GitHub Copilot Ziit Hooks
==================================

1. Testing sessionStart hook...
   ✓ Sent heartbeat: [session-start-new]

2. Testing sessionEnd hook...
   ✓ Sent heartbeat: [session-end-complete]

3. Testing userPromptSubmitted hook...
   ✓ Sent heartbeat: [prompt] Fix the authentication bug

4. Testing preToolUse hook (file edit)...
   ✓ Sent heartbeat: app/page.tsx

5. Testing preToolUse hook (bash command)...
   ✓ Sent heartbeat: [command] npm test

6. Testing postToolUse hook (successful edit)...
   ✓ Sent heartbeat: [success] app/page.tsx

7. Testing postToolUse hook (failed bash command)...
   ✓ Sent heartbeat: [failure] [command] npm test

8. Testing errorOccurred hook...
   ✓ Sent heartbeat: [TimeoutError] Network timeout

9. Testing with filtered command...
   (No output - correctly filtered)

All hook tests completed successfully!
```

## Summary

### Before (Watch Daemon)
- 🔴 Continuous background process
- 🔴 Filesystem polling overhead
- 🔴 Requires daemon management
- 🟢 Works outside Copilot
- 🟡 Tracks filesystem changes

### After (Copilot Hooks)
- 🟢 Event-driven (only on activity)
- 🟢 Native Copilot integration
- 🟢 No process management
- 🟢 Tracks exact tool usage
- 🟢 Captures results & errors
- 🟢 Session lifecycle aware
- 🔴 Copilot-only (daemon still available for local dev)

**Upgrade Status: ✅ Complete & Production Ready**
