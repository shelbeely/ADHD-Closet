# Repository Map

**Last Updated:** 2026-02-15  
**Purpose:** High-level folder structure and responsibilities

## Overview

Twin Style is a ~50k+ LOC TypeScript/React application organized as a Next.js 16 App Router monorepo.

```
Repository Root: /home/runner/work/ADHD-Closet/ADHD-Closet/
```

## Top-Level Structure

```
/
├── .github/              # GitHub configuration, workflows, and development artifacts
├── app/                  # Main Next.js application (primary codebase)
├── docs/                 # MkDocs documentation site
├── reference/            # Reference materials (screenshots, API examples, scripts)
├── docker-compose.yml    # Redis service (PostgreSQL hosted on Supabase)
├── mkdocs.yml           # Documentation site configuration
├── README.md            # Project overview
└── CONTRIBUTING.md      # Contribution guidelines
```

## `.github/` - GitHub Configuration

```
.github/
├── README.md            # Guide to .github directory structure
├── copilot-instructions.md   # Copilot agent behavior guidelines
├── agents/              # Custom AI agent definitions (invoke directly)
│   ├── README.md
│   ├── humanizer.agent.md
│   └── remotion.agent.md
├── skills/              # Agent skills (loaded automatically by context)
│   ├── README.md
│   ├── humanizer/
│   ├── remotion/
│   └── threejs-fundamentals/
├── workflows/           # GitHub Actions & agentic workflows
│   ├── README.md
│   ├── build-android-apk.yml      # Android APK build
│   ├── copilot-setup-steps.yml    # Copilot environment setup
│   ├── deploy-docs.yml            # MkDocs deployment to GitHub Pages
│   ├── ci-doctor.md               # Failed CI investigation (agentic workflow)
│   ├── daily-status.md            # Daily status reports (agentic workflow)
│   ├── issue-triage.md            # Auto-label issues (agentic workflow)
│   └── pr-review.md               # Pull request review (agentic workflow)
├── artifacts/           # Development session summaries and historical documents
│   ├── README.md
│   └── ... (15 historical summaries, including humanizer integration docs)
└── memory/              # THIS DIRECTORY - Persistent knowledge base
    ├── README.md
    └── ... (7 knowledge files)
```

**Key Points:**
- `README.md` at root of `.github/` provides complete directory guide
- Each subdirectory has its own README explaining purpose and contents
- Custom agents (invoke directly) vs agent skills (auto-loaded) distinction
- Agentic workflows (`.md` files) compiled to `.lock.yml` via `gh aw compile`
- `copilot-setup-steps.yml` pre-configures dev environment for Copilot agents
- `memory/` is the authoritative knowledge base for AI agents (READ FIRST)
- `artifacts/` contains historical summaries from development sessions
- Humanizer content consolidated: skills in `skills/humanizer/`, agent in `agents/`, historical docs in `artifacts/`

## `app/` - Main Application

**Path:** `/home/runner/work/ADHD-Closet/ADHD-Closet/app/`

```
app/
├── app/                 # Next.js App Router application code
│   ├── api/            # API routes (REST endpoints)
│   ├── components/     # Reusable React components
│   ├── lib/            # Shared utilities and business logic
│   ├── (routes)/       # Page routes
│   ├── globals.css     # Material Design 3 tokens and global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── prisma/             # Database schema and migrations
│   ├── schema.prisma   # Database schema (PostgreSQL)
│   ├── migrations/     # Database migrations
│   ├── seed.ts         # Basic seed (53 items)
│   ├── seed-extension.ts   # Full seed (71 items + AI jobs)
│   └── seed-demo.ts    # Demo seed (284 items, realistic)
├── public/             # Static assets
├── scripts/            # Helper scripts
│   └── ziit/          # Ziit heartbeat monitoring scripts
├── data/              # Runtime-created local storage (gitignored)
│   ├── images/        # Original and AI-generated images
│   └── thumbs/        # Thumbnail cache
├── .env               # Environment configuration (create from .env.example)
├── .env.example       # Environment template
├── capacitor.config.ts  # Capacitor native app config
├── eslint.config.mjs  # ESLint configuration
├── next.config.ts     # Next.js configuration
├── package.json       # Dependencies and scripts
├── prisma.config.ts   # Prisma adapter configuration
├── tailwind.config.ts # Tailwind CSS configuration
└── tsconfig.json      # TypeScript configuration
```

