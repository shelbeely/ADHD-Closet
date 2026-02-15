# System Architecture

**Last Updated:** 2026-02-15  
**Purpose:** End-to-end data flows and system interactions

## High-Level Architecture

```
┌─────────────────┐
│   Web Browser   │  ← User interface (React 19 + Next.js 16)
│  PWA / Native   │
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
  │ Supabase  │     │   Redis    │    │   Disk   │
  │PostgreSQL │     │  (Queue)   │    │ (Images) │
  └───────────┘     └─────┬──────┘    └──────────┘
                          │
                          ▼
                   ┌──────────────┐
                   │   BullMQ     │
                   │ AI Worker    │
                   └──────┬───────┘
                          │
                          ▼
                   ┌──────────────┐
                   │  OpenRouter  │
                   │   Gemini 3   │
                   └──────────────┘
```

## Entry Points

### 1. Web Application Entry

**File:** `app/app/page.tsx`  
**Route:** `/`

**Flow:**
1. User lands on home page
2. Category grid displayed (mobile) OR table view (desktop)
3. Items fetched from `/api/items`
4. Filters applied client-side

### 2. API Entry

**Base Path:** `/api/*`  
**Pattern:** Next.js App Router API routes

**Common Flow:**
1. Request hits API route handler
2. Zod schema validates input
3. Prisma query executes
4. Response returned (JSON)

### 3. Background Worker Entry

**File:** `app/app/lib/ai/worker.ts`  
**Trigger:** BullMQ job queue

**Flow:**
1. API enqueues job in Redis
2. Worker picks up job
3. OpenRouter API called
4. Results stored in database

## Critical Data Flows

### Flow 1: Add Item

```
User uploads photo
     │
     ▼
POST /api/items/[id]/images
     │
     ├─► Save to disk (data/images/)
     ├─► Create ImageAsset record
     └─► Enqueue AI jobs:
         ├─► generate_catalog_image (if original_main)
         ├─► generate_catalog_image (if original_back)
         ├─► infer_item (category, colors, tags)
         └─► extract_label (if label_brand/label_care)
```

**Key Files:**
- `app/app/api/items/[id]/images/route.ts` - Image upload handler
- `app/app/lib/queue.ts` - Job enqueuing
- `app/app/lib/ai/worker.ts` - Job processing

**Async Behavior:**
- Upload returns immediately with 200 OK
- AI jobs process in background (30s - 2min)
- Frontend polls `/api/ai/jobs` for status

### Flow 2: AI Job Processing

```
BullMQ Worker picks job
     │
     ▼
Update AIJob.status = 'running'
     │
     ▼
Call OpenRouter API (Gemini 3)
     │
     ├─► generate_catalog_image
     │    └─► Returns image URL
     │        └─► Save to disk
     │            └─► Update ImageAsset
     │
     ├─► infer_item
     │    └─► Returns category, colors, pattern
     │        └─► Update Item attributes
     │
     └─► extract_label
          └─► Returns brand, care instructions
              └─► Update Item fields
```

**Key Files:**
- `app/app/lib/ai/worker.ts` - Worker implementation
- `app/app/lib/ai/openrouter.ts` - OpenRouter API client
- `app/app/lib/ai/visionEnhancements.ts` - Prompt engineering

**Error Handling:**
- Retry 3 times with exponential backoff
- Failed jobs kept for 500 entries (debugging)
- Success removes job after 100 entries

### Flow 3: Generate Outfit

```
User sets constraints (weather, mood, occasion)
     │
     ▼
POST /api/outfits/generate
     │
     ├─► Create Outfit record
     ├─► Enqueue generate_outfit job
     └─► Return outfitId
          │
          ▼
Worker processes job
     │
     ├─► Fetch available items from DB
     ├─► Call Gemini 3 Flash with constraints
     ├─► Parse outfit suggestions
     └─► Create OutfitItem relations
          │
          ▼
Frontend polls /api/outfits/[id]
     │
     └─► Display outfit suggestions
```

**Key Files:**
- `app/app/api/outfits/generate/route.ts` - Outfit generation endpoint
- `app/app/lib/ai/worker.ts` - `processOutfitGeneration()`

