# Twin Style - Technical Architecture

## System Architecture Overview

### High-Level Architecture Diagram

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

### Component Breakdown

#### 1. Frontend Layer (React/Next.js)
- **Framework**: Next.js 16 with App Router
- **UI Library**: React 19
- **Type Safety**: TypeScript 5.9
- **Styling**: Tailwind CSS 4 + Material Design 3
- **3D Graphics**: Three.js + @react-three/fiber
- **State Management**: React hooks + Context API
- **Client-Side Routing**: Next.js App Router

#### 2. Backend Layer (Next.js API Routes)
- **API Style**: REST with JSON responses
- **Route Handlers**: Next.js 16 Route Handlers
- **Validation**: Zod schemas
- **File Handling**: Sharp for image processing
- **Queue Management**: BullMQ client

#### 3. Data Layer
- **Primary Database**: PostgreSQL 16
- **ORM**: Prisma 7.3
- **Queue Backend**: Redis 7
- **File Storage**: Local filesystem
- **Image Optimization**: Sharp (WebP thumbnails)

#### 4. Background Processing Layer
- **Queue System**: BullMQ 5.x
- **Worker Concurrency**: 3 parallel jobs
- **Job Types**: 
  - generate_catalog_image
  - infer_item
  - extract_label
  - generate_outfit
- **Retry Logic**: 3 attempts per job
- **Job Retention**: 24h for completed, 7 days for failed

#### 5. AI Integration Layer
- **Provider**: OpenRouter API
- **Models Used**:
  - Image Generation: `black-forest-labs/flux-1.1-pro`
  - Vision/OCR: `google/gemini-2.0-flash-exp:free`
  - Text Generation: `google/gemini-2.0-flash-exp:free`

## Technology Stack Details

### Frontend Technologies

#### Next.js 16 (App Router)
- **Why**: Server-side rendering, file-based routing, API routes
- **Features Used**:
  - App Router for modern routing
  - Server Components for performance
  - Client Components for interactivity
  - Image optimization
  - Static optimization

#### React 19
- **Why**: Component-based UI, hooks, concurrent features
- **Patterns Used**:
  - Functional components only
  - Custom hooks for reusable logic
  - Context API for global state
  - Suspense for async boundaries
  - Error boundaries for fault tolerance

#### TypeScript 5.9
- **Why**: Type safety, better DX, catch errors early
- **Configuration**:
  - Strict mode enabled
  - No implicit any
  - Explicit function return types

#### Tailwind CSS 4
- **Why**: Utility-first CSS, rapid development, consistency
- **Customization**:
  - Material Design 3 color tokens
  - Custom spacing scale
  - Expressive rounded corners
  - Elevation shadows

#### Three.js + @react-three/fiber
- **Why**: 3D closet rail visualization
- **Features**:
  - Hanging card textures
  - Lazy texture loading
  - Performance optimizations
  - Camera controls

### Backend Technologies

#### Next.js API Routes
- **Structure**: `/app/api/*/route.ts`
- **HTTP Methods**: GET, POST, PATCH, DELETE
- **Response Format**: JSON
- **Error Handling**: Consistent error objects
- **Status Codes**: Standard HTTP codes

#### Prisma ORM 7.3
- **Why**: Type-safe database access, migrations, relations
- **Features Used**:
  - Auto-generated TypeScript client
  - Declarative migrations
  - Relation loading
  - Transactions
  - JSON fields for flexible data

#### PostgreSQL 16
- **Why**: Robust, ACID compliant, JSON support, mature
- **Schema Design**:
  - 11 models (tables)
  - Foreign key relationships
  - Indexes on frequent queries
  - Enums for categorical data
  - JSON columns for flexible attributes

#### Redis 7
- **Why**: Fast in-memory queue backend for BullMQ
- **Usage**:
  - Job queue storage
  - Job status tracking
  - Worker coordination
  - Result caching (future)

