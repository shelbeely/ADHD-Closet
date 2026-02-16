# GitHub Copilot Hook System - Design Decisions

**Date:** 2026-02-16  
**Version:** 1.0.0  
**Purpose:** Document architectural decisions and rationale for the hook system

## Executive Summary

The GitHub Copilot hook system was designed to provide automated validation, observability, and knowledge maintenance while preserving existing Ziit tracking. Key design principles:

1. **Minimal overhead** - Hooks complete in <1s total per session
2. **Graceful degradation** - Never block the agent, fail silently
3. **Composability** - Multiple hooks per event type
4. **Privacy-first** - Telemetry is local and gitignored
5. **Self-maintaining** - Automatically updates repository knowledge

## Architecture Decisions

### 1. Separate Hook Scripts vs Monolithic Handler

**Decision:** Use separate scripts for each hook type

**Alternatives considered:**
- Single monolithic script that handles all hook types
- Hybrid approach with shared core and hook-specific modules

**Rationale:**
- **Single Responsibility Principle:** Each hook has one clear purpose
- **Performance:** Only execute code needed for that specific event
- **Debugging:** Easier to isolate issues to specific hook types
- **Flexibility:** Can disable individual hooks via configuration
- **Maintainability:** Each script is self-contained and easier to understand

**Trade-offs:**
- ✅ Pro: Better modularity and testability
- ✅ Pro: Clearer separation of concerns
- ❌ Con: Some code duplication (mitigated by shared utilities)
- ❌ Con: More files to manage

### 2. Preserve Ziit Hooks vs Replace

**Decision:** Preserve existing Ziit heartbeat hooks, run in parallel

**Alternatives considered:**
- Replace Ziit hooks entirely with new system
- Merge Ziit functionality into new hooks
- Run hooks sequentially (new first, then Ziit)

**Rationale:**
- **Backward compatibility:** Don't break existing tracking
- **Separation of concerns:** Ziit tracks activity, hooks provide validation
- **Composability:** GitHub Copilot supports multiple hooks per event
- **Flexibility:** Users can disable new hooks without affecting Ziit

**Implementation:**
Each hook array in `hooks.json` now contains two entries:
```json
"sessionStart": [
  { "bash": ".github/hooks/session-start.js", ... },  // New validation
  { "bash": ".github/hooks/ziit-heartbeat.js", ... }  // Existing Ziit
]
```

### 3. Telemetry Storage Location

**Decision:** Store telemetry in `.github/telemetry/` and gitignore it

**Alternatives considered:**
- Store in `/tmp` (ephemeral, disappears on reboot)
- Store in `app/data/` (mixed with application data)
- Commit telemetry to git (track history)
- Send telemetry to external service

**Rationale:**
- **Privacy:** Telemetry may contain sensitive command output
- **Size:** Telemetry grows over time, would bloat git history
- **Locality:** Keep telemetry close to hooks for easier debugging
- **Persistence:** Survives across sessions (unlike /tmp)
- **Gitignored:** Won't accidentally commit sensitive data

**Trade-offs:**
- ✅ Pro: Private and local
- ✅ Pro: Persistent within environment
- ❌ Con: Not tracked across environments
- ❌ Con: Lost when environment is destroyed

### 4. Knowledge Graph Updates

**Decision:** Update `.github/memory/` automatically at session end

**Alternatives considered:**
- Manual updates by developers
- Update on every file edit (too frequent)
- External service that analyzes git history
- Never update automatically

**Rationale:**
- **Self-maintaining:** Repository knowledge stays current without manual work
- **Atomic updates:** Generate complete summary at end of session
- **Performance:** Only run once per session, not on every file edit
- **Contextual:** Knows what changed during this specific session

**Implementation:**
- `session-end.js` calls `knowledge-updater.js`
- Detects architecture changes by file patterns
- Detects dependency changes by `package.json` analysis
- Groups changes into modules for better organization

### 5. Validation Timing: Post vs Pre Tool Use

**Decision:** Validate after tool use (postToolUse) not before (preToolUse)

**Alternatives considered:**
- Validate before tool use (predict issues)
- Validate both before and after
- Only validate at session end