**ADHD Optimization:**
- "Panic Pick" mode: 1-3 outfits max
- ~30 second estimate shown
- Immediate feedback with loading state

### Flow 4: Database Query

```
API Route Handler
     │
     ▼
Import prisma client
     │
     ▼
Execute Prisma query
     │
     ├─► Prisma generates SQL
     ├─► PrismaPg adapter used
     ├─► pg Pool manages connection
     └─► Query sent to Supabase
          │
          ▼
Results returned to API
     │
     └─► Formatted and sent to client
```

**Key Files:**
- `app/app/lib/prisma.ts` - Prisma client singleton
- `app/prisma.config.ts` - Adapter configuration
- `app/prisma/schema.prisma` - Database schema

**Connection Pattern:**
- Singleton pattern prevents multiple connections
- PrismaPg adapter for Prisma 7 compatibility
- Connection pooling via `pg` package

## Integration Points

### 1. Database (Supabase PostgreSQL)

**Connection:** Via `DATABASE_URL` env var  
**Pattern:** Prisma ORM with PrismaPg adapter  
**File:** `app/app/lib/prisma.ts`

```typescript
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
```

**Schema Management:**
- Migrations in `app/prisma/migrations/`
- Generated client: `npx prisma generate`
- Apply migrations: `npx prisma migrate dev`

**Important:** Supabase is persistent across Copilot sessions. Schema already exists.

### 2. Queue (Redis + BullMQ)

**Connection:** Via `REDIS_URL` env var  
**Pattern:** BullMQ queue with ioredis  
**Files:**
- `app/app/lib/queue.ts` - Queue setup
- `app/app/lib/redis.ts` - Redis client

```typescript
const connection = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

const aiJobQueue = new Queue('ai-jobs', { connection });
```

**Job Options:**
- 3 retry attempts
- Exponential backoff (2s base)
- Keep 100 completed, 500 failed

### 3. AI Provider (OpenRouter → Gemini 3)

**Connection:** Via `OPENROUTER_API_KEY` env var  
**Endpoint:** `https://openrouter.ai/api/v1`  
**File:** `app/app/lib/ai/openrouter.ts`

**Models Used:**
- `google/gemini-3-pro-image-preview` - Image generation (catalog images)
- `google/gemini-3-pro-preview` - Vision/OCR (item inference)
- `google/gemini-3-flash-preview` - Text (outfit generation)

**Why Gemini Only:**
- Only model that generates high-quality catalog images
- Advanced vision capabilities for accurate categorization
- Multimodal reasoning for context-aware outfits

### 4. File Storage (Local Disk)

**Location:** `app/data/` (gitignored)  
**Pattern:** Node.js `fs` module + Sharp  
**Structure:**
```
data/
├── images/
│   ├── {uuid}_original.jpg
│   ├── {uuid}_catalog.jpg
│   └── {uuid}_back_catalog.jpg
└── thumbs/
    └── {uuid}_thumb.jpg
```

**Image Processing:**
- Sharp for resizing and optimization
- Thumbnails: 300x300px
- Originals preserved

### 5. Native Bridge (Capacitor)

**Config:** `app/capacitor.config.ts`  
**Pattern:** Web → Native plugin API  
**File:** `app/app/lib/capacitor.ts`

**Capabilities:**
- Camera access (`@capacitor/camera`)
- File system (`@capacitor/filesystem`)
- NFC reading/writing (`@capgo/capacitor-nfc`)
- Haptic feedback (`@capacitor/haptics`)
- Social sharing (`@capacitor/share`)

**Platform Support:**
- iOS: Via Xcode project
- Android: Via Gradle project
- Web: Graceful degradation

## Execution Context

### Development (Local)

```bash
# Terminal 1: Start Redis
docker compose up redis

# Terminal 2: Start Next.js
cd app && bun dev

# Terminal 3: Start AI Worker (optional)
cd app && bun run scripts/ai/start-worker.ts
```

**URL:** `http://localhost:3000`  
**Hot Reload:** Enabled (Fast Refresh)

### Development (Copilot Agent)

Automated setup via `.github/workflows/copilot-setup-steps.yml`:

1. Install Bun 1.3.6
2. Install dependencies
3. Generate Prisma Client
4. Copy `.env.example` → `.env` + inject `DATABASE_URL`
5. Start Redis service
6. Start Ziit heartbeat daemon (optional)

