# Wardrobe AI Closet — Product & Technical Spec (v1)

## 1. Goals
Build a single-user, self-hosted wardrobe organizer that:
- Captures clothing items via photos + label photos
- Uses AI (OpenRouter) to:
  - generate clean catalog-style images from real photos
  - infer category (preset enums) + attributes + tags
  - optionally extract label data (brand/size/materials)
  - generate outfits with explanations and constraints
- Is ADHD-optimized:
  - minimal friction to add items
  - category-first browsing on mobile
  - decision paralysis reducers (limited ranked outfits, “panic pick”, quick constraints)
  - progressive disclosure for details
- Has a “desktop power mode” with bulk tooling
- Includes a Three.js closet rail view using “hanging cards”
- Stores all images locally on the server (no CDN dependency)
- Supports export/import via ZIP backup

## 2. User profile & style targets
- Personal style: emo/goth/alt
- Pain points: too many items, forgetting items exist, decision paralysis, laundry chaos, mismatched pieces
- Constraints influencing outfits: weather, time, dysphoria, confidence
- Photos:
  - input: real “pro photo” or casual photos
  - output: AI-generated catalog-style images (square, centered, neutral background)
  - NO transparent cutouts

## 3. Functional requirements

### 3.1 Inventory
- Add item via camera/gallery
- Attach multiple photos per item:
  - main, back, details
  - label photos (brand + care/size)
- AI assigns category from preset enum, user can override
- Filters/search by:
  - category, size, color, material, neckline, sleeve length, rise, inseam, heel height, tags, state
- States:
  - available, laundry, unavailable, donate

### 3.2 AI image generation (catalog images)
- For each item, generate a catalog image from the best original photo
- Output must:
  - be square (1024x1024 recommended)
  - center the garment with consistent padding
  - use neutral background
  - preserve colors and graphic details
  - include no text or watermark
- Store generated image locally as `ImageAsset(kind=ai_catalog)`
- Generate a thumbnail `ImageAsset(kind=thumbnail)` for fast grids and 3D

### 3.3 AI inference
- Inference job produces structured JSON:
  - category (enum, required)
  - color palette + named colors
  - pattern
  - attributes relevant to category
  - tags aligned with emo/goth/alt
- Label extraction (when label photos exist):
  - brand, size_text, materials (best-effort)
- UI shows “AI suggestions” with confidence and allows user edits

### 3.4 Collections
- Full closet view + auto-generated collections
- Auto collections examples:
  - by category
  - by dominant color
  - by frequent tags
  - “recently added”, “never worn” (wear tracking can be added later)

### 3.5 Outfits
- Outfit generation accepts constraints:
  - weather (auto/manual)
  - time available (quick/normal)
  - vibe: dysphoria-safe / confidence boost / dopamine / neutral
  - occasion optional
- Produces 1–5 ranked outfits, each with:
  - item IDs + roles
  - short explanation
  - optional swap suggestions
- Save outfit; user rates up/down/neutral
- Feedback influences future ranking (rules-based is fine in v1)

### 3.6 Desktop power tools
- Bulk edit (table)
- Keyboard shortcuts
- Drag/drop outfit builder
- Side-by-side compare
- Batch tagging + batch AI regeneration
- Analytics panel

### 3.7 Three.js closet rail
- Hanging-card rail view using item thumbnails (ai_catalog thumbnails)
- Group by category / collection
- Search highlights cards
- Drag from rail to outfit board (desktop)
- Performance: lazy-load textures, low draw calls

### 3.8 Export / Import
- Export ZIP includes:
  - `export.json` (full data)
  - `items.csv`, `outfits.csv` (and optionally tags)
  - all images under `/images/**` and `/thumbs/**`
  - `manifest.json` with app version and schema version
- Import ZIP validates manifest, restores DB and files

## 4. Non-goals (v1)
- Multi-user auth/accounts
- Social sharing
- Full cloth simulation in 3D
- Sensory tolerance tracking (explicitly not needed now)
- Embedding-based similarity search (may be v2)

## 5. Architecture

### 5.1 High-level
- Next.js (App Router) provides UI + API routes
- Postgres stores metadata
- Redis + BullMQ runs background AI jobs
- Filesystem stores original and generated images

### 5.2 Storage layout
- `DATA_DIR/images/{itemId}/{assetId}.{ext}`
- `DATA_DIR/thumbs/{itemId}/{assetId}.webp`

### 5.3 Background jobs
Job types:
- generate_catalog_image
- infer_item
- extract_label
- generate_outfit
Each job:
- stores model id + parameters
- stores raw response + parsed JSON
- supports retry with backoff
- can be marked `needs_review`

### 5.4 OpenRouter usage
- Server-side only
- Configurable model IDs via env vars:
  - image model: catalog generation (“nano banana pro” or equivalent)
  - vision model: inference/OCR
  - text model: outfit planning & structured JSON transforms

## 6. APIs (recommended)
- Items CRUD
- Image upload/stream
- AI job enqueue + status
- Outfits CRUD + rating
- Export/import endpoints

## 7. UI requirements

### 7.1 Mobile
- Home: category tabs
- Add Item: one-tap, minimal steps
- Item detail: essentials first, advanced collapsible
- AI status shown unobtrusively

### 7.2 Desktop
- Split-panel browse + inspector
- Bulk table with inline edit
- Keyboard shortcuts
- Outfit board with drag/drop
- 3D closet view accessible as a tab/lens

## 8. Acceptance tests (manual)
- Add item -> AI catalog image generated -> item categorized -> user edits -> persists
- Bulk edit 20 items on desktop
- Generate outfits with constraints; save; rate; next generation reflects ratings
- 3D closet loads and remains responsive
- Export ZIP -> wipe DB -> import ZIP -> full restore

## 9. Implementation plan
Phase 1: CRUD + image storage + mobile browse
Phase 2: job queue + catalog image gen + inference + review UI
Phase 3: outfit generation + feedback loop + desktop power tools
Phase 4: Three.js closet rail + perf pass
Phase 5: export/import + polish
