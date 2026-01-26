# Definition of Done (DoD) + Acceptance Checklist

This is the "ship it" checklist for Wardrobe AI Closet (v1). The goal is to make it impossible for the build to be “mostly done”.

---

## A) Setup & DevEx
- [ ] `docker-compose up` starts Postgres + Redis successfully
- [ ] `pnpm install` (or npm/yarn) works without manual steps
- [ ] `pnpm dev` starts the Next.js app and connects to Postgres
- [ ] Prisma migrations run cleanly: `prisma migrate dev` / `prisma migrate deploy`
- [ ] App boots with an empty DB and shows a usable UI (no crashes)

---

## B) Data Integrity
- [ ] Creating an Item writes a DB record with correct defaults
- [ ] Uploading images writes ImageAsset rows + files on disk
- [ ] Deleting an item is safe (soft delete preferred) and does not orphan files or rows
- [ ] Tagging works (many-to-many) without duplicates
- [ ] State transitions work (available/laundry/unavailable/donate)

---

## C) Mobile Mode (ADHD-first)
### Category-first browsing
- [ ] Mobile home shows category tabs/chips as primary navigation
- [ ] Each category view loads a grid of items using thumbnails
- [ ] Filters are accessible via a drawer and do not overwhelm the main view

### Add Item flow (one-tap)
- [ ] “Add Item” is one-tap from mobile home
- [ ] User can select camera or gallery
- [ ] Item is created immediately after upload starts (even before AI completes)
- [ ] The UI shows a clear “Processing…” state without blocking navigation

### Progressive disclosure
- [ ] Item detail shows “Basics” first (category, state, size, brand, colors)
- [ ] Advanced fields are collapsed by default

### Decision paralysis reducers
- [ ] Outfit generator starts with 2–3 quick constraint choices
- [ ] Results are limited to max 5 outfits
- [ ] “Panic pick” returns a single best outfit

### Time blindness support
- [ ] UI labels flows with estimated time (“~30s to add an item”)
- [ ] No multi-step wizard that forces completion before saving

---

## D) Desktop Mode (Power tools)
- [ ] Desktop layout provides persistent filters + results + inspector (or equivalent)
- [ ] Bulk edit table:
  - [ ] multi-select
  - [ ] apply category/state/tags
  - [ ] batch AI regeneration action
- [ ] Keyboard shortcuts:
  - [ ] `/` focus search
  - [ ] `g` open outfit generator
  - [ ] `e` edit selected item
  - [ ] `l` toggle laundry state
- [ ] Side-by-side compare for 2–4 items
- [ ] Drag/drop outfit builder with role slots (top/bottom/shoes/etc.)
- [ ] Analytics panel loads and shows correct counts by category and tags

---

## E) AI Pipeline (OpenRouter)
> All OpenRouter calls happen server-side. No client keys. All AI outputs are stored with model ID and raw response for reproducibility.

### E1) Catalog image generation (NO transparent cutouts)
- [ ] Uploading a main photo can enqueue `generate_catalog_image`
- [ ] Completed job creates an `ai_catalog` ImageAsset + stores file on disk
- [ ] Thumbnail is generated (Sharp) and stored as `thumbnail` ImageAsset
- [ ] Output image is:
  - [ ] square
  - [ ] centered garment with consistent padding
  - [ ] neutral background
  - [ ] no added text/watermarks
  - [ ] preserves garment colors and graphic detail
- [ ] Failures retry with backoff
- [ ] After retries, job can be marked `needs_review`
- [ ] UI shows before/after and allows Accept/Retry (Retry triggers new job)

### E2) Item inference + label extraction
- [ ] Inference produces structured JSON including:
  - [ ] category (enum, required)
  - [ ] colors/palette
  - [ ] pattern
  - [ ] relevant attributes
  - [ ] emo/goth/alt tags
- [ ] If label photos exist, attempt OCR extraction for size/brand/materials (best-effort)
- [ ] UI shows suggestions with confidence and allows user override

### E3) Outfit generation
- [ ] Generator uses only `available` items
- [ ] Outputs 1–5 outfits with item IDs + roles + explanation
- [ ] User can save outfit and rate it up/down
- [ ] Next generation reflects ratings via simple re-ranking (no fake ML)

---

## F) Three.js Closet Rail (Hanging Cards)
- [ ] Closet rail view uses thumbnails of **AI catalog images**
- [ ] Texture loading is lazy and does not freeze UI
- [ ] Scroll performance is smooth on your devices
- [ ] Search highlights matching cards
- [ ] Drag from rail to outfit builder works on desktop

---

## G) Export / Import
### Export ZIP
- [ ] Export endpoint produces a ZIP containing:
  - [ ] `manifest.json` (app + schema versions)
  - [ ] `export.json` (full data)
  - [ ] `items.csv`
  - [ ] `outfits.csv`
  - [ ] images directory with originals + ai_catalog + thumbs
- [ ] ZIP export restores perfectly after import

### Import ZIP
- [ ] Import validates manifest/schema versions
- [ ] Restores DB records and files to correct locations
- [ ] Handles conflicts safely (fresh install import is the main path)
- [ ] After import, UI loads full closet without errors

---

## H) Security & Privacy
- [ ] OpenRouter key never shipped to client
- [ ] Upload endpoints enforce reasonable file size limits
- [ ] Only images in DATA_DIR are served; no arbitrary file reads
- [ ] App includes an “AI processing sends images to providers” disclosure and toggle
- [ ] If toggle off, app still works (manual categories, no AI jobs)

---

## I) Performance
- [ ] Lists are paginated or virtualized
- [ ] Thumbnails are used in grids and 3D textures (never full-res originals)
- [ ] Background jobs do not block UI requests
- [ ] Three.js view has guardrails for low memory (texture size cap, LOD)

---

## J) “It feels done” checks
- [ ] No dead ends or empty screens without helpful copy
- [ ] No fake data or placeholder demo content
- [ ] Errors are human-readable and actionable
- [ ] The app is stable when adding 50+ items