### `app/app/api/` - API Routes (Backend)

```
api/
├── accessories/       # Accessory-specific endpoints
├── ai/               # AI job management
│   └── jobs/        # Job status queries
├── export/          # Data export (ZIP backup)
├── images/          # Image streaming
│   └── [id]/       # Stream image by ID
├── import/          # Data import (ZIP restore)
├── items/           # Item CRUD operations
│   ├── route.ts          # List items, create item
│   ├── [id]/route.ts     # Get, update, delete item
│   └── [id]/images/route.ts  # Upload images
├── nfc/             # NFC tag management
├── outfit-images/   # Outfit visualization images
├── outfits/         # Outfit management
│   ├── route.ts         # List outfits, create outfit
│   ├── [id]/route.ts    # Get, update, delete outfit
│   ├── [id]/visualize/route.ts  # Generate outfit image
│   └── generate/route.ts  # AI outfit generation
├── reminders/       # Laundry reminders
├── tags/            # Tag CRUD
└── vision/          # Vision AI endpoints
```

**Key Points:**
- All routes use Zod for input validation
- API returns consistent error format (see `docs/api/API_DOCUMENTATION.md`)
- Image uploads create BullMQ jobs for async AI processing

### `app/app/components/` - React Components

```
components/
├── AddItemButton.tsx       # Floating action button
├── BulkEditTable.tsx       # Desktop bulk editing UI
├── CategoryTabs.tsx        # Mobile category navigation
├── ClosetRail.tsx          # 3D closet visualization (Three.js)
├── EnhancedSearch.tsx      # Search with filters
├── FilterPanel.tsx         # Desktop filters sidebar
├── ItemCard.tsx            # Item display card
├── ItemGrid.tsx            # Responsive grid layout
├── NotificationPrompt.tsx  # Permission request
└── ...                     # Other UI components
```

**Key Points:**
- All components use Material Design 3 tokens from `globals.css`
- Mobile-first responsive design (breakpoint: 1024px)
- `'use client'` directive for client-side hooks

### `app/app/lib/` - Utilities and Business Logic

```
lib/
├── ai/
│   ├── openrouter.ts      # OpenRouter API client
│   ├── visionEnhancements.ts  # Vision prompt engineering
│   └── worker.ts          # BullMQ worker for AI jobs
├── hooks/
│   ├── useAuth.ts         # Auth hooks (future)
│   ├── useItems.ts        # Item data fetching
│   └── ...
├── attributeDefinitions.ts  # Item attribute schemas
├── attributeSearch.ts       # Search logic
├── attributeValidation.ts   # Validation helpers
├── capacitor.ts             # Native bridge utilities
├── colorHarmony.ts          # Color pairing algorithms
├── notifications.ts         # Push notification helpers
├── prisma.ts               # Prisma client singleton
├── queue.ts                # BullMQ queue setup
├── redis.ts                # Redis client
├── seasonalIntelligence.ts # Weather-based recommendations
├── styleProfile.ts         # User style preferences
└── theme.tsx               # Theme provider
```

**Key Points:**
- `prisma.ts` exports singleton Prisma client with PrismaPg adapter
- `queue.ts` exports `aiJobQueue` for async AI processing
- `worker.ts` is the BullMQ worker that processes AI jobs

### `app/app/(routes)/` - Page Routes