**Important:** No database schema creation step (Supabase is persistent)

### Production (Build)

```bash
cd app
npm run build        # Next.js production build
npm start            # Start production server
```

**Optimizations:**
- Static generation where possible
- Image optimization (Sharp)
- Bundle splitting
- PWA service worker

## Runtime Assumptions

### Required Services

1. **PostgreSQL** (Supabase hosted)
   - Must be running and accessible
   - Schema must exist (via migrations)
   - Connection pooler recommended for GitHub Actions

2. **Redis** (Docker or hosted)
   - Required for BullMQ queue
   - In-memory persistence OK for dev
   - Persistent storage recommended for prod

### Required Environment Variables

- `DATABASE_URL` - PostgreSQL connection string (Supabase pooler)
- `REDIS_URL` - Redis connection string
- `OPENROUTER_API_KEY` - OpenRouter API key

### Optional Environment Variables

- `DATA_DIR` - Local storage directory (default: `./data`)
- `AI_ENABLED` - Enable/disable AI features (default: `true`)
- `PUBLIC_BASE_URL` - Public URL (default: `http://localhost:3000`)
- `NODE_ENV` - Environment mode (`development`, `production`)

### File System Requirements

- Write access to `data/` directory
- ~100MB disk space for images (grows with usage)
- Temp directory for uploads

## Performance Characteristics

### Response Times

- **API Routes:** <100ms (simple queries), <500ms (complex)
- **AI Jobs:** 30s - 2min (depends on model and complexity)
- **Image Uploads:** <1s (immediate response, async processing)
- **Page Loads:** <2s (first load), <500ms (subsequent)

### Concurrency

- **API Routes:** Serverless (auto-scaling)
- **AI Worker:** Single instance (can scale horizontally)
- **Database:** Connection pooling via `pg`

### Caching Strategy

- **Images:** Generated once, cached on disk
- **Thumbnails:** Generated on-demand, cached on disk
- **API Responses:** No caching (real-time data)
- **Static Assets:** Next.js automatic caching

## Known Constraints

### Single-User Design

- No authentication/authorization
- All data belongs to one user
- No multi-tenancy

### AI Model Dependency

- **Hard requirement:** Google Gemini 3 models
- No fallback models
- OpenRouter API required
- Rate limits apply (varies by plan)

### Local Storage

- Images stored on disk (not CDN)
- No cloud backup (export/import for backup)
- Limited by disk space

### Browser Requirements

- Modern browser (Chrome, Firefox, Safari, Edge)
- JavaScript required
- localStorage for settings
- IndexedDB for offline support (PWA)

### Mobile App Limitations

- Native builds require Xcode (iOS) and Android Studio
- NFC only works on Android (Chrome/Edge) or native apps
- Camera requires device permissions

## Sharp Edges & Pitfalls

### 1. Prisma Client Generation

**Problem:** TypeScript errors if Prisma Client not generated  
**Solution:** Always run `npm run prisma:generate` after schema changes  
**File:** `app/prisma/schema.prisma`

### 2. Redis Connection

**Problem:** BullMQ fails silently if Redis not running  
**Solution:** Check `docker compose ps` before starting dev server  
**Test:** `docker exec wardrobe-redis redis-cli ping` → `PONG`

### 3. Bun VM Crashes

**Problem:** Bun may crash in VM environments  
**Solution:** Use npm as fallback (project supports both)  
**Reference:** `app/BUN_SETUP.md`

### 4. Image Upload Race Conditions

**Problem:** AI job may start before image fully written  
**Solution:** Images saved first, then jobs enqueued  
**File:** `app/app/api/items/[id]/images/route.ts`

### 5. Environment Variables

**Problem:** Missing env vars cause cryptic errors  
**Solution:** Always copy from `.env.example` and fill in values  
**Required:** `DATABASE_URL`, `REDIS_URL`, `OPENROUTER_API_KEY`

### 6. DIRECT_URL Workaround

**Problem:** Malformed `DIRECT_URL` causes Prisma CLI failures  
**Solution:** Set `DIRECT_URL=""` before prisma commands  
**Context:** Known issue with Copilot secrets

---

**Next:** See `dependencies.md` for library usage details
