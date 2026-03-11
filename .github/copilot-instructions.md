# Twin Style - Copilot Instructions

## Repository Summary

Twin Style is a single-user, self-hosted wardrobe organizer powered by **Google Gemini AI**, designed with ADHD-friendly workflows. The name references Gemini (Latin for "twins"), representing the dual nature of **your style** meets **AI assistance**. This app is **specifically built for Gemini models**, leveraging their advanced vision, image generation, and reasoning capabilities. Users take photos of clothing items, Gemini AI generates clean catalog images and suggests categories, and the system provides intelligent outfit recommendations based on weather, mood, and constraints.

**Project Type**: Full-stack web application with optional native mobile apps  
**Size**: ~50k+ lines of code  
**Primary Languages**: TypeScript (95%), JavaScript (3%), CSS (2%)

## 🧠 Repository Memory System

**⚠️ READ THIS FIRST ⚠️**

This repository has a persistent knowledge base in `.github/memory/` that you MUST read before exploring:

```bash
# Essential reading (in order):
1. .github/memory/README.md          # Memory system guide
2. .github/memory/repo-map.md        # Folder structure
3. .github/memory/architecture.md    # System design & data flows
4. .github/memory/dependencies.md    # Used libraries
5. .github/memory/runtime-requirements.md  # Services & env vars
6. .github/memory/dev-commands.md    # Build & dev commands
7. .github/memory/context7-notes.md  # Context7 patterns
```

**Authority Hierarchy:**
1. **Context7 Documentation** (via MCP) - External library behavior
2. **Repository Code/Config/Docs** - Ground truth for implementation
3. **`.github/memory/`** - High-signal index & architectural model
4. **Internal AI Knowledge** - Last resort fallback

**Why Memory First:**
- Eliminates redundant exploration
- Provides validated, accurate context
- Documents known issues and workarounds
- References Context7 patterns already validated
- Saves 10-20 minutes per session

**Update Memory:** When you learn something important, update `.github/memory/` incrementally. Never store secrets or env values.

## Tools & MCP Servers

### Context7 MCP (Model Context Protocol)

**ALWAYS use Context7 MCP when you need library/API documentation, code generation, setup or configuration steps without the user having to explicitly ask.**

**IMPORTANT:** All primary tech stack library IDs are documented in `docs/CONTEXT7_LIBRARY_IDS.md`. Check this reference document FIRST before calling `resolve-library-id` to save quota and time.

Context7 provides up-to-date documentation and code examples from official sources. Use it proactively for:

- **Library Documentation**: When working with any library/framework (Next.js, React, Bun.js, Prisma, etc.)
- **API Reference**: When you need to verify correct API usage or parameters
- **Code Generation**: When implementing features using specific libraries
- **Setup & Configuration**: When configuring tools, build systems, or deployments
- **Best Practices**: When you need to verify if you're following current best practices

**How to use Context7:**

1. **Check if we already know the library ID** by looking in `docs/CONTEXT7_LIBRARY_IDS.md`:
   - All primary tech stack libraries are documented with their IDs
   - Includes: Next.js, React, Prisma, BullMQ, Bun.js, Three.js, Zod, Tailwind CSS, and more
   - Use the library ID directly from the reference document

2. **If library ID is known**, query directly:
   ```
   context7-query-docs: { libraryId: "/oven-sh/bun", query: "How to spawn child processes and read their output" }
   ```

3. **If library ID is NOT in the reference**, then resolve it first:
   ```
   context7-resolve-library-id: { libraryName: "new-library", query: "What you want to do with it" }
   ```
   - After resolving, consider adding it to `docs/CONTEXT7_LIBRARY_IDS.md` for future use

**Examples of when to use Context7 automatically:**

