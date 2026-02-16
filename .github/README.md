# .github Directory Structure

This directory contains GitHub-specific configuration, workflows, agents, and repository knowledge that helps maintain and develop the Twin Style project.

## Directory Overview

```
.github/
├── README.md                      # This file
├── copilot-instructions.md        # Main GitHub Copilot agent configuration
├── agents/                        # Custom agents you invoke directly
├── skills/                        # Agent skills loaded automatically
├── workflows/                     # GitHub Actions & agentic workflows
├── artifacts/                     # Historical development summaries
└── memory/                        # Repository knowledge base
```

## Quick Reference

| Directory | Purpose | When to Use |
|-----------|---------|-------------|
| `agents/` | Custom agents to invoke | Select agent from dropdown menu |
| `skills/` | Auto-loaded instructions | Copilot loads based on context |
| `workflows/` | CI/CD & automation | Automatic on triggers |
| `artifacts/` | Development history | Reference past implementations |
| `memory/` | Repository knowledge | **Read FIRST** before exploring |

## Detailed Directory Descriptions

### copilot-instructions.md
**Main GitHub Copilot agent behavior configuration**

This file contains comprehensive instructions for GitHub Copilot agents working in this repository, including:
- Repository summary and tech stack
- Repository memory system (`.github/memory/`)
- Tool guidelines (Context7 MCP, Playwright, bash, etc.)
- Build and development instructions
- Code conventions and design principles
- ADHD-optimized UX principles
- Common issues and workarounds

**Authority Hierarchy:**
1. Context7 Documentation (via MCP) - External library behavior
2. Repository Code/Config/Docs - Ground truth for implementation
3. `.github/memory/` - High-signal index & architectural model
4. Internal AI Knowledge - Last resort fallback

### agents/
**Custom agents you explicitly invoke**

Contains specialized agent definitions that you select from a dropdown menu in GitHub Copilot.

**Agents:**
- `humanizer.agent.md` - Remove AI writing patterns from text
- `remotion.agent.md` - Remotion video programming expertise

**Documentation:** See `agents/README.md`

### skills/
**Agent skills loaded automatically by Copilot**

Contains instruction sets that ANY agent can automatically load based on context.

**Skills:**
- `humanizer/` - Detect and fix AI-generated writing patterns
- `remotion/` - Remotion best practices for video creation
- `threejs-fundamentals/` - Three.js basics for 3D scenes

**Documentation:** See `skills/README.md`

**Key Difference:** Skills are loaded automatically when relevant; agents are manually selected.

### workflows/
**GitHub Actions and agentic workflows**

Contains both traditional CI/CD workflows (`.yml`) and AI-powered agentic workflows (`.md`).

**Traditional Workflows (`.yml`):**
- `build-android-apk.yml` - Build Android APK
- `copilot-setup-steps.yml` - Pre-configure Copilot environment
- `deploy-docs.yml` - Deploy docs to GitHub Pages

**Agentic Workflows (`.md`):**
- `ci-doctor.md` - Investigate failed CI runs
- `daily-status.md` - Daily status reports
- `issue-triage.md` - Auto-label new issues
- `pr-review.md` - Review PRs against conventions

**Documentation:** See `workflows/README.md`

### artifacts/
**Historical development summaries**

Contains summary documents from previous development sessions that document the evolution of the project.

**Purpose:** Historical reference for implementation decisions, not actively maintained.

**Recent artifacts:**
- `REPOSITORY_REORGANIZATION.md` - 2026-02-16 repository cleanup
- `MEMORY_SYSTEM_SUMMARY.md` - Memory system implementation
- `DOCS_DEPLOYMENT_SUMMARY.md` - Documentation deployment setup
- `HUMANIZER_INTEGRATION_SUMMARY.md` - Humanizer integration history
- Plus 10+ other historical summaries

**Documentation:** See `artifacts/README.md`

### memory/
**Repository knowledge base**

⚠️ **READ THIS FIRST** before exploring the codebase!

