# Wardrobe AI Closet (Single-user, Self-hosted) — Coding Agent Handoff Prompt

You are a coding agent. Build a production-ready, single-user, self-hosted web app that helps the user organize a wardrobe using photos and AI-generated catalog-style images. The UI must be mobile-first with an advanced desktop mode.

## Absolute constraints
- Single-user only. No accounts, no auth flows. The server runs privately for the user.
- Images are stored locally on the self-hosted server filesystem.
- There will be **NO transparent cutouts**. Store:
  1) the original user photo(s)
  2) the AI-generated catalog image(s)
- Use **OpenRouter** for AI (vision + text + image generation). All OpenRouter calls must happen server-side.
- ADHD optimization is a hard requirement: reduce friction, reduce overwhelm, reduce decision paralysis, support time blindness.
- Must support: category-based browsing (mobile), desktop power tools (bulk edit, keyboard shortcuts, drag/drop outfits, comparisons, batch tagging, analytics), outfit generation, and a Three.js closet rail view with “hanging cards”.
- Export/backup must produce ZIP containing JSON + CSV + all images. Import from ZIP must restore the closet.

## Tech stack to use
- Frontend: Next.js (App Router) + React + TypeScript
- Styling: Tailwind CSS
- 3D: three.js via @react-three/fiber (R3F) on desktop-first, but must not break mobile
- Backend/API: Next.js Route Handlers (server actions ok where appropriate)
- DB: Postgres (via Prisma ORM). Provide docker-compose for Postgres.
- Background jobs: BullMQ + Redis (docker-compose). Must support retries + status.
- Image handling: server stores originals and AI-generated images as files; store paths in DB. Generate thumbnails server-side (Sharp) for performance.
- Search: Postgres + optional vector search later; for V1 implement fast attribute filters + text search. Similarity search can be stubbed as “later”, but do not ship fake results.

## Deliverables
Create a Git repository with:
- `README.md` with setup, env vars, docker compose, and how to run in dev/prod
- `docker-compose.yml` for app + Postgres + Redis
- `apps/web` Next.js app (or single root app) with typed API routes
- `prisma/schema.prisma` and migrations
- A working UI with mobile and desktop modes
- A robust item ingestion pipeline:
  - upload photo(s) (camera/gallery)
  - queue AI catalog-image generation job
  - queue AI inference job (category/tags/attributes + label OCR if label photo provided)
  - show job progress + allow manual corrections
- Outfit generation:
  - user supplies constraints (weather/time/dysphoria/confidence)
  - system returns 1–5 ranked outfits with explanations
  - user can save outfit and thumbs up/down (used for future ranking)
- Three.js closet rail:
  - uses thumbnail textures of AI-generated catalog images (NOT transparent)
  - lazy-load textures; keep performant
- Export/import:
  - Export ZIP: `export.json`, `items.csv`, `outfits.csv`, and `/images/**`
  - Import ZIP: validates version, restores DB and images

## Data model requirements
Implement these entities (exact names can vary but fields/relationships must exist):

### Item
- id (uuid)
- title (string, optional)
- category (enum: tops, bottoms, dresses, outerwear, shoes, accessories, underwear_bras, jewelry)
- state (enum: available, laundry, unavailable, donate)
- brand (string, optional)
- size_text (string, optional; from label if possible)
- materials (string or json, optional)
- color_palette (json array, optional)
- attributes (json: neckline, sleeve_length, rise, inseam, heel_height, pattern, etc.)
- tags (many-to-many)
- created_at, updated_at

### ImageAsset
- id (uuid)
- item_id (fk)
- kind (enum: original_main, original_back, label_brand, label_care, detail, ai_catalog, thumbnail)
- file_path (string)  # relative under data dir
- width, height, mime
- created_at

### Outfit
- id (uuid)
- title (string optional)
- notes (text optional)
- rating (enum: up, down, neutral)
- created_at
- OutfitItems join table:
  - outfit_id
  - item_id
  - role (enum: top, bottom, dress, outerwear, shoes, accessory, underwear_bras, jewelry)

### Tag
- id, name, created_at

### AIJob
- id
- type (enum: generate_catalog_image, infer_item, extract_label, generate_outfit)
- status (queued, running, succeeded, failed, needs_review)
- input_refs (json)
- output_json (json)
- confidence_json (json)
- error (text)
- created_at, updated_at