- Writing Bun.js code → Query `/oven-sh/bun` docs (ID from reference doc)
- Using Next.js features → Query `/vercel/next.js/v16.1.5` docs (ID from reference doc)
- Implementing Prisma queries → Query `/prisma/docs` for ORM usage (ID from reference doc)
- Setting up React components → Query docs for hooks and patterns (use Next.js docs, React integrated)

**Usage Guidelines (1000 requests/month available):**

Use Context7 liberally for:
- **Critical code verification**: Validate patterns against official docs before implementing
- **Complex features**: Query multiple aspects of a library when building complex features
- **Stack validation**: Comprehensively check entire tech stack implementations
- **API migrations**: Verify correct upgrade patterns when updating libraries

**Efficiency Tips:**
- **Check `docs/CONTEXT7_LIBRARY_IDS.md` first** - All primary stack library IDs are documented
- Batch related queries in a single question when possible
- For repetitive patterns (e.g., CRUD operations), query once and apply the pattern
- Cache frequently-used patterns in memory (store_memory tool)
- Prioritize queries for unfamiliar libraries or new API versions
- Skip queries for well-known patterns you've already validated
- Only call `resolve-library-id` for new libraries not in the reference document

**When to skip Context7:**
- Simple, well-established patterns you've used before
- Standard JavaScript/TypeScript syntax
- Basic React patterns already validated in the project
- Repetitive operations following an already-verified pattern

### Playwright MCP (Browser Automation)

**ALWAYS use Playwright MCP to take screenshots of the web app when making UI changes or verifying web pages.**

Playwright MCP provides browser automation capabilities for testing and validation. Use it automatically for:

- **UI Changes**: After modifying any UI component, page layout, or styling
- **Visual Verification**: When implementing new features that affect the user interface
- **Testing Pages**: When you need to verify a page loads correctly
- **Debugging**: When investigating rendering or display issues
- **Documentation**: To show the user what the UI looks like

**How to use Playwright:**

1. **Start browser** (if not already running):
   ```
   next-devtools-browser_eval: { action: "start", headless: false }
   ```

2. **Navigate to a page**:
   ```
   next-devtools-browser_eval: { action: "navigate", url: "http://localhost:3000/your-page" }
   ```

3. **Take screenshot** (REQUIRED for UI changes):
   ```
   next-devtools-browser_eval: { action: "screenshot", fullPage: true }
   ```

**When to use Playwright automatically:**

- Changed any React component → Take screenshot of the page
- Modified CSS/styling → Take screenshot showing the visual changes
- Added new routes/pages → Navigate and screenshot the new pages
- Fixed UI bugs → Show before/after screenshots
- Implemented responsive design → Screenshot at different viewport sizes

**Important:** The dev server must be running (`npm run dev` or `bun dev`) before taking screenshots. Start it first if needed.

### Skills.sh (Reusable Agent Skills)

**ALWAYS search for relevant skills before implementing new features. Skills are pre-built, tested capabilities that save time and ensure best practices.**

Skills.sh provides a registry of reusable agent skills from the community. The coding agent environment has Node.js 22 and the **find-skills** capability installed, which teaches agents skill discovery patterns.

**Skill-First Development Policy:**

1. **Search before coding**: Before implementing any feature, search for relevant skills
2. **Prefer skills over custom code**: Use existing skills when available
3. **Install dynamically**: Skills can be installed on-demand during development
4. **Treat as capabilities**: Installed skills extend the agent's abilities

**When to search for skills (from find-skills capability):**

Search when the user:
- Asks "how do I do X" where X might be a common task
- Says "find a skill for X" or "is there a skill for X"
- Asks "can you do X" where X is a specialized capability
- Wants to search for tools, templates, or workflows
- Mentions they wish they had help with a specific domain (design, testing, deployment)

**How to discover skills:**

```bash
# Interactive search (fzf-style fuzzy finder)
npx skills find

# Search by keyword
npx skills find "react testing"
npx skills find "API documentation"
npx skills find "database migration"
npx skills find "pr review"

# Example output shows:
# Install with npx skills add <owner/repo@skill>
#
# vercel-labs/agent-skills@typescript-best-practices
# https://skills.sh/vercel-labs/agent-skills/typescript-best-practices
```