Contains validated, high-signal documentation about the repository architecture, dependencies, commands, and patterns.

**Files:**
- `README.md` - Memory system guide and authority hierarchy
- `repo-map.md` - Folder structure and responsibilities
- `architecture.md` - System design, data flows, patterns
- `dependencies.md` - Used libraries and their configurations
- `runtime-requirements.md` - Services, environment variables, external dependencies
- `dev-commands.md` - Build, test, lint, and development commands
- `context7-notes.md` - Context7 MCP patterns and library IDs

**Why Memory First:**
- Eliminates redundant exploration
- Provides validated, accurate context
- Documents known issues and workarounds
- References Context7 patterns already validated
- Saves 10-20 minutes per session

**Documentation:** See `memory/README.md`

## Development Workflow

### For AI Agents (GitHub Copilot, etc.)

1. **Always read `.github/memory/` FIRST** - Complete knowledge base
2. Check `copilot-instructions.md` for guidelines
3. Use Context7 MCP for library documentation (see `memory/context7-notes.md`)
4. Reference `artifacts/` for historical context if needed
5. Copilot will auto-load `skills/` when relevant

### For New Contributors

1. Read repository `README.md` in root
2. Review `.github/memory/repo-map.md` for structure
3. Check `.github/memory/dev-commands.md` for build instructions
4. See `CONTRIBUTING.md` in root for contribution guidelines

### For Documentation Writers

1. Use `humanizer` agent to review AI-generated text
2. Check `artifacts/HUMANIZER_GUIDE.md` for patterns to avoid
3. Follow Material Design 3 guidelines in `docs/developer/SPEC.md`
4. Maintain ADHD-friendly writing (clear, direct, minimal friction)

## Understanding the Organization

The `.github` directory follows a clear organizational pattern:

**Configuration & Instructions:**
- `copilot-instructions.md` - Agent behavior rules

**Dynamic Resources (Agents use):**
- `agents/` - You select manually
- `skills/` - Loaded automatically
- `workflows/` - Run on triggers

**Knowledge Base (Read first):**
- `memory/` - Current, validated knowledge
- `artifacts/` - Historical summaries

## Maintenance

### When to Update

**`copilot-instructions.md`:**
- New major features or patterns
- Changed development workflow
- Updated authority hierarchy

**`memory/`:**
- Learning new patterns or issues
- Finding inaccuracies
- Incremental updates preferred

**`artifacts/`:**
- After major implementations
- Document decision rationale
- Archive summaries here

**`agents/` or `skills/`:**
- New reusable agent patterns
- Improved instructions
- Additional skills needed

### Never Store in .github

- Secrets or API keys
- Environment variable values
- Personal identifiable information (PII)
- Temporary files or build artifacts

## Related Documentation

### In Repository Root
- `README.md` - Project overview
- `CONTRIBUTING.md` - Contribution guidelines
- `docs/` - Product documentation (MkDocs site)

### External Resources
- [GitHub Copilot Documentation](https://docs.github.com/en/copilot)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Agent Skills Standard](https://github.com/agentskills/agentskills)
- [GitHub Agentic Workflows](https://github.github.com/gh-aw/)

## Quick Commands

```bash
# View .github structure
tree .github -L 2 -I 'node_modules'

# Search for content in memory
grep -r "pattern" .github/memory/

# Check for AI writing patterns in docs
cd docs && grep -i "crucial\|pivotal\|testament" *.md

# Compile agentic workflows
gh aw compile .github/workflows/*.md

# View recent artifacts
ls -lt .github/artifacts/ | head -10
```

## Summary

The `.github` directory is the central hub for:
- 🤖 **AI Agent Configuration** - How agents should behave
- 📚 **Repository Knowledge** - Validated facts about the codebase
- ⚙️ **Automation** - Workflows and CI/CD
- 📖 **Historical Context** - Past implementation decisions

**Key Principle:** Memory first, exploration second. Always check `.github/memory/` before exploring code.
