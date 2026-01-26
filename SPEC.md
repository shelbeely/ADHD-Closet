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

### 7.0 Design System (Material Design 3 Expressive)
All UI must follow Material Design 3 Expressive guidelines to ensure consistency, accessibility, and modern aesthetics:

#### 7.0.1 Material Design 3 Principles
- **Dynamic Color**: Use Material You color system with primary, secondary, tertiary color roles
- **Expressive Shapes**: Rounded corners (12-28px radius) for containers, cards, and buttons
- **Surface Tinting**: Apply subtle color tints to surfaces for depth and hierarchy
- **Elevation System**: Use shadow-elevation-1 through shadow-elevation-4 for depth
- **Motion & Transitions**: Smooth 200-300ms transitions with easing curves
- **Typography Scale**: Material Design 3 type scale (Display, Headline, Title, Body, Label)
- **Touch Targets**: Minimum 48x48dp for all interactive elements

#### 7.0.2 Color Tokens
Implement full Material Design 3 color system:
- Primary: Main brand color and primary actions
- Secondary: Supporting actions and components
- Tertiary: Accents and highlights
- Surface variants: Container backgrounds with different elevations
- On-colors: Text/icons on colored backgrounds
- Inverse colors: For snackbars and tooltips

#### 7.0.3 Component Specifications
- **Buttons**: Filled (primary actions), Tonal (secondary), Outlined (tertiary), Text (low emphasis)
- **Cards**: Elevated, Filled, Outlined with 16-24px rounded corners
- **FAB**: 56x56dp main FAB, 40x40dp mini FAB
- **Top App Bar**: 64dp height with elevation on scroll
- **Bottom Navigation**: 80dp height (if needed for mobile navigation)
- **Chips**: Filter chips (toggle), Input chips (removable), Suggestion chips
- **Text Fields**: Outlined style with 12px corner radius, proper focus states

### 7.1 ADHD-Optimized UX Principles
All design decisions must prioritize ADHD users' needs:

#### 7.1.1 Minimal Friction
- **No forced completion**: Save work automatically, allow partial inputs
- **Reduce steps**: Combine or eliminate unnecessary steps
- **Quick actions**: One-tap for common tasks (add item = take photo → done)
- **Smart defaults**: Pre-select most common options
- **Forgiving**: Easy undo, no destructive actions without confirmation

#### 7.1.2 Decision Paralysis Reducers
- **Limit choices**: Show 3-5 options max in any single view
- **Progressive disclosure**: Hide advanced options behind "More" buttons
- **Guided workflows**: Clear next steps, avoid open-ended decisions
- **Quick picks**: "Panic pick" or "Quick outfit" for time pressure
- **Constrained generation**: Outfit generator limits to 1-5 results, never overwhelming

#### 7.1.3 Visual Clarity
- **High contrast**: WCAG AAA compliant text contrast ratios
- **Clear hierarchy**: Obvious visual difference between primary/secondary actions
- **Obvious CTAs**: Primary action buttons are unmissable (64dp height, bright color)
- **Consistent patterns**: Same action looks the same everywhere
- **Visual feedback**: Immediate response to all interactions (loading states, success confirmation)

#### 7.1.4 Time Blindness Support
- **Time estimates**: Show "~30 seconds" for tasks
- **Progress indicators**: Clear progress bars or step counters (1 of 3)
- **Auto-save**: No "remember to save" burden
- **Status visibility**: Always show what's happening (Processing, Done, Failed)

#### 7.1.5 Reduced Cognitive Load
- **One thing at a time**: Single focus per screen
- **Category-first navigation**: Filters by category reduce overwhelming "all items" view
- **Chunked information**: Group related fields, collapse non-essential details
- **Clear labels**: No ambiguous icons without labels
- **Contextual help**: Inline tips where needed ("AI will fill this in")

#### 7.1.6 Memory & Attention Support
- **Recent items visible**: Show last 5 accessed items for quick return
- **Search prominence**: Easy-to-find search in consistent location
- **Breadcrumbs**: Always show where you are and how to get back
- **No dead ends**: Every screen has a clear exit/back action
- **State preservation**: Remember filters, scroll position when navigating back

#### 7.1.7 Immediate Feedback
- **Instant responses**: Loading states appear within 100ms
- **Success confirmation**: Clear visual/haptic feedback for actions
- **Error recovery**: Errors explain what happened and how to fix
- **Optimistic UI**: Show success immediately, handle errors async

### 7.2 Mobile (ADHD-first)
- Home: category tabs (not overwhelming "all items" by default)
- Add Item: one-tap photo → optional details → auto-save (30 sec time estimate shown)
- Item detail: essentials first (photo, category, state), advanced collapsible
- AI status shown unobtrusively (progress ring, not blocking)
- No multi-step wizards that must be completed
- Floating Action Button always visible for adding items

### 7.3 Desktop
- Split-panel browse + inspector
- Bulk table with inline edit
- Keyboard shortcuts (documented and discoverable)
- Outfit board with drag/drop
- 3D closet view accessible as a tab/lens
- All mobile patterns work on desktop (responsive)

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