#### BullMQ 5.x
- **Why**: Robust job queue, retry logic, monitoring
- **Configuration**:
  - 3 concurrent workers
  - Exponential backoff
  - Job completion hooks
  - Dead letter queue

### Runtime and Tooling

#### Bun.js 1.3+
- **Why**: Fast package manager, fast runtime
- **Fallback**: Full npm support for compatibility
- **Speed**: ~3-5x faster than npm for installs

#### Sharp
- **Why**: Fast image processing in Node.js
- **Usage**:
  - Generate thumbnails (WebP, 512px)
  - Image optimization
  - Format conversion

#### Docker Compose
- **Why**: Easy local development setup
- **Services**:
  - PostgreSQL container
  - Redis container
  - Persistent volumes

### Mobile Technologies

#### Progressive Web App (PWA)
- **Library**: next-pwa
- **Features**:
  - Service worker for offline
  - Add to home screen
  - Web manifest
  - Caching strategies

#### Capacitor 8.x
- **Why**: Bridge web app to native mobile
- **Platforms**: iOS, Android
- **Native Features**:
  - Camera access
  - File system
  - Share sheet
  - Haptic feedback
  - Status bar control
  - NFC tag scanning

## Data Flow Patterns

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

### 3. Image Serving Flow

```
Frontend requests image
     │
     ▼
[GET /api/images/[imageId]]
     │
     ├─► Lookup ImageAsset by ID
     ├─► Validate file exists
     ├─► Check file path is under DATA_DIR (security)
     ├─► Read file from disk
     ├─► Set Content-Type header
     ├─► Set Cache-Control header
     └─► Stream bytes to client
          │
          ▼
     [Browser displays/caches image]
```

### 4. Export/Import Flow

**Export:**
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

**Import:**
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

## Deployment Architecture

### Local Development
```
Developer Machine
├─► Bun/npm (package manager)
├─► Next.js dev server (localhost:3000)
├─► Docker Compose
│   ├─► PostgreSQL (localhost:5432)
│   └─► Redis (localhost:6379)
└─► Local file storage (./data)
```

### Production Deployment (Self-Hosted)
```
Server (Docker or VM)
├─► Next.js production build
├─► PostgreSQL database
├─► Redis queue
├─► Persistent volume (images)
└─► Reverse proxy (optional: Nginx, Caddy)
```

### Native Mobile Apps
```
iOS App (Capacitor)
├─► WebView running Next.js app
├─► Native camera integration
├─► Native file system
└─► App Store distribution

Android App (Capacitor)
├─► WebView running Next.js app
├─► Native camera integration
├─► Native NFC support
└─► Google Play distribution
```

## Performance Optimizations

### Frontend
1. **Image Optimization**
   - Thumbnails (WebP, 512px max)
   - Lazy loading
   - Next.js Image component
   - Browser caching

2. **Code Splitting**
   - Dynamic imports
   - Route-based splitting
   - Component lazy loading

3. **Caching Strategy**
   - Service worker for offline
   - Browser cache for images
   - SWR for data fetching

### Backend
1. **Database Queries**
   - Prisma select for only needed fields
   - Relation includes optimized
   - Indexes on frequent queries
   - Pagination for large lists

2. **Image Processing**
   - Sharp for fast processing
   - Thumbnail generation
   - WebP format for 30-50% size reduction
   - Streaming large files

3. **AI Jobs**
   - Async background processing
   - 3 concurrent workers
   - Job prioritization
   - Retry with exponential backoff

## Security Considerations

### Authentication
- Single-user design: No auth layer
- Assumes trusted network (localhost or VPN)
- For internet exposure: Add reverse proxy with basic auth

### Data Protection
- All data stored locally
- No third-party analytics
- Images never leave server (except to OpenRouter for AI)
- OpenRouter API key stored server-side only

### Input Validation
- Zod schemas for all API inputs
- File type validation for uploads
- SQL injection protection (Prisma parameterized queries)
- XSS protection (React escapes by default)
- Path traversal protection for file serving