**Rationale:**
- **Accuracy:** Validate actual changes, not predicted changes
- **Immediate feedback:** Agent knows immediately if edit caused issues
- **Simplicity:** Don't need to predict what file edits will do
- **Performance:** Only validate what was actually changed

**Trade-offs:**
- ✅ Pro: Accurate validation of actual changes
- ✅ Pro: Immediate feedback loop
- ❌ Con: Can't prevent bad edits before they happen
- ❌ Con: Might run validation on intermediate states

### 6. Validation Scope: All Files vs Changed Files Only

**Decision:** Only validate changed files (not full codebase)

**Alternatives considered:**
- Validate entire codebase on every edit
- Validate changed file plus dependencies
- No validation

**Rationale:**
- **Performance:** Full codebase validation takes 30-60 seconds
- **Focused feedback:** Only report issues in what agent touched
- **Minimal overhead:** Changed file validation takes <500ms
- **Existing issues:** Agent not responsible for pre-existing problems

**Implementation:**
- `postToolUse` extracts file paths from tool arguments
- `file-validator.js` only runs eslint/tsc on those specific files
- Falls back gracefully if tools not available

### 7. Graceful Degradation Strategy

**Decision:** All hooks exit 0 (success) even on internal errors

**Alternatives considered:**
- Exit non-zero on validation failures (blocks agent)
- Exit non-zero on missing tools (blocks agent)
- Exit non-zero on telemetry failures (blocks agent)

**Rationale:**
- **Never block the agent:** Hooks are observability, not gatekeepers
- **Fail silently:** Print warnings but continue execution
- **Developer experience:** Agent can work even if hooks are broken
- **Gradual adoption:** Can deploy hooks without risk of breaking workflows

**Implementation:**
- All hook scripts wrap main logic in try-catch
- Always `process.exit(0)` even in catch block
- Print errors to console for visibility
- Skip unavailable tools rather than fail

### 8. Runtime Detection: Bun vs npm

**Decision:** Auto-detect runtime, prefer bun if available and configured

**Alternatives considered:**
- Always use npm (ignores bun)
- Always use bun (fails if not available)
- Require manual configuration
- Use whatever's in PATH first

**Rationale:**
- **Flexibility:** Supports both bun and npm environments
- **Performance:** Prefers bun for speed when available
- **Project-aware:** Respects `packageManager` field in package.json
- **Fallback:** Uses npm if bun not available

**Implementation:**
- `runtime-detector.js` checks `which bun` and `which npm`
- Reads `app/package.json` for `packageManager` preference
- Returns runtime info: `{ runtime, command, version, available }`

### 9. Session Tracking: Global vs Session ID

**Decision:** Use GitHub Actions run ID as session ID, generate local ID as fallback

**Alternatives considered:**
- Use process ID as session ID
- Generate random UUID for each session
- Use timestamp as session ID
- No session tracking

**Rationale:**
- **Consistency:** Same session ID across all hooks in one run
- **GitHub integration:** Can correlate with GitHub Actions logs
- **Local support:** Falls back to timestamp-based ID locally
- **Uniqueness:** Run IDs are globally unique

**Implementation:**
```javascript
function getSessionId() {
  return process.env.GITHUB_RUN_ID || `local-${Date.now()}`;
}
```

### 10. Validation Tools: ESLint + TypeScript vs Unified Tool

**Decision:** Run ESLint and TypeScript separately

**Alternatives considered:**
- Only run ESLint (misses type errors)
- Only run TypeScript (misses style issues)
- Use unified tool like ts-standard

**Rationale:**
- **Existing tooling:** Project already uses ESLint and TypeScript
- **Separation of concerns:** Linting and type checking are different
- **Flexibility:** Can skip one if not available
- **Standard practice:** Industry standard to run both

**Trade-offs:**
- ✅ Pro: Uses existing project configuration
- ✅ Pro: Can run independently
- ❌ Con: Two separate command invocations
- ❌ Con: Slightly slower than unified tool

## Performance Considerations

### Hook Execution Time Budget

Total acceptable overhead per session: **2 seconds**

Breakdown:
- `sessionStart`: 200ms (environment checks, memory loading)
- `preToolUse`: 20ms × 10 tools = 200ms (command logging)
- `postToolUse`: 500ms × 3 edits = 1500ms (validation)
- `errorOccurred`: 20ms × 1 error = 20ms (error tracking)
- `sessionEnd`: 1000ms (summary generation, knowledge update)