**How to install and use skills:**

```bash
# Install a specific skill using @syntax
npx skills add <owner/repo@skill>

# Examples:
npx skills add vercel-labs/agent-skills@frontend-design
npx skills add vercel-labs/agent-skills@vercel-react-best-practices

# Non-interactive installation (CI/CD friendly)
npx skills add vercel-labs/agent-skills@frontend-design -y

# Install globally (user-level)
npx skills add vercel-labs/agent-skills@frontend-design -g -y

# Install to specific agents
npx skills add vercel-labs/agent-skills -a claude-code -a cursor

# Install all skills from a repo
npx skills add vercel-labs/agent-skills --all

# List available skills without installing
npx skills add vercel-labs/agent-skills --list
```

**Common skill categories to search:**

- **Web Development**: react, nextjs, typescript, css, tailwind
- **Testing**: testing, jest, playwright, e2e
- **DevOps**: deploy, docker, kubernetes, ci-cd
- **Documentation**: docs, readme, changelog, api-docs
- **Code Quality**: review, lint, refactor, best-practices
- **Design**: ui, ux, design-system, accessibility
- **Productivity**: workflow, automation, git

**Skill locations:**

This repository uses both local skills and registry skills:

- **Local skills**: `.github/skills/` - Project-specific skills (humanizer, remotion, threejs, **find-skills**)
- **Registry skills**: Installed via `npx skills add` - Community skills from https://skills.sh
- **Custom agents**: `.github/agents/` - Specialized agents you explicitly invoke

**Check both locations** - Local skills are automatically available, registry skills can be installed on-demand.

**Present skills to users:**

When you find relevant skills, present them with:
1. The skill name and what it does
2. The install command they can run
3. A link to learn more at skills.sh

**Usage Guidelines:**

- Always search the registry before writing significant new code
- Use specific keywords: "react testing" is better than just "testing"
- Try alternative terms if first search doesn't work
- Use `-y` flag for non-interactive installations in CI/CD
- Skills integrate with the existing tools and MCP servers
- Update `.github/skills/README.md` if you install useful registry skills for the project
- Browse the catalog at https://skills.sh

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript 5.9, Tailwind CSS 4
- **3D Graphics**: Three.js, @react-three/fiber, @react-three/drei
- **Backend**: Next.js API Routes (serverless functions)
- **Database**: Supabase (PostgreSQL) with Prisma ORM 7.3
- **Background Jobs**: BullMQ 5.x + Redis 7+ for async AI processing
- **AI Provider**: OpenRouter API (**Google Gemini 3 models exclusively** for vision/text/image generation)
- **Image Processing**: Sharp for thumbnails and optimization
- **Runtime**: Bun.js 1.3+ (with npm fallback for CI/CD)
- **PWA**: next-pwa with service worker and offline support
- **Native Bridge**: Capacitor 8.x for iOS and Android native capabilities

## Build & Development Instructions

### Prerequisites
- **Bun** ≥ 1.0.0 (recommended) OR **Node.js** ≥ 20
- **Docker** and **Docker Compose** (for Redis; PostgreSQL is hosted on Supabase)
- **OpenRouter API Key** (required for AI features)

### Bootstrap Sequence (First Time Setup)

**ALWAYS run these commands in this exact order:**

1. **Clone and navigate to app directory:**
   ```bash
   cd /home/runner/work/ADHD-Closet/ADHD-Closet/app
   ```

2. **Install dependencies:**
   ```bash
   bun install    # Preferred: ~3-5 seconds
   # OR
   npm install    # Fallback: ~15-30 seconds
   ```

3. **Setup environment:**
   ```bash
   cp .env.example .env
   # Edit .env and add your Supabase DATABASE_URL and OPENROUTER_API_KEY
   ```