```
(routes)/
├── analytics/          # Analytics dashboard
├── closet-rail/        # 3D closet visualization
├── guide/              # Fit & Proportion guide
├── items/
│   ├── [id]/          # Item detail page
│   └── new/           # Add item page
├── nfc-scan/          # NFC tag scanning
├── outfits/
│   ├── [id]/          # Outfit detail
│   └── generate/      # Outfit generator
├── settings/          # App settings
└── page.tsx           # Home page (category grid)
```

**Key Points:**
- Mobile: Category-first navigation
- Desktop: Table view with advanced filters
- Progressive disclosure: Advanced features hidden until needed

## `docs/` - Documentation

```
docs/
├── api/               # API documentation
├── developer/
│   ├── ARCHITECTURE.md   # System architecture (more detailed than this file)
│   └── SPEC.md           # Design system and UX guidelines
├── features/          # Feature documentation
├── mobile/            # Mobile app guides
├── screenshots/       # Screenshot guides
├── user-guides/       # End-user documentation
├── CONTEXT7_LIBRARY_IDS.md    # Context7 library ID reference
├── STACK_VALIDATION.md        # Tech stack validation report
└── index.md           # Documentation home
```

**Key Points:**
- `CONTEXT7_LIBRARY_IDS.md` is the authoritative reference for Context7 MCP usage
- `SPEC.md` defines Material Design 3 compliance and ADHD-optimized UX patterns
- Documentation deployed to GitHub Pages via MkDocs

## `reference/` - Reference Materials

```
reference/
├── notebooklm/          # NotebookLM documentation export
│   ├── 01-PROJECT-OVERVIEW.md
│   ├── 02-TECHNICAL-ARCHITECTURE.md
│   ├── 03-DATABASE-SCHEMA.md
│   └── ... (12 structured guides)
├── openrouter/          # OpenRouter API reference materials
│   ├── generate_outfits.schema.json
│   ├── infer_item.schema.json
│   └── validation_notes.md
├── screenshots/         # Application screenshots for documentation
│   ├── 01-home-page-default.png
│   ├── 02-desktop-table-view-with-notification.png
│   └── ... (16+ screenshots)
├── scripts/             # Helper scripts
│   └── prepare-wiki.sh  # GitHub Wiki preparation script
└── README.md            # Reference materials guide
```

**Key Points:**
- Not required for building or running the application
- Used for documentation and development reference
- Screenshots referenced in README and docs

## Key File Locations (Quick Reference)

| Purpose | Path |
|---------|------|
| Database schema | `app/prisma/schema.prisma` |
| Prisma client | `app/app/lib/prisma.ts` |
| BullMQ queue | `app/app/lib/queue.ts` |
| AI worker | `app/app/lib/ai/worker.ts` |
| API routes | `app/app/api/*/route.ts` |
| React components | `app/app/components/*.tsx` |
| Global styles | `app/app/globals.css` |
| Environment config | `app/.env` (create from `.env.example`) |
| TypeScript config | `app/tsconfig.json` |
| Next.js config | `app/next.config.ts` |
| Tailwind config | `app/tailwind.config.ts` |
| ESLint config | `app/eslint.config.mjs` |

## Important Patterns

### Single-User Design
- No authentication/authorization complexity
- All data belongs to the single user
- Simplified permission model

### API-First Architecture
- Frontend communicates exclusively through `/api` routes
- No direct database access from components
- Zod schemas validate all inputs

### Background AI Processing
- Image uploads → immediate response, async AI processing
- BullMQ queues jobs in Redis
- Worker processes jobs with OpenRouter API
- Status tracked in `AIJob` table

### Local Image Storage
- All images in `app/data/images/` (gitignored)
- Thumbnails cached in `app/data/thumbs/`
- No external CDN required
- Sharp for image processing

### Mobile-First Responsive
- Breakpoint: 1024px
- Mobile (<1024px): Category navigation, simplified UI
- Desktop (≥1024px): Table view, bulk edit, advanced filters

---

**Next:** See `architecture.md` for data flows and system interactions
