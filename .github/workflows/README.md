# GitHub Actions Workflows

This directory contains both traditional GitHub Actions workflows (`.yml` files) and agentic workflows (`.md` files).

## Workflow Types

### Traditional GitHub Actions (`.yml` files)

Standard CI/CD workflows that run automatically on GitHub infrastructure.

#### build-android-apk.yml
Builds Android APK for the Twin Style mobile app using Capacitor.

**Triggers:**
- Push to `main` branch (when app code changes)
- Manual workflow dispatch

**Steps:**
1. Check out code
2. Set up Node.js and Bun
3. Install dependencies
4. Build Next.js app
5. Sync with Capacitor
6. Build Android APK
7. Upload artifact

**Output:** Android APK available as artifact

#### copilot-setup-steps.yml
Pre-configures the Copilot coding agent's development environment.

**Triggers:**
- Runs before Copilot agent starts working
- Automatic setup for agent sessions

**Steps:**
1. Set up Bun 1.3.6 runtime
2. Install dependencies (`bun install` in `app/`)
3. Generate Prisma Client
4. Copy `.env.example` to `.env`
5. Inject `DATABASE_URL` from copilot environment secret
6. Start Redis 7 service

**Note:** Database schema already exists on Supabase (persistent hosted database), so migrations are not run during setup.

#### deploy-docs.yml
Deploys MkDocs documentation to GitHub Pages.

**Triggers:**
- Push to `main` branch affecting `docs/` or `mkdocs.yml`

**Steps:**
1. Check out code
2. Set up Python 3.x
3. Install MkDocs with Material theme
4. Build documentation
5. Deploy to GitHub Pages via `mkdocs gh-deploy --force`

**Output:** Documentation available at https://shelbeely.github.io/ADHD-Closet/

### Agentic Workflows (`.md` files)

Markdown-based workflow definitions that run AI agents in GitHub Actions. These use [GitHub Agentic Workflows](https://github.github.com/gh-aw/) - compiled to `.lock.yml` files via `gh aw compile`.

#### ci-doctor.md
Investigates failed CI runs, analyzes logs, identifies root causes.

**Triggers:**
- Failed CI runs (especially Android APK builds)

**Actions:**
1. Access CI logs via GitHub API
2. Analyze error patterns
3. Identify root cause
4. Create diagnostic issue with:
   - Error summary
   - Root cause analysis
   - Fix suggestions
   - Related documentation links

**Output:** Diagnostic GitHub issue

#### daily-status.md
Creates daily status report summarizing project activity.

**Triggers:**
- Daily schedule (configured time)

**Actions:**
1. Fetch recent commits, PRs, issues
2. Analyze phase progress (current: Phase 4-6)
3. Identify blockers and action items
4. Generate summary report

**Output:** GitHub issue with daily status

#### issue-triage.md
Auto-labels new issues with project-specific categories.

**Triggers:**
- New issue created

**Actions:**
1. Analyze issue title and description
2. Apply appropriate labels:
   - `bug`, `enhancement`, `documentation`
   - `ui/ux`, `ai-integration`, `mobile`
   - `accessibility`, `performance`
   - `phase-N` (current development phase)
3. Post comment explaining categorization

**Output:** Labeled issue with triage comment

#### pr-review.md
Reviews pull requests against project conventions.

**Triggers:**
- New pull request opened
- Pull request updated

**Actions:**
1. Review code changes against standards:
   - Material Design 3 compliance
   - ADHD-optimized UX principles
   - TypeScript standards
   - API patterns (Zod validation, error format)
   - Database patterns (Prisma, transactions)
2. Check for security issues
3. Verify tests and linting

**Output:** PR review comment with findings

## Compiling Agentic Workflows

Agentic workflows (`.md` files) must be compiled to `.lock.yml` files:

```bash
# Install GitHub Agentic Workflows CLI
gh extension install github/gh-aw

# Compile all agentic workflows
gh aw compile

# Compile specific workflow
gh aw compile .github/workflows/issue-triage.md
```

**Important:** Commit both the `.md` source file and the generated `.lock.yml` file when making changes.

## Adding New Workflows

### Traditional GitHub Actions

1. Create `.github/workflows/[name].yml`
2. Define triggers, jobs, and steps
3. Test with manual workflow dispatch
4. Commit and push

### Agentic Workflows

1. Create `.github/workflows/[name].md`
2. Define agent instructions in Markdown
3. Compile: `gh aw compile .github/workflows/[name].md`
4. Commit both `.md` and `.lock.yml` files
5. Test by triggering the workflow

## Workflow Best Practices

### Traditional Workflows
- Use caching for dependencies
- Set appropriate timeouts
- Use secrets for sensitive data
- Test workflows on feature branches first

### Agentic Workflows
- Keep instructions clear and specific
- Include examples in the prompt
- Test locally with `gh aw run` before committing
- Document expected behavior

## Related Directories

- **`.github/agents/`** - Custom agents you invoke directly
- **`.github/skills/`** - Agent skills loaded automatically
- **`.github/artifacts/`** - Historical workflow implementation summaries

## References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Agentic Workflows](https://github.github.com/gh-aw/)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