4. **Start Redis service (from repo root):**
   ```bash
   cd /home/runner/work/ADHD-Closet/ADHD-Closet
   docker compose up -d redis
   # Wait 3-5 seconds for services to be ready
   ```

5. **Run database migrations:**
   ```bash
   cd app
   npx prisma migrate dev
   # Takes ~5-10 seconds
   ```

6. **Generate Prisma Client (REQUIRED after any schema changes):**
   ```bash
   npm run prisma:generate
   # Takes ~3-5 seconds
   ```

7. **Seed the database with sample data:**
   ```bash
   npm run prisma:seed
   # Takes ~5-10 seconds
   # Creates 53 sample items across all categories
   ```

8. **Start development server:**
   ```bash
   bun dev    # OR: npm run dev
   # Server starts in ~2-3 seconds
   # Available at http://localhost:3000
   ```

### Common Build Commands

- `bun dev` / `npm run dev` - Start development server (~2-3s)
- `bun run build` / `npm run build` - Production build (~30-60s)
- `bun start` / `npm start` - Start production server
- `npm run lint` - Run ESLint (~5-10s)
- `npm run prisma:generate` - Generate Prisma Client (~3-5s, REQUIRED after schema changes)
- `npm run prisma:migrate` - Create/run migrations (~5-10s)
- `npm run prisma:seed` - Seed database with sample data (~5-10s, creates 53 items)
- `npm run prisma:studio` - Open Prisma Studio GUI

### Important Build Notes

- **ALWAYS run `npm run prisma:generate` after modifying `app/prisma/schema.prisma`**
- **Bun may crash in VM environments** - use npm as fallback (see `app/BUN_SETUP.md`)
- **Docker services must be running** before migrations or dev server
- **Use `git --no-pager`** to avoid pager issues in automated contexts
- **No automated tests** - project relies on manual testing currently

### Validation Steps

Before submitting changes:

1. **Verify services:**
   ```bash
   docker exec wardrobe-redis redis-cli ping  # Should return PONG
   ```

2. **Run linter:**
   ```bash
   cd app && npm run lint
   ```

3. **Test build:**
   ```bash
   cd app && npm run build
   ```

4. **Manual testing checklist:**
   - Test on mobile viewport (<1024px) AND desktop (≥1024px)
   - Test in both light and dark mode
   - Verify keyboard navigation works
   - Check loading states and error handling

## Project Structure

```
/home/runner/work/ADHD-Closet/ADHD-Closet/
├── .github/                          # GitHub configuration
│   ├── agents/                       # Custom AI agent definitions
│   ├── humanizer/                    # Documentation humanization tools
│   ├── skills/                       # Reusable AI skills
│   └── workflows/deploy-docs.yml     # MkDocs deployment workflow
├── app/                              # Main Next.js application
│   ├── app/                          # Next.js App Router
│   │   ├── api/                      # API routes (REST endpoints)
│   │   │   ├── items/                # Item CRUD operations
│   │   │   ├── outfits/              # Outfit management
│   │   │   ├── ai/                   # AI job management
│   │   │   ├── images/               # Image processing
│   │   │   └── vision/               # Vision AI endpoints
│   │   ├── components/               # React components
│   │   ├── lib/                      # Shared utilities and logic
│   │   │   ├── ai/                   # AI integration helpers
│   │   │   ├── hooks/                # Custom React hooks
│   │   │   ├── prisma.ts             # Prisma client singleton
│   │   │   ├── queue.ts              # BullMQ queue setup
│   │   │   └── redis.ts              # Redis client
│   │   └── (routes)/                 # Page routes
│   ├── prisma/
│   │   ├── schema.prisma             # Database schema (PostgreSQL)
│   │   └── migrations/               # Database migrations
│   ├── public/                       # Static assets
│   ├── data/                         # Runtime-created local storage
│   │   ├── images/                   # Original and AI-generated images
│   │   └── thumbs/                   # Thumbnail cache
│   ├── .env.example                  # Environment template
│   ├── eslint.config.mjs             # ESLint configuration
│   ├── next.config.ts                # Next.js configuration
│   ├── tailwind.config.ts            # Tailwind CSS configuration
│   ├── tsconfig.json                 # TypeScript configuration
│   ├── capacitor.config.ts           # Capacitor native app config
│   └── package.json                  # Dependencies and scripts
├── docs/                             # MkDocs documentation
│   ├── developer/                    # Technical documentation
│   │   ├── SPEC.md                   # Design system and UX guidelines
│   │   └── ARCHITECTURE.md           # System architecture
│   ├── api/                          # API documentation
│   ├── features/                     # Feature documentation
│   └── user-guides/                  # End-user guides
├── docker-compose.yml                # Redis + optional local PostgreSQL setup
├── mkdocs.yml                        # MkDocs configuration
├── README.md                         # Main project documentation
└── CONTRIBUTING.md                   # Contribution guidelines
```