## AI behavior requirements (OpenRouter)
All AI calls must be deterministic-friendly:
- Always request **structured JSON** for inference and outfit planning.
- Store the model name, parameters, and raw response in AIJob.output_json for reproducibility.

### 1) Catalog image generation (Nano Banana “pro photo -> catalog”)
Input: original photo(s)
Output: AI-generated catalog image (square, centered, neutral background). NO text overlays.

The prompt must require:
- remove/replace background with neutral
- center garment, consistent padding
- preserve colors and prints
- no watermarks, no added text
- minimize wrinkles only if it doesn't change garment
- crisp edges without halos

### 2) Item inference (vision + text)
From images, infer:
- category (must be one of enum)
- colors (named + palette)
- pattern
- likely attributes (neckline/sleeve, rise/inseam, heel height, etc. when applicable)
- style tags relevant to emo/goth/alt

If label photos provided, attempt OCR extraction for:
- brand
- size_text
- materials

### 3) Outfit generation
Inputs:
- constraints object (weather/time/dysphoria/confidence/occasion optional)
- available items only (exclude laundry/unavailable/donate)
Outputs:
- 1–5 outfits with item IDs and roles
- short explanation per outfit
- optional swap suggestions if an outfit is close but missing something

### Feedback loop
Store thumbs up/down on outfits; use it to re-rank future outputs (simple rules-based re-ranking is acceptable in V1; do not invent ML).

## UX requirements (ADHD-first)
- Mobile home is category-based (chips/tabs). Avoid an “everything feed” by default.
- “Add item” is one-tap and saves immediately; AI runs async.
- Progressive disclosure: show only essential fields first, advanced fields collapsed.
- Decision paralysis reducers:
  - Outfit generator starts with 2–3 quick picks (occasion + vibe + weather auto/manual)
  - Limit output to max 5 outfits
  - Provide a “panic pick” (1 best outfit)
- Time blindness support:
  - show estimated time per flow (“~30s to add an item”)
- Manual override always available. Nothing is locked behind AI success.

## Desktop mode requirements
- Bulk edit view (table)
- Keyboard shortcuts (/ focus search, g generate outfit, e edit selected, etc.)
- Drag/drop outfit builder (items to slots)
- Side-by-side compare (2–4)
- Analytics panel (counts by category/color/tag; most/least worn optional)

## Three.js closet rail requirements
- A “rail” view showing hanging cards using the AI-generated catalog thumbnails.
- Groupable by category/collection.
- Search highlights matching cards.
- Drag from rail into outfit builder on desktop.
- Performance: lazy-load textures, avoid heavy post-processing.

## Local storage layout
On server:
- `data/images/{itemId}/{assetId}.{ext}`
- `data/thumbs/{itemId}/{assetId}.webp`
Paths stored relative to a configurable `DATA_DIR`.

## Environment variables
Must be documented and used:
- `DATABASE_URL`
- `REDIS_URL`
- `OPENROUTER_API_KEY`
- `OPENROUTER_BASE_URL` (default https://openrouter.ai/api/v1)
- `OPENROUTER_IMAGE_MODEL` (default: `google/gemini-3-pro-image-preview` - Nano Banana Pro)
- `OPENROUTER_VISION_MODEL` (default: `google/gemini-3-pro-preview` - Gemini 3 Pro)
- `OPENROUTER_TEXT_MODEL` (default: `google/gemini-3-flash-preview` - Gemini 3 Flash)
- `DATA_DIR`
- `PUBLIC_BASE_URL` (for building absolute URLs where needed)

**Note**: Uses all 3 Gemini models optimally - Image Preview for generation, Pro for vision, Flash for text.

## Acceptance criteria
- User can add an item from phone: upload photo -> item appears immediately -> AI job runs -> generated catalog image appears -> category auto-set -> user can edit fields.
- Desktop: user can bulk edit 20 items, assign tags, and run batch AI regeneration.
- Outfit generator produces outfits using existing items and saves them.
- Three.js closet loads and scrolls smoothly using thumbnails.
- Export produces a ZIP that can be imported to restore everything.

## Don’t do these
- No fake data, no demo placeholders, no “coming soon” buttons.
- No multi-user auth scaffolding.
- No “transparent cutout” pipeline.

Build it.
