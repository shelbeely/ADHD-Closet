# System Architecture

Wardrobe AI Closet technical architecture and data flow diagrams.

## Table of Contents
1. [High-Level Overview](#high-level-overview)
2. [Component Architecture](#component-architecture)
3. [Data Flow](#data-flow)
4. [AI Job Processing](#ai-job-processing)
5. [Caching Strategy](#caching-strategy)
6. [Database Schema](#database-schema)

---

## High-Level Overview

```
┌─────────────────┐
│   Web Browser   │
│  (React/Next)   │
└────────┬────────┘
         │ HTTPS
         ▼
┌─────────────────────────────────────┐
│       Next.js App Router            │
│  ┌──────────┐    ┌──────────────┐  │
│  │  Pages   │    │  API Routes  │  │
│  │ (UI/UX)  │◄───┤  (REST API)  │  │
│  └──────────┘    └───────┬──────┘  │
│                          │          │
└──────────────────────────┼──────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
  ┌───────────┐     ┌────────────┐    ┌──────────┐
  │ PostgreSQL│     │   Redis    │    │   Disk   │
  │   (Data)  │     │  (Queue)   │    │ (Images) │
  └───────────┘     └─────┬──────┘    └──────────┘
                          │
                          ▼
                   ┌──────────────┐
                   │  BullMQ      │
                   │  AI Workers  │
                   └──────┬───────┘
                          │
                          ▼
                   ┌──────────────┐
                   │  OpenRouter  │
                   │   AI API     │
                   └──────────────┘
```

### Technology Stack
- **Frontend**: React 19, Next.js 16 (App Router)
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL 14+ with Prisma ORM
- **Queue**: Redis + BullMQ
- **AI**: OpenRouter (Claude, GPT-4V, DALL-E)
- **Storage**: Local filesystem
- **Styling**: Tailwind CSS 4 + Material Design 3

---

## Component Architecture

### Frontend Layers

```
┌──────────────────────────────────────┐
│            Pages (Routes)            │
│  /               - Home              │
│  /items/[id]     - Item Detail       │
│  /items/new      - Add Item          │
│  /outfits        - Outfit History    │
│  /outfits/gen    - Outfit Generator  │
│  /analytics      - Analytics         │
│  /settings       - Settings          │
│  /closet-rail    - 3D View           │
└──────────────┬───────────────────────┘
               │
┌──────────────▼───────────────────────┐
│       Components (Reusable)          │
│  - ItemCard      - FilterPanel       │
│  - ItemGrid      - CategoryTabs      │
│  - BulkEditTable - EnhancedSearch    │
│  - AddItemBtn    - NotificationPrompt│
└──────────────┬───────────────────────┘
               │
┌──────────────▼───────────────────────┐
│          Library (Utilities)         │
│  - hooks/          - types/          │
│  - utils/          - theme           │
│  - notifications   - prisma client   │
└──────────────────────────────────────┘
```

### Backend Layers

```
┌──────────────────────────────────────┐
│          API Routes (REST)           │
│  /api/items              (CRUD)      │
│  /api/items/[id]         (CRUD)      │
│  /api/items/[id]/images  (Upload)    │
│  /api/outfits            (CRUD)      │
│  /api/outfits/generate   (AI)        │
│  /api/images/[id]        (Stream)    │
│  /api/ai/jobs            (Status)    │
│  /api/export             (Backup)    │
│  /api/import             (Restore)   │
│  /api/reminders          (Laundry)   │
│  /api/tags               (CRUD)      │
└──────────────┬───────────────────────┘
               │
┌──────────────▼───────────────────────┐
│         Business Logic Layer         │
│  - Validation (Zod schemas)          │
│  - Database operations (Prisma)      │
│  - File operations (fs/sharp)        │
│  - Queue management (BullMQ)         │
└──────────────┬───────────────────────┘
               │
┌──────────────▼───────────────────────┐
│           Data Layer                 │
│  - Prisma Client (ORM)               │
│  - Redis Client (ioredis)            │
│  - File System (Node fs)             │
└──────────────────────────────────────┘
```

---

## Data Flow

### 1. Add Item Flow

```
User takes photo
     │
     ▼
[Upload to /api/items/[id]/images]
     │
     ├─► Save to disk (DATA_DIR/images)
     ├─► Create ImageAsset record (Prisma)
     └─► Enqueue AI jobs:
         ├─► generate_catalog_image (if original_main)
         ├─► generate_catalog_image (if original_back)
         ├─► infer_item (category, colors, tags)
         └─► extract_label (if label_brand/label_care)
              │
              ▼
         [BullMQ Worker picks up jobs]
              │
              ├─► Call OpenRouter API
              ├─► Process response
              ├─► Save results to DB
              └─► Mark job as succeeded/failed
                   │
                   ▼
              [UI polls for status]
                   │
                   └─► Update item display
```

### 2. Generate Outfit Flow

```
User sets constraints (weather, vibe, occasion)
     │
     ▼
[POST /api/outfits/generate]
     │
     ├─► Fetch available items (state = available)
     ├─► Filter by constraints
     ├─► Build prompt for AI
     │
     ▼
[Enqueue generate_outfit job]
     │
     ▼
[BullMQ Worker]
     │
     ├─► Call OpenRouter API
     ├─► Parse structured response
     ├─► Create Outfit + OutfitItem records
     └─► Return outfit ID
          │
          ▼
     [Redirect user to outfit view]
```

### 3. Export/Import Flow

**Export**:
```
User clicks "Export Wardrobe"
     │
     ▼
[POST /api/export]
     │
     ├─► Query all data (items, outfits, tags)
     ├─► Generate JSON export
     ├─► Generate CSV files
     ├─► Create ZIP archive
     │    ├─► export.json
     │    ├─► items.csv
     │    ├─► outfits.csv
     │    ├─► images/ (copy all)
     │    └─► manifest.json
     │
     └─► Stream ZIP to user
```

**Import**:
```
User uploads ZIP backup
     │
     ▼
[POST /api/import]
     │
     ├─► Extract ZIP to temp directory
     ├─► Validate manifest
     ├─► Parse export.json
     │
     ├─► If mode = "replace":
     │    └─► Delete all existing data
     │
     ├─► If mode = "merge":
     │    └─► Skip duplicates (by ID)
     │
     ├─► Import data:
     │    ├─► Tags
     │    ├─► Items
     │    ├─► Images (copy files)
     │    └─► Outfits
     │
     └─► Return import summary
```

---

## AI Job Processing

### Job Lifecycle

```
┌─────────────┐
│   Queued    │  Job created, waiting for worker
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Running   │  Worker picked up job, calling AI API
└──────┬──────┘
       │
       ├──► Success ──┐
       │              ▼
       │         ┌─────────────┐
       │         │  Succeeded  │  Result saved to DB
       │         └─────────────┘
       │
       ├──► Failure ──┐
       │              ▼
       │         ┌─────────────┐
       │         │   Failed    │  Error logged, retry?
       │         └──────┬──────┘
       │                │
       │         (if attempts < maxAttempts)
       │                │
       └────────────────┘
                        
       └──► Needs Review ──┐
                           ▼
                      ┌──────────────┐
                      │Needs Review  │  AI uncertain, human review needed
                      └──────────────┘
```

### Job Types

**1. generate_catalog_image**
- **Input**: Original image (original_main or original_back)
- **Process**: Use image generation model to create clean catalog-style image
- **Output**: New ImageAsset with kind=ai_catalog

**2. infer_item**
- **Input**: Item images (all kinds)
- **Process**: Use vision model to identify category, colors, attributes, tags
- **Output**: Update Item with inferred data

**3. extract_label**
- **Input**: Label images (label_brand, label_care)
- **Process**: Use OCR vision model to read text
- **Output**: Update Item with brand, sizeText, materials, care instructions

**4. generate_outfit**
- **Input**: Available items + constraints (weather, vibe, occasion)
- **Process**: Use text model to suggest outfit combinations
- **Output**: Create Outfit with OutfitItems

### Worker Configuration

```typescript
// lib/ai/worker.ts
const worker = new Worker('ai-jobs', async (job) => {
  switch (job.data.type) {
    case 'generate_catalog_image':
      return await generateCatalogImage(job.data);
    case 'infer_item':
      return await inferItem(job.data);
    case 'extract_label':
      return await extractLabel(job.data);
    case 'generate_outfit':
      return await generateOutfit(job.data);
  }
}, {
  connection: redis,
  concurrency: 3,  // Process 3 jobs concurrently
  removeOnComplete: { age: 86400 },  // Keep completed jobs for 24h
  removeOnFail: { age: 604800 },     // Keep failed jobs for 7 days
});
```

---

## Caching Strategy

### 1. Image Caching
- **Original images**: Never cached (large, infrequently accessed)
- **Thumbnails**: Cached in browser (immutable, small)
- **Catalog images**: Cached with versioning

### 2. Database Query Caching
Currently no caching layer. Future considerations:
- Redis cache for frequent queries (e.g., homepage items)
- SWR/React Query for client-side caching
- Prisma middleware for query result caching

### 3. Static Assets
- Next.js automatic static optimization
- Images served with cache headers:
  ```typescript
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  ```

---

## Database Schema

### Entity Relationship Diagram

```
┌─────────────┐
│    Tag      │
│─────────────│
│ id (PK)     │
│ name (UQ)   │
└──────┬──────┘
       │
       │ M:N
       │
┌──────▼──────┐       ┌──────────────┐
│   ItemTag   │       │     Item     │
│─────────────│       │──────────────│
│ itemId (FK) │◄──────┤ id (PK)      │
│ tagId (FK)  │       │ title        │
└─────────────┘       │ category     │
                      │ state        │
                      │ brand        │
                      │ colorPalette │
                      │ attributes   │
                      └──────┬───────┘
                             │
                             │ 1:N
                             │
                      ┌──────▼───────┐
                      │  ImageAsset  │
                      │──────────────│
                      │ id (PK)      │
                      │ itemId (FK)  │
                      │ kind (ENUM)  │
                      │ filePath     │
                      │ width, height│
                      └──────────────┘
                             │
                             │ 1:N
                             │
                      ┌──────▼───────┐
                      │    AIJob     │
                      │──────────────│
                      │ id (PK)      │
                      │ itemId (FK)  │
                      │ type (ENUM)  │
                      │ status       │
                      │ outputJson   │
                      │ error        │
                      └──────────────┘

┌─────────────┐       ┌──────────────┐
│   Outfit    │       │  OutfitItem  │
│─────────────│       │──────────────│
│ id (PK)     │◄──────┤ outfitId (FK)│
│ title       │       │ itemId (FK)  │
│ rating      │       │ role (ENUM)  │
│ weather     │       └──────┬───────┘
│ vibe        │              │
│ explanation │              │
└─────────────┘              │
                             │
                      ┌──────▼───────┐
                      │     Item     │
                      │──────────────│
                      │ id (PK)      │
                      └──────────────┘
```

### Key Design Decisions

**1. ImageAsset separate from Item**
- Allows multiple images per item
- Different `kind` values (original, catalog, thumbnail, label)
- Easy to add/remove images without touching Item

**2. Tags as separate entities**
- Reusable across items
- Easy to rename tags globally
- Can show tag popularity (count items per tag)

**3. Outfit references Items, not copies**
- Item changes reflect in outfits
- If item deleted, outfit shows as incomplete
- Easier to track "most worn" items

**4. AIJob tracks all AI operations**
- Debug failed jobs
- Show processing history to user
- Retry logic built-in
- Cost tracking (via rawResponse)

**5. JSON fields for flexible data**
- `colorPalette`: Array of hex colors
- `attributes`: Object with category-specific fields
- `outputJson`: Store full AI response

---

## Performance Considerations

### Bottlenecks
1. **Image generation**: 10-30 seconds per image
2. **Database queries**: N+1 problem with relations
3. **Image uploads**: Large files (5-50MB)
4. **Export/Import**: ZIP creation with many files

### Optimizations
1. **Thumbnail generation**: WebP format, 512px max
2. **Prisma includes**: Only fetch needed relations
3. **Queue concurrency**: Process 3 AI jobs in parallel
4. **Image streaming**: Stream large files, don't buffer
5. **Lazy loading**: Load images on-demand, not all at once

---

## Security Considerations

### Single-User Design
- No authentication layer
- Assumes trusted network (localhost or VPN)
- For internet exposure: Add reverse proxy with basic auth

### Data Protection
- All data stored locally
- No third-party analytics
- Images never leave server (except to OpenRouter for AI)

### Input Validation
- Zod schemas for all API inputs
- File type validation for uploads
- SQL injection protection (Prisma parameterized queries)
- XSS protection (React escapes by default)

---

## Scalability

### Current Limits
- **Items**: 10,000+ (tested)
- **Images**: 50,000+ (disk space dependent)
- **Outfits**: 1,000+ (no performance impact)
- **Concurrent users**: 1 (single-user design)

### Future Multi-User Considerations
Would require:
- Authentication (NextAuth.js)
- User isolation (add userId to all tables)
- S3-compatible storage (for scalable images)
- Redis sessions
- Rate limiting per user

---

## Monitoring & Observability

### Current
- Console logging
- Prisma query logging (dev mode)
- Redis queue dashboard (optional: Bull Board)

### Future
- Structured logging (Winston, Pino)
- Error tracking (Sentry)
- Performance monitoring (New Relic, Datadog)
- Database query analysis (Prisma Studio)

---

## References
- [Prisma Schema](../app/prisma/schema.prisma)
- [API Documentation](./API_DOCUMENTATION.md)
- [SPEC.md](./SPEC.md)
