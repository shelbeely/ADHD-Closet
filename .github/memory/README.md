# Repository Memory

**Created:** 2026-02-15  
**Purpose:** Persistent knowledge base for future agent sessions

## What is this?

This directory contains persistent, repo-local knowledge that helps AI agents (GitHub Copilot, custom agents) rapidly understand the Twin Style project without needing to explore from scratch every time.

## Authority Hierarchy

When working on this repository, follow this authority hierarchy:

1. **Context7 Documentation** (via MCP) - For external library behavior and API patterns
2. **Repository Code/Config/Docs** - Ground truth for project-specific implementation
3. **This Memory** - High-signal index and architectural model
4. **Internal AI Knowledge** - Last resort fallback

## What's Stored Here

Memory files reflect **how this repository actually works**, not theoretical ideals:

- **Architecture Overview** - System design, subsystems, and data flows
- **Repository Map** - Folder structure and responsibilities
- **Dependencies** - Actually used libraries (not just installed)
- **Runtime Requirements** - Services, env vars, data stores
- **Dev Commands** - Build, test, lint, migration commands
- **Context7 Notes** - Library IDs and doc-grounded patterns
- **Known Issues** - Sharp edges, invariants, pitfalls

## Memory Maintenance Rules

### When to Update

- **New Information Learned** - Document important discoveries about the codebase
- **Reality Contradicts Memory** - Fix inaccuracies immediately
- **Major Changes** - Update when architecture or dependencies change
- **Version Upgrades** - Document breaking changes or new patterns

### What NOT to Store

❌ Secrets, tokens, API keys, passwords  
❌ Environment variable values  
❌ Personally identifying information  
❌ Duplicate content from project docs  
❌ Temporary implementation notes

### What to Store

✅ Architectural patterns and decisions  
✅ Entry points and execution flows  
✅ Integration points (API, DB, queue, storage)  
✅ Build/test/dev command patterns  
✅ Version-sensitive notes from Context7  
✅ Sharp edges and known pitfalls

## How Agents Use This

1. **Read memory first** - Treat as "current beliefs" about the system
2. **Validate against reality** - Cross-check with actual code when needed
3. **Update incrementally** - Fix errors, add new learnings
4. **Keep diffs reviewable** - Prefer small updates over complete rewrites

## Memory Structure

```
.github/memory/
├── README.md                    # This file
├── repo-map.md                  # Folder structure and responsibilities
├── architecture.md              # End-to-end system flows
├── dependencies.md              # Used libraries and their purpose
├── runtime-requirements.md      # Services, env vars, constraints
├── dev-commands.md              # Build, test, and dev commands
└── context7-notes.md            # Context7 usage and library IDs
```

## Update Strategy

- **Prefer a few stable files** over many tiny ones
- **Make incremental updates** rather than complete rewrites
- **Use clear headings** and dates for significant changes
- **Keep diffs reviewable** so changes can be tracked in git

## Relationship to Project Docs

This memory is NOT a replacement for:

- **`docs/` directory** - User guides, API documentation, feature specs
- **`.github/copilot-instructions.md`** - AI agent behavior guidelines
- **`README.md`** - Project overview and quick start
- **`CONTRIBUTING.md`** - Contribution guidelines

Memory complements these by providing a **high-signal index** and **architectural model** specifically optimized for AI agent context.

## Maintenance

- **Owner:** GitHub Copilot agents and maintainers
- **Update Frequency:** As needed when learning new information
- **Last Updated:** 2026-02-15

---

**Remember:** This is a living knowledge base. Update it when you learn something important about how the system works.
