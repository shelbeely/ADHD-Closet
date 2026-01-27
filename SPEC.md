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
  - **Front (main)**: Primary photo showing the front of the garment
  - **Back**: Photo showing the back view of the garment (essential for clothing items)
  - **Details**: Close-up photos of specific features (embroidery, buttons, texture)
  - **Label photos**:
    - Brand label photo (for brand/size/material extraction)
    - Care label photo (for care instructions)
- **Image workflow (ADHD-optimized)**:
  - Step 1: Upload front photo (required, minimal friction)
  - Step 2: Optionally add back photo (progressive disclosure, clearly prompted)
  - Step 3: Optionally add label/detail photos (progressive disclosure, skippable)
  - All photos can be added/edited later from item detail page
- **Display logic for items with multiple views**:
  - Items with **both front and back** photos: Display **side-by-side split view** showing both simultaneously
    - Left half: Front photo with "Front" label at bottom
    - Right half: Back photo with "Back" label at bottom
    - Vertical divider line between photos for clear separation
    - ADHD-optimized: See both views at once, no interaction needed, complete context immediately
  - Items with **front only**: Display front image normally
  - Items with **back only**: Display back image normally
  - No flip interaction needed - both views visible simultaneously when both exist
- AI assigns category from preset enum, user can override
- Filters/search by:
  - category, size, color, material, neckline, sleeve length, rise, inseam, heel height, tags, state
- States:
  - available, laundry, unavailable, donate

### 3.2 AI image generation (catalog images)
- For each item, generate catalog images from original photos
- **Generate from front photo** (primary catalog image):
  - Input: `ImageAsset(kind=original_main)`
  - Output: `ImageAsset(kind=ai_catalog)` with front view
- **Generate from back photo** (optional secondary catalog image):
  - Input: `ImageAsset(kind=original_back)`
  - Output: `ImageAsset(kind=ai_catalog)` with back view
  - Helpful for items with interesting back designs or full context
- Output requirements for all catalog images:
  - Square format (1024x1024 recommended)
  - Center the garment with consistent padding
  - Use neutral background (white or light gray)
  - Preserve colors and graphic details
  - Include no text or watermark
- Store generated images locally as `ImageAsset(kind=ai_catalog)`
- Generate thumbnails `ImageAsset(kind=thumbnail)` for fast grids and 3D (512px WebP)

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

### 7.0 Design Philosophy
**Goal**: Design and implement user interfaces that are ADHD-friendly, emotionally safe, and cognitively low-friction, while remaining fully compliant with Material Design 3 guidelines.

### 7.0.1 Core Design Principles
- **Strict Material Design 3 Compliance**: Follow M3 specifications including:
  - Color roles (primary, secondary, tertiary, surface, surfaceVariant, error, etc.)
  - Shape tokens (16-28px rounded corners)
  - Typography scale (Display, Headline, Title, Body, Label)
  - Elevation and tonal surfaces
  - Motion tokens and easing curves
- **Opinionated Defaults**: Use defaults to reduce cognitive load
- **Clarity Over Novelty**: Novelty is allowed only when it improves comprehension or emotional regulation
- **Explain Decisions**: All design decisions must be explained in terms of M3 principles and cognitive load

### 7.0.2 Material Design 3 Principles
- **Dynamic Color**: Use Material You color system with primary, secondary, tertiary color roles
- **Expressive Shapes**: Rounded corners (16-28px radius) for containers, cards, and buttons
- **Surface Tinting**: Apply subtle color tints to surfaces for depth and hierarchy
- **Elevation System**: Use shadow-elevation-1 through shadow-elevation-4 for depth
- **Motion & Transitions**: Smooth 200-300ms transitions with easing curves
- **Typography Scale**: Material Design 3 type scale (Display, Headline, Title, Body, Label)
- **Touch Targets**: Minimum 48x48dp for all interactive elements

### 7.0.3 Color Tokens
Implement full Material Design 3 color system:
- Primary: Main brand color and primary actions
- Secondary: Supporting actions and components
- Tertiary: Accents and highlights
- Surface variants: Container backgrounds with different elevations
- On-colors: Text/icons on colored backgrounds
- Inverse colors: For snackbars and tooltips
- Error, warning, success states with proper contrast

### 7.0.4 Component Specifications
- **Buttons**: Filled (primary actions), Tonal (secondary), Outlined (tertiary), Text (low emphasis)
- **Cards**: Elevated, Filled, Outlined with 16-24px rounded corners
- **FAB**: 56x56dp main FAB, 40x40dp mini FAB
- **Top App Bar**: 64dp height with elevation on scroll
- **Bottom Navigation**: 80dp height (if needed for mobile navigation)
- **Chips**: Filter chips (toggle), Input chips (removable), Suggestion chips
- **Text Fields**: Outlined style with 12px corner radius, proper focus states
- **Reusable Components**: Prefer reusable components and design tokens over one-off styles