### Key File Locations

- **Database schema**: `app/prisma/schema.prisma`
- **API routes**: `app/app/api/*/route.ts`
- **React components**: `app/app/components/`
- **Utilities**: `app/app/lib/`
- **Environment config**: `app/.env` (create from `.env.example`)
- **Linting**: `app/eslint.config.mjs`
- **TypeScript**: `app/tsconfig.json`
- **Styling**: `app/app/globals.css` (Material Design 3 tokens)

## Code Conventions & Design Principles

### TypeScript Standards

- **Use strict types**: No `any` unless absolutely necessary
- **Export interfaces**: Make types reusable
- **Document complex types**: Add JSDoc comments for public APIs
- **Zod for validation**: Always validate API inputs with Zod schemas

### React Component Standards

- **Use functional components**: No class components
- **Use 'use client' directive**: Required for client-side hooks/state
- **File naming**: Components in `PascalCase.tsx`, utilities in `camelCase.ts`
- **Extract custom hooks**: Reuse stateful logic (see `app/lib/hooks/`)
- **Memoize expensive operations**: Use `useMemo`, `useCallback` appropriately

### Material Design 3 Compliance

**ALWAYS use these design tokens from `globals.css`:**

- **Colors**: `bg-primary`, `text-on-primary`, `bg-secondary-container`, `text-on-secondary-container`, `bg-surface`, `text-on-surface`
- **Shapes**: Rounded corners 16-28px (`rounded-2xl`, `rounded-3xl`)
- **Buttons**: `rounded-full` for primary, `rounded-xl` for secondary
- **Elevation**: `shadow-elevation-1` through `shadow-elevation-4`
- **Typography**: `text-headline-large`, `text-body-medium`, etc.

**NEVER use arbitrary colors** - always use theme tokens.

### ADHD-Optimized UX Principles

This app is designed FOR neurodivergent users. All changes MUST prioritize:

1. **Minimal Friction**: Auto-save, no forced completion, minimal steps
2. **Decision Paralysis Reducers**: Limit choices to 3-5 max, provide "Panic Pick" quick options
3. **Visual Clarity**: High contrast, obvious CTAs, consistent patterns
4. **Time Blindness Support**: Show time estimates (~30 sec), progress indicators, status visibility
5. **Cognitive Load Reduction**: One thing at a time, category-first navigation, chunked information
6. **Memory Support**: Recent items, prominent search, breadcrumbs, state preservation
7. **Immediate Feedback**: Instant responses (<100ms), success confirmation, optimistic UI
8. **Progressive Disclosure**: Hide advanced options behind "More" buttons

**When adding UI features, always ask:**
- Does this reduce cognitive load?
- Can a user complete this while distracted?
- Is the next step obvious?
- Can they easily undo a mistake?

### API Route Standards

