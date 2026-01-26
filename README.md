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
- **3D Visualization**: Three.js for closet rail view
- **Backend/API**: Next.js Route Handlers
- **Database**: Postgres (via Prisma ORM)
- **Background Jobs**: BullMQ + Redis
- **AI**: OpenRouter (vision + text + image generation)
- **Image Processing**: Sharp for server-side thumbnails
- **Runtime**: Bun.js (with npm fallback)

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

## Notes

- **Single-user only**: No auth flows, self-hosted
- **Images stored locally**: No CDN dependency
- **No transparent cutouts**: Only originals + AI-generated catalog images
- **OpenRouter required**: All AI processing server-side

## Development Status

Currently implementing Phase 0 (Project Setup). See [TASK_BOARD.md](TASK_BOARD.md) for progress.

## License

[Add your license here]