### 7.1 ADHD-Friendly UX Rules
All design decisions must prioritize ADHD users' needs:

#### 7.1.1 Visual Hierarchy & Focus
- **One primary action per screen**: Never compete for attention
- **Secondary actions visually demoted**: Use tonal or outlined buttons
- **Strong visual hierarchy**: Size, color, and position clearly indicate importance
- **Avoid competing focal points**: One clear path forward
- **No destructive actions as primary actions**: Destructive actions must be secondary or require confirmation

#### 7.1.2 Progressive Disclosure & Simplicity
- **Show only what is necessary**: Hide advanced options until explicitly requested
- **Reduce visual noise**: Avoid dense layouts or excessive elements
- **Design for low-focus states**: Interfaces must remain usable when attention/energy is low
- **Avoid hidden gestures**: Unless clearly signposted
- **Prefer card-based layouts**: Over dense tables or long lists

#### 7.1.3 Minimal Friction
- **No forced completion**: Save work automatically, allow partial inputs
- **Reduce steps**: Combine or eliminate unnecessary steps
- **Quick actions**: One-tap for common tasks (add item = take photo → done)
- **Smart defaults**: Pre-select most common options
- **Forgiving**: Easy undo, no destructive actions without confirmation

#### 7.1.4 Decision Paralysis Reducers
- **Limit choices**: Show 3-5 options max in any single view
- **Progressive disclosure**: Hide advanced options behind "More" buttons
- **Guided workflows**: Clear next steps, avoid open-ended decisions
- **Quick picks**: "Panic pick" or "Quick outfit" for time pressure
- **Constrained generation**: Outfit generator limits to 1-5 results, never overwhelming

#### 7.1.5 Visual Clarity & Feedback
- **High contrast**: WCAG AAA compliant text contrast ratios
- **Clear hierarchy**: Obvious visual difference between primary/secondary actions
- **Obvious CTAs**: Primary action buttons are unmissable (64dp height, bright color)
- **Consistent patterns**: Same action looks the same everywhere
- **Immediate feedback**: All interactive elements must provide immediate feedback
  - Use motion, state changes, or confirmations to acknowledge actions
  - Motion must communicate cause and effect
  - Avoid decorative or excessive animation
- **Never rely on color alone**: Always provide additional indicators (icons, text, patterns)

#### 7.1.6 Layout & Spacing
- **Vertical rhythm**: Use consistent spacing to guide attention
- **Touch targets well-separated**: Prevent accidental taps
- **Comfortable target sizes**: Minimum 48x48dp, prefer 56x56dp for primary actions
- **White space is functional**: Not decorative, guides attention

#### 7.1.7 Time Blindness Support
- **Time estimates**: Show "~30 seconds" for tasks
- **Progress indicators**: Clear progress bars or step counters (1 of 3)
- **Auto-save**: No "remember to save" burden
- **Status visibility**: Always show what's happening (Processing, Done, Failed)

#### 7.1.8 Reduced Cognitive Load
- **One thing at a time**: Single focus per screen
- **Category-first navigation**: Filters by category reduce overwhelming "all items" view
- **Chunked information**: Group related fields, collapse non-essential details
- **Clear labels**: No ambiguous icons without labels
- **Contextual help**: Inline tips where needed ("AI will fill this in")

#### 7.1.9 Memory & Attention Support
- **Recent items visible**: Show last 5 accessed items for quick return
- **Search prominence**: Easy-to-find search in consistent location
- **Breadcrumbs**: Always show where you are and how to get back
- **No dead ends**: Every screen has a clear exit/back action
- **State preservation**: Remember filters, scroll position when navigating back

#### 7.1.10 Error Handling & Emotional Safety
- **Errors must be forgiving**: Provide clear recovery paths
- **Support undo actions**: Wherever possible
- **Never blame the user**: Or imply failure
- **Clear recovery paths**: Explain what happened and how to fix
- **Optimistic UI**: Show success immediately, handle errors async
- **Design for stress states**: Assume users may experience anxiety, dysphoria, or executive dysfunction

#### 7.1.11 Motion & Animation
- **Use M3 motion tokens intentionally**: Motion must communicate cause and effect
- **Avoid decorative animation**: Motion should support attention, not distract
- **Respect reduced motion preferences**: Essential for users with attention sensitivities
- **200-300ms transitions**: With proper easing curves
- **Motion as feedback**: Acknowledge interactions immediately

