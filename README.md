# Wardrobe AI Closet — Handoff Bundle

A single-user, self-hosted wardrobe organizer powered by AI.

## What's in this repository

- **`/app`** — Next.js application (see [app/README.md](app/README.md))
- **`docker-compose.yml`** — Postgres + Redis setup
- **Documentation** — Product spec, API contracts, and implementation guides

## Quick Start

```bash
# 1. Start database services
docker-compose up -d

# 2. Set up the app
cd app
cp .env.example .env
# Edit .env and add your OPENROUTER_API_KEY

# 3. Install dependencies (Bun recommended, npm works too)
bun install  # or: npm install

# 4. Run migrations
npx prisma migrate dev

# 5. Start development server
bun dev  # or: npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Architecture

- **Frontend**: Next.js 16 (App Router) + React + TypeScript + Tailwind CSS
- **Design System**: Material Design 3 Expressive with ADHD-optimized patterns
- **3D Visualization**: Three.js for closet rail view
- **Backend/API**: Next.js Route Handlers
- **Database**: Postgres (via Prisma ORM)
- **Background Jobs**: BullMQ + Redis
- **AI**: OpenRouter (vision + text + image generation via Nano Banana Pro)
- **Image Processing**: Sharp for server-side thumbnails
- **Runtime**: Bun.js (with npm fallback)

## Design Principles

### Material Design 3 Expressive
- Dynamic color system with surface tinting
- Rounded, expressive shapes (16-28px radius)
- Elevation-based depth hierarchy
- Material You typography scale
- Smooth transitions and motion (200-300ms)
- Touch-friendly targets (48x48dp minimum)

### ADHD-Optimized UX
- **Minimal Friction**: Auto-save, no forced completion, reduce steps
- **Decision Paralysis Reducers**: Limit choices (3-5 max), progressive disclosure, guided workflows
- **Visual Clarity**: High contrast, obvious CTAs, consistent patterns
- **Time Blindness Support**: Show time estimates (~30 sec), progress indicators, status visibility
- **Reduced Cognitive Load**: One thing at a time, category-first navigation, chunked information
- **Memory Support**: Recent items, prominent search, breadcrumbs, state preservation
- **Immediate Feedback**: Instant responses (<100ms), success confirmation, optimistic UI

See [SPEC.md](SPEC.md) for complete design system guidelines.

## Key Features

- **Photo-based item capture** with AI-generated catalog images
- **Smart categorization** and attribute inference
- **Outfit generation** with constraint-based filtering
- **ADHD-optimized UX** (minimal friction, decision paralysis reducers)
- **Desktop power tools** (bulk edit, keyboard shortcuts, drag/drop)
- **3D closet rail view** with hanging cards
- **Export/import** via ZIP backup

## Documentation

This bundle includes:
- `HANDOFF_PROMPT.md` — Coding agent prompt
- `SPEC.md` — Full product + technical spec
- `API_CONTRACT.md` — REST API documentation
- `TASK_BOARD.md` — Implementation checklist
- `DEFINITION_OF_DONE.md` — Acceptance criteria
- `KEYBOARD_SHORTCUTS.md` — Desktop shortcuts reference
- `SECURITY_PRIVACY.md` — Security considerations
- `PERFORMANCE.md` — Performance budget
- `app/README.md` — Development guide
- `app/BUN_SETUP.md` — Bun.js setup and troubleshooting
- `.github/humanizer/` — Writing guidelines to maintain clear, natural documentation

## Notes

- **Single-user only**: No auth flows, self-hosted
- **Images stored locally**: No CDN dependency
- **No transparent cutouts**: Only originals + AI-generated catalog images
- **OpenRouter required**: All AI processing server-side

## Development Status

Currently implementing Phase 0 (Project Setup). See [TASK_BOARD.md](TASK_BOARD.md) for progress.

## License

[Add your license here]