- **Use Zod schemas**: Validate request bodies (see examples in `app/api/items/route.ts`)
- **Return consistent errors**: Use format from `docs/api/API_DOCUMENTATION.md`
- **Include proper status codes**: 200 (success), 201 (created), 400 (validation), 404 (not found), 500 (server error)
- **Document endpoints**: Update `docs/api/API_DOCUMENTATION.md` for new routes

### Database & Prisma Standards

- **Use transactions**: For multi-step database operations
- **Include relations wisely**: Only fetch what you need
- **Index frequently queried fields**: Add `@@index` directives to schema
- **Always run `prisma:generate`**: After any schema changes

### Comment Standards

- **Comment WHY, not WHAT**: Code should be self-explanatory
- **Document ADHD optimizations**: Explain UX decisions
- **Use JSDoc for public APIs**: Helps IDE autocomplete

Example:
```typescript
// ADHD-optimized: Auto-save on blur to reduce "Did I save?" anxiety
<input onBlur={saveChanges} />

/**
 * Generates outfit suggestions with AI.
 * @param constraints - Weather, vibe, occasion filters
 * @returns Array of outfit suggestions (1-5 max to avoid overwhelm)
 */
```

### Documentation Writing Style

Follow humanizer guidelines (`.github/humanizer/README.md`):
- Use direct, simple language
- Replace "serves as" with "is", "boasts" with "has"
- Avoid AI vocabulary: "crucial", "pivotal", "testament", "landscape" (abstract), "showcase"
- Be specific instead of vague: cite actual sources, use concrete examples
- Skip promotional language: "nestled", "vibrant", "stunning"

## GitHub Workflows & CI/CD

### Documentation Deployment

The project uses MkDocs with Material theme for documentation:

- **Workflow**: `.github/workflows/deploy-docs.yml`
- **Trigger**: Push to `main` branch affecting `docs/` or `mkdocs.yml`
- **Build tool**: Python 3.x with `mkdocs-material` and `mkdocs-minify-plugin`
- **Command**: `mkdocs gh-deploy --force`
- **Output**: Deployed to GitHub Pages at https://shelbeely.github.io/ADHD-Closet/

### Agentic Workflows