### API Security
- OpenRouter API key never sent to client
- All AI requests from server routes/workers
- File serving maps ImageAsset IDs to known paths
- Upload size limits and MIME type validation

## Monitoring and Observability

### Current Implementation
- Console logging
- Prisma query logging (dev mode)
- Redis queue dashboard (optional: Bull Board)
- Error boundaries in React

### Future Plans
- Structured logging (Winston, Pino)
- Error tracking (Sentry)
- Performance monitoring (New Relic, Datadog)
- Database query analysis (Prisma Studio)

## Scalability Considerations

### Current Limits
- **Items**: 10,000+ (tested)
- **Images**: 50,000+ (disk space dependent)
- **Outfits**: 1,000+ (no performance impact)
- **Concurrent Users**: 1 (single-user design)

### Multi-User Considerations (Future)
If multi-user support is added, would require:
- Authentication (NextAuth.js)
- User isolation (add userId to all tables)
- S3-compatible storage (for scalable images)
- Redis sessions
- Rate limiting per user
- Query optimization for multi-tenancy

## Development Workflow

### Local Setup
```bash
1. Clone repository
2. Install dependencies (bun install)
3. Start Docker services (docker compose up -d)
4. Copy .env.example to .env
5. Run migrations (npx prisma migrate dev)
6. Generate Prisma Client (npm run prisma:generate)
7. Start dev server (bun dev)
```

### Testing Strategy
- Manual testing (primary)
- Mobile and desktop viewports
- Dark mode testing
- Accessibility testing (keyboard, screen readers)
- Future: Jest/Vitest unit tests, Playwright E2E

### Build Process
```bash
# Development
bun dev  # ~2-3 seconds startup

# Production build
bun run build  # ~30-60 seconds
bun start

# Linting
npm run lint  # ~5-10 seconds

# Database operations
npm run prisma:generate  # ~3-5 seconds (REQUIRED after schema changes)
npm run prisma:migrate   # ~5-10 seconds
```

## Technology Choices Rationale

### Why Next.js?
- Server-side rendering for better initial load
- File-based routing for clear structure
- API routes eliminate need for separate backend
- Built-in image optimization
- Strong TypeScript support
- Active ecosystem and community

### Why PostgreSQL?
- Robust and mature
- Excellent JSON support for flexible attributes
- ACID compliance
- Free and open-source
- Great tooling (Prisma Studio)

### Why Prisma?
- Type-safe database access
- Auto-generated TypeScript types
- Declarative migrations
- Easy relation loading
- Active development and support

### Why BullMQ?
- Reliable job queue
- Built-in retry logic
- Job prioritization
- Monitoring dashboard
- Redis-backed for speed

### Why OpenRouter?
- Single API for multiple AI models
- No vendor lock-in
- Cost-effective (pay per use)
- Easy model switching
- Good documentation

### Why Tailwind CSS?
- Utility-first for rapid development
- No CSS file management
- Tree-shaking for small bundles
- Easy customization
- Consistent design system

### Why Three.js?
- Industry-standard 3D library
- Rich ecosystem
- Good React integration (@react-three/fiber)
- Performance optimizations
- Extensive documentation

## Infrastructure Requirements

### Minimum System Requirements
- **CPU**: 2 cores
- **RAM**: 4GB
- **Disk**: 20GB + storage for images
- **OS**: Linux, macOS, or Windows with WSL

### Recommended System Requirements
- **CPU**: 4+ cores
- **RAM**: 8GB+
- **Disk**: 100GB+ SSD
- **OS**: Linux (Ubuntu 20.04+)

### Software Dependencies
- **Runtime**: Bun ≥1.0.0 or Node.js ≥20
- **Database**: PostgreSQL ≥14
- **Cache**: Redis ≥7
- **Container**: Docker + Docker Compose (optional but recommended)

### Network Requirements
- **External API**: OpenRouter API access (HTTPS)
- **Ports**: 3000 (Next.js), 5432 (PostgreSQL), 6379 (Redis)
- **Bandwidth**: Minimal (single-user, local storage)