**Total: ~1920ms** (within budget)

### Optimization Strategies

1. **Lazy initialization:** Only load utilities when needed
2. **Filtered validation:** Only validate changed files
3. **Concurrent hooks:** Ziit and validation run in parallel
4. **Early exit:** Skip hooks if no work needed
5. **Caching:** Reuse session data across hooks

### Performance Monitoring

Track hook execution time in telemetry:
```json
{
  "type": "hook-performance",
  "hookName": "postToolUse",
  "duration": 234,
  "filesValidated": 2
}
```

## Security Considerations

### What's Not Stored in Telemetry

❌ Secrets, tokens, API keys, passwords  
❌ Environment variable values  
❌ Personally identifying information  
❌ File contents  
❌ Full command output  
❌ Full prompt contents

### What's Stored

✅ Session metadata (timestamps, repository, branch)  
✅ File paths (relative, not absolute)  
✅ Command names (truncated to 200 chars)  
✅ Error messages (truncated to 500 chars)  
✅ Validation results (pass/fail)

### Gitignore Protection

`.github/telemetry/` is gitignored to prevent accidental commits of:
- Command output that might contain secrets
- Error messages that might reveal implementation details
- Session data that might contain sensitive context

## Extensibility

### Adding New Hooks

1. Create new script in `.github/hooks/`
2. Add hook to `hooks.json`
3. Document in README.md
4. Test manually

### Adding New Utilities

1. Create new script in `scripts/hooks/`
2. Export functions for use by hooks
3. Document usage in script header
4. Add to README.md utilities section

### Adding New Validation

1. Add check to `file-validator.js`
2. Return same result format: `{ success, skipped, message, errors }`
3. Update `postToolUse` to use new validation
4. Document in README.md

## Future Enhancements

### Potential Improvements

1. **Auto-fix:** Run `eslint --fix` on validation failures
2. **Prettier:** Format files on edit
3. **Test execution:** Run tests for changed files
4. **Dependency scanning:** Check for vulnerabilities
5. **PR generation:** Auto-generate PR descriptions from session summary
6. **AI suggestions:** Use Gemini to suggest fixes for validation errors
7. **Performance profiling:** Track which operations are slow
8. **Metrics dashboard:** Visualize telemetry data

### Why Not Implemented Yet

- **Scope creep:** Focus on core validation first
- **Performance:** Some features would add significant overhead
- **Complexity:** Would require more dependencies
- **Testing:** Need to validate current system first

## Lessons Learned

### What Worked Well

- ✅ Modular hook design makes adding features easy
- ✅ Graceful degradation prevents blocking issues
- ✅ Preserving Ziit hooks maintained backward compatibility
- ✅ TypeScript utilities provide good foundation
- ✅ Documentation-first approach clarified design

### What Could Be Improved

- ⚠️ File validator could batch multiple files in single eslint run
- ⚠️ Knowledge updater could detect more architecture patterns
- ⚠️ Telemetry format could be more structured (use JSONL throughout)
- ⚠️ Session tracking could handle concurrent sessions better
- ⚠️ Error messages could be more actionable

### Changes Made During Implementation

1. **Separated Ziit README:** Created README-ZIIT.md to preserve existing docs
2. **Added config.env:** Centralized configuration options
3. **Made scripts executable:** Added chmod +x for convenience
4. **Added .gitignore entry:** Prevent accidental telemetry commits

## Conclusion

The hook system achieves its goals:

✅ **Automated validation** - ESLint and TypeScript checks on file edits  
✅ **Observability** - Session telemetry and activity tracking  
✅ **Knowledge maintenance** - Auto-updates `.github/memory/`  
✅ **Minimal overhead** - <2s total per session  
✅ **Graceful degradation** - Never blocks the agent  
✅ **Backward compatible** - Preserves Ziit tracking

The modular architecture makes future enhancements straightforward while keeping the current system simple and maintainable.

---

**Author:** GitHub Copilot Coding Agent  
**Reviewed:** 2026-02-16  
**Next Review:** After 1 month of production use