The project uses [GitHub Agentic Workflows](https://github.github.com/gh-aw/) — Markdown-based workflow definitions that run AI agents in GitHub Actions. These `.md` files in `.github/workflows/` are compiled to `.lock.yml` files via `gh aw compile`.

- **Issue Triage** (`issue-triage.md`): Auto-labels new issues with project-specific categories (bug, enhancement, ui/ux, ai-integration, mobile, accessibility, performance, etc.) and leaves a comment explaining the categorization.
- **CI Doctor** (`ci-doctor.md`): Investigates failed CI runs (Android APK builds), analyzes logs, identifies root causes, and creates diagnostic issues with fix suggestions.
- **Daily Status** (`daily-status.md`): Creates a daily status report issue summarizing recent activity, open issues, phase progress, and action items.
- **PR Review** (`pr-review.md`): Reviews pull requests against project conventions (MD3 compliance, ADHD-optimized UX, TypeScript standards, API patterns) and posts findings as a comment.

To add or modify agentic workflows:
1. Edit the `.md` file in `.github/workflows/`
2. Compile with `gh aw compile`
3. Commit both the `.md` and generated `.lock.yml` files

### Copilot Coding Agent Environment

The file `.github/workflows/copilot-setup-steps.yml` pre-configures the Copilot coding agent's development environment. It runs before the agent starts working and:

- Sets up Bun 1.3.6 as the JavaScript runtime
- Installs dependencies (`bun install` in `app/`)
- Generates the Prisma Client
- Copies `.env.example` to `.env` and injects `DATABASE_URL` from copilot environment secret
- Starts Redis 7 as a service (PostgreSQL is hosted on Supabase)

Note: Database schema creation is NOT part of the setup because Supabase is a persistent hosted database where the schema already exists and persists across all Copilot sessions.

## Environment Variables

### Required
```bash
# Supabase PostgreSQL connection string
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
REDIS_URL="redis://localhost:6379"
OPENROUTER_API_KEY="your-api-key-here"
```

### AI Model Configuration (Optimal Setup)
```bash
# Image generation (REQUIRED for catalog images)
OPENROUTER_IMAGE_MODEL="google/gemini-3-pro-image-preview"

# Vision/OCR (BEST quality for item inference)
OPENROUTER_VISION_MODEL="google/gemini-3-pro-preview"

# Text generation (FAST for outfits)
OPENROUTER_TEXT_MODEL="google/gemini-3-flash-preview"
```

### Optional
```bash
DATA_DIR="./data"                          # Local storage directory
AI_ENABLED="true"                          # Enable/disable AI processing
PUBLIC_BASE_URL="http://localhost:3000"    # Public URL for the app
NODE_ENV="development"                     # Environment mode
```

## Common Issues & Workarounds

### Database Connection Fails
```bash
# Verify your Supabase DATABASE_URL is correct in .env
# Test connection with Prisma
cd app && npx prisma db pull

# If using local PostgreSQL for offline development:
docker compose --profile local-db up -d
docker exec wardrobe-postgres pg_isready -U wardrobe
```

### Redis Connection Issues
```bash
# Verify Redis is running
docker exec wardrobe-redis redis-cli ping
# Should return: PONG

# Restart if needed
docker compose restart redis
```

### Bun Crashes in VM Environments
- See `app/BUN_SETUP.md` for detailed workarounds
- Use npm as fallback - project fully supports both package managers

### Prisma Client Out of Sync
```bash
# Always regenerate after schema changes
npm run prisma:generate

# If migrations fail, reset database (WARNING: deletes all data)
npx prisma migrate reset
```

### Build Failures
- **Missing Prisma Client**: Run `npm run prisma:generate`
- **Type errors after schema change**: Regenerate Prisma Client
- **"Module not found"**: Delete `node_modules` and run `bun install` or `npm install` again

## Search Before Exploration

**Start with memory, then these instructions, then explore if needed.**

**Order of Authority:**
1. **Read `.github/memory/` first** - Most comprehensive and up-to-date architectural knowledge
2. **Trust these copilot instructions** - High-level guidance and conventions
3. **Only then use grep/find/search** if:
   - Memory and instructions incomplete for your specific task
   - You need exact implementation details not covered
   - You encounter errors that contradict documentation

**Remember:** `.github/memory/` contains validated patterns, known issues, and Context7-grounded implementations. Reading it saves exploration time.

## Key Architecture Notes

- **Single-user design**: No authentication/authorization complexity
- **Local image storage**: All images stored in `app/data/images/`, no external CDN
- **Background AI jobs**: BullMQ processes AI requests asynchronously via Redis queue
- **API-first**: Frontend communicates with backend exclusively through `/api` routes
- **Mobile-first responsive**: Breakpoint at 1024px (mobile < 1024px, desktop ≥ 1024px)
- **PWA support**: Service worker for offline capabilities
- **Native apps**: Capacitor bridges web app to iOS/Android with native camera, file system, NFC

## Implementation Status

The project follows a phased development approach:

- ✅ Phase 0: Project setup (Next.js, Prisma, Docker, BullMQ)
- ✅ Phase 1: Core data models and CRUD operations
- ✅ Phase 2: Mobile-first UI with category navigation
- ✅ Phase 3: AI jobs (catalog generation, item inference)
- 🚧 Phase 4: Desktop power tools (bulk edit, advanced filters)
- 🚧 Phase 5: Outfit generation and management
- ⏳ Phase 6: 3D closet rail visualization
- ⏳ Phase 7: Export/import functionality
- ⏳ Phase 8: Polish and hardening

Check GitHub Issues for current priorities and work in progress.