#### 7.1.12 Accessibility & Inclusion
- **Sufficient color contrast**: In all states (hover, active, disabled)
- **Never rely on color alone**: To communicate meaning
- **Support dynamic type scaling**: Text must remain readable at all sizes
- **Screen reader compatible**: Proper ARIA labels and semantic HTML
- **Keyboard navigation**: All interactions must be keyboard-accessible
- **Assume variable capacity**: Design must work during stress, dysphoria, anxiety, or executive dysfunction
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

## 8. Progressive Web App (PWA) & Notifications

### 8.1 PWA Features
- **Installable**: Users can add app to home screen on mobile and desktop
- **Offline capable**: Service worker caches critical resources
- **App-like**: Runs in standalone mode with custom theme colors
- **Fast**: Caching strategy optimizes load times
- **Manifest**:
  - Name: "Wardrobe AI Closet"
  - Short name: "My Closet"
  - Icons: 192x192 and 512x512 PNG with maskable support
  - Theme color: #6750a4 (Material Design 3 primary)
  - Background color: #ffffff
  - Display: standalone
  - Orientation: portrait-primary (mobile-first)
  - Shortcuts: "Add Item" and "Generate Outfit" for quick access

### 8.2 Service Worker Caching Strategy
- **Google Fonts**: CacheFirst (1 year expiration)
- **OpenRouter API**: NetworkFirst with 10s timeout (24h cache fallback)
- **Wardrobe Images** (/api/images): CacheFirst (1 week expiration, 200 entries)
- **API Routes**: NetworkFirst with 10s timeout (24h cache fallback, 100 entries)
- **Static Assets**: Automatic caching by next-pwa

### 8.3 Push Notifications (ADHD-Optimized)
**Philosophy**: Helpful, non-intrusive, opt-in notifications that reduce anxiety and support memory

**Permission Request**:
- Progressive disclosure: Show prompt after 10 seconds of first use
- Clear value proposition: List specific benefits before asking
- Easy to dismiss: "Not now" button permanently dismisses
- Never ask again after dismissed: Respects user choice

**Notification Types** (all non-blocking, gentle):
1. **AI Catalog Ready** (✨)
   - "Your catalog photo is ready!"
   - When: AI finishes processing item photo
   - Tag: ai-catalog-ready
   - Non-urgent, tapable to view

2. **AI Inference Complete** (🔍)
   - "Item details detected"
   - When: AI extracts category, colors, tags
   - Tag: ai-inference-complete
   - Non-urgent, helpful

3. **Outfit Ready** (👔)
   - "Your outfits are ready!"
   - When: Outfit generation completes
   - Tag: outfit-ready
   - Tapable to view suggestions

4. **Laundry Reminder** (🧺)
   - "You have N items in laundry state"
   - Optional, gentle reminder
   - Tag: laundry-reminder
   - Silent notification (non-intrusive)

5. **Export/Import Complete** (📦/✅)
   - Status updates for backup operations
   - Non-urgent, informational

**Design Principles**:
- Gentle vibration pattern (200ms, 100ms pause, 200ms)
- Never require interaction (requireInteraction: false)
- Silent option for reminders (no sound, just notification)
- Clear, emoji-based icons for quick recognition
- Dismissible by default
- Tag-based grouping prevents spam

### 8.4 Installation Prompts
- Automatic browser install prompt (Chrome, Edge, Safari)
- Custom in-app install button (Material Design 3 styled)
- iOS-specific instructions (Safari > Share > Add to Home Screen)
- Desktop install support (Chrome, Edge)

### 8.5 ADHD Benefits
- **Memory support**: Notifications remind about pending tasks
- **Time blindness**: Updates on long-running AI operations
- **Reduced anxiety**: Clear completion confirmations
- **Non-intrusive**: All notifications are gentle, optional, dismissible
- **Progressive disclosure**: Permission asked after user sees value
- **Forgiving**: Can always re-enable in browser settings

## 9. Acceptance tests (manual)
- Add item -> AI catalog image generated -> item categorized -> user edits -> persists
- Bulk edit 20 items on desktop
- Generate outfits with constraints; save; rate; next generation reflects ratings
- 3D closet loads and remains responsive
- Export ZIP -> wipe DB -> import ZIP -> full restore
- **PWA**: Install app, use offline, receive notifications for AI jobs

## 10. Implementation plan
Phase 1: CRUD + image storage + mobile browse
Phase 2: job queue + catalog image gen + inference + review UI
Phase 3: outfit generation + feedback loop + desktop power tools
Phase 4: Three.js closet rail + perf pass
Phase 5: export/import + polish
**Phase 6 (NEW)**: PWA support + push notifications + offline capabilities
