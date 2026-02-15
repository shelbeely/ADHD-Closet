# Twin Style - Copilot Instructions

## Repository Summary

Twin Style is a single-user, self-hosted wardrobe organizer powered by **Google Gemini AI**, designed with ADHD-friendly workflows. The name references Gemini (Latin for "twins"), representing the dual nature of **your style** meets **AI assistance**. This app is **specifically built for Gemini models**, leveraging their advanced vision, image generation, and reasoning capabilities. Users take photos of clothing items, Gemini AI generates clean catalog images and suggests categories, and the system provides intelligent outfit recommendations based on weather, mood, and constraints.

**Project Type**: Full-stack web application with optional native mobile apps  
**Size**: ~50k+ lines of code  
**Primary Languages**: TypeScript (95%), JavaScript (3%), CSS (2%)

## Tools & MCP Servers

### Context7 MCP (Model Context Protocol)

**ALWAYS use Context7 MCP when you need library/API documentation, code generation, setup or configuration steps without the user having to explicitly ask.**

Context7 provides up-to-date documentation and code examples from official sources. Use it proactively for:

- **Library Documentation**: When working with any library/framework (Next.js, React, Bun.js, Prisma, etc.)
- **API Reference**: When you need to verify correct API usage or parameters
- **Code Generation**: When implementing features using specific libraries
- **Setup & Configuration**: When configuring tools, build systems, or deployments
- **Best Practices**: When you need to verify if you're following current best practices

**How to use Context7:**

1. **Resolve library ID first** (unless user provides it in `/org/project` format):
   ```
   context7-resolve-library-id: { libraryName: "bun", query: "How to spawn processes in Bun.js" }
   ```

2. **Query documentation** with the resolved library ID:
   ```
   context7-query-docs: { libraryId: "/oven-sh/bun", query: "How to spawn child processes and read their output" }
   ```

**Examples of when to use Context7 automatically:**

- Writing Bun.js code → Query `/oven-sh/bun` docs for correct APIs
- Using Next.js features → Query `/vercel/next.js` docs for App Router patterns
- Implementing Prisma queries → Query `/prisma/prisma` docs for ORM usage
- Setting up React components → Query `/facebook/react` docs for hooks and patterns

**Do NOT call Context7 more than 3 times per question.** If you cannot find what you need after 3 calls, use the best information you have.

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

7. **Start development server:**
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
- Pushes the Prisma schema to create database tables

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

**Trust these instructions first.** Only use grep/find/search tools if:
- The instructions are incomplete for your specific task
- You need to locate exact implementation details not covered here
- You encounter errors that contradict these instructions

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
