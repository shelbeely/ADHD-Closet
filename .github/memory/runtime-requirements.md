# Runtime Requirements

**Last Updated:** 2026-02-15  
**Purpose:** Services, environment variables, and runtime constraints

## Overview

This document describes what the application needs to run successfully.

## Required Services

### 1. PostgreSQL Database (Supabase)

**Provider:** Supabase (hosted)  
**Version:** PostgreSQL 14+  
**Connection:** Via `DATABASE_URL` environment variable

**Purpose:**
- Primary data store
- Persistent across all Copilot sessions
- Hosts all application tables

**Connection Pattern:**
```
postgresql://user:password@host:port/database
```

**Important Notes:**
- Use Supabase pooler for GitHub Actions (IPv4 compatibility)
- Schema already exists (no creation needed in CI/CD)
- Migrations applied locally, then committed to version control

**Health Check:**
```bash
# From app directory
npx prisma db pull
# Should succeed without errors
```

**Tables (10 total):**
- Item, ImageAsset, Outfit, OutfitItem, AIJob
- Tag, ItemTag, NfcTag, LaundryReminder, AnalyticsEvent

---

### 2. Redis

**Version:** Redis 7+ (Alpine)  
**Connection:** Via `REDIS_URL` environment variable

**Purpose:**
- BullMQ job queue
- Background AI processing
- Job status tracking

**Local Development:**
```bash
# Start Redis via Docker Compose
docker compose up -d redis
```

**Health Check:**
```bash
docker exec wardrobe-redis redis-cli ping
# Should return: PONG
```

**Configuration:**
- No persistence required for development
- In-memory OK for job queue
- Persistent storage recommended for production

**Port:** 6379 (default)

**Docker Compose Config:**
```yaml
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
```

---

## Required Environment Variables

### `DATABASE_URL`

**Required:** Yes  
**Format:** PostgreSQL connection string  
**Example:** `postgresql://postgres:password@db.project.supabase.co:5432/postgres`

**Used By:**
- Prisma Client
- Database migrations
- All API routes accessing data

**Important:**
- Use Supabase pooler (port 6543) for GitHub Actions
- Direct connection (port 5432) OK for local dev
- Must include `pgbouncer=true` query param for pooler

**Variants:**
```bash
# Direct connection (local dev)
DATABASE_URL="postgresql://user:pass@host:5432/postgres"

# Connection pooler (GitHub Actions, prod)
DATABASE_URL="postgresql://user:pass@pooler.supabase.com:6543/postgres?pgbouncer=true"
```

---

### `REDIS_URL`

**Required:** Yes (if AI features enabled)  
**Format:** Redis connection string  
**Example:** `redis://localhost:6379`

**Used By:**
- BullMQ queue
- AI worker
- Job status queries

**Default:** `redis://localhost:6379`

**Variants:**
```bash
# Local development
REDIS_URL="redis://localhost:6379"

# Hosted Redis (production)
REDIS_URL="redis://user:pass@redis.host.com:6379"

# Redis Cloud with TLS
REDIS_URL="rediss://user:pass@redis.cloud.com:6380"
```

---

### `OPENROUTER_API_KEY`

**Required:** Yes (if AI features enabled)  
**Format:** OpenRouter API key  
**Example:** `sk-or-v1-...`

**Used By:**
- AI job worker
- Outfit generation
- Item inference
- Catalog image generation

**Obtain From:** https://openrouter.ai/

**Important:**
- Required for all AI features
- Rate limits vary by plan
- Cost per request varies by model

---

## Optional Environment Variables

### `DATA_DIR`

**Default:** `./data`  
**Format:** Absolute or relative path

**Used By:**
- Image storage
- Thumbnail cache

**Purpose:**
- Override default local storage directory

**Example:**
```bash
DATA_DIR="/var/app/data"
```

---

### `AI_ENABLED`

**Default:** `true`  
**Format:** Boolean string (`"true"` or `"false"`)

**Used By:**
- AI job enqueuing logic
- Feature flags

**Purpose:**
- Disable AI features for testing
- Reduce costs in development

**Example:**
```bash
AI_ENABLED="false"
```

---

### `PUBLIC_BASE_URL`

**Default:** `http://localhost:3000`  
**Format:** Full URL with protocol

**Used By:**
- Email links (future)
- Absolute URLs in generated content

**Example:**
```bash
PUBLIC_BASE_URL="https://twinstyle.example.com"
```

---

### `NODE_ENV`

**Default:** `development`  
**Format:** `"development"`, `"production"`, or `"test"`

**Used By:**
- Next.js build process
- Prisma logging
- Error handling

**Example:**
```bash
NODE_ENV="production"
```

---

### `ZIIT_API_KEY`

**Default:** (None - optional)  
**Format:** Ziit.app API key

**Used By:**
- Ziit heartbeat daemon
- Copilot session monitoring

**Purpose:**
- Send heartbeats to Ziit.app for uptime monitoring
- Track Copilot session activity

**Example:**
```bash
ZIIT_API_KEY="ziit_..."
```

**Commands:**
```bash
bun run ziit:watch    # Start heartbeat daemon
bun run ziit:health   # Check daemon health
bun run ziit:test     # Send test heartbeat
```

---

### `DIRECT_URL`

**Status:** Known issue - malformed in Copilot secrets  
**Workaround:** Set to empty string before Prisma commands

```bash
DIRECT_URL="" npx prisma db push
```

**Purpose:** Direct database connection (bypasses pooler)  
**Current Issue:** Malformed value in Copilot environment causes P1013 errors

---

## File System Requirements

### Write Access

**Directories:**
- `app/data/` - Image storage and thumbnails
- `app/.next/` - Next.js build output (auto-created)
- `app/node_modules/` - Dependencies (auto-created)

**Permissions:**
- Read/write for application user
- ~100MB initial space for images
- Grows with usage (varies by user)

---

### Directory Structure

```
app/
├── data/                    # Runtime-created (gitignored)
│   ├── images/             # Original and AI-generated images
│   │   ├── {uuid}_original.jpg
│   │   ├── {uuid}_catalog.jpg
│   │   └── {uuid}_back_catalog.jpg
│   └── thumbs/             # Thumbnail cache
│       └── {uuid}_thumb.jpg
└── .next/                  # Build output (auto-created)
```

---

## Runtime Constraints

### Memory

**Minimum:** 512MB  
**Recommended:** 1GB+

**Usage:**
- Next.js server: ~200MB
- AI worker: ~100MB
- Image processing (Sharp): ~100-200MB per operation
- Database connections: ~50MB

---

### CPU

**Minimum:** 1 core  
**Recommended:** 2+ cores

**Usage:**
- Next.js rendering
- Image processing (Sharp)
- AI worker (mostly I/O bound)

---

### Network

**Required Ports:**
- `3000` - Next.js dev/prod server
- `6379` - Redis (local development)

**Outbound Connections:**
- Supabase PostgreSQL (port 5432 or 6543)
- OpenRouter API (HTTPS)
- Redis (if hosted)

**Bandwidth:**
- Low for API requests
- High for image uploads/downloads
- Moderate for AI processing (large payloads)

---

### Browser Requirements

**Minimum:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Features Used:**
- JavaScript (required)
- localStorage (settings)
- IndexedDB (PWA offline support)
- Service Workers (PWA)
- Camera API (item photos)
- NFC API (Android only, optional)

---

## Platform-Specific Requirements

### Development (Local)

**Required:**
- Bun ≥1.0.0 OR Node.js ≥20
- Docker + Docker Compose (for Redis)
- Git (version control)

**Optional:**
- Xcode (iOS native builds)
- Android Studio (Android native builds)

---

### Development (Copilot Agent)

**Automated Setup:**
- Bun 1.3.6 (via `setup-bun` action)
- Dependencies installed automatically
- Prisma Client generated automatically
- Redis service started via GitHub Actions
- Environment variables injected from secrets

**No Manual Setup Required**

---

### Production Deployment

**Required:**
- Node.js ≥20 (Bun optional)
- PostgreSQL database (Supabase or self-hosted)
- Redis instance (hosted or Docker)
- HTTPS certificate (for PWA)

**Recommended:**
- CDN for static assets
- Load balancer (if scaling horizontally)
- Monitoring (Sentry, LogRocket, etc.)

---

## Service Dependencies Matrix

| Feature | PostgreSQL | Redis | OpenRouter | Disk |
|---------|-----------|-------|-----------|------|
| View Items | ✅ | ❌ | ❌ | ❌ |
| Add Items | ✅ | ❌ | ❌ | ✅ |
| Upload Images | ✅ | ✅ | ✅ | ✅ |
| AI Processing | ✅ | ✅ | ✅ | ✅ |
| Generate Outfits | ✅ | ✅ | ✅ | ❌ |
| Export Data | ✅ | ❌ | ❌ | ✅ |
| 3D Closet | ✅ | ❌ | ❌ | ❌ |
| Analytics | ✅ | ❌ | ❌ | ❌ |

---

## Startup Checklist

### Local Development

1. ✅ PostgreSQL accessible (Supabase or local)
2. ✅ Redis running (`docker compose up redis`)
3. ✅ `.env` file configured with all required vars
4. ✅ Dependencies installed (`bun install`)
5. ✅ Prisma Client generated (`npm run prisma:generate`)
6. ✅ Database schema applied (`npx prisma migrate dev`)
7. ✅ Start dev server (`bun dev`)

**Validation:**
```bash
# Check Redis
docker exec wardrobe-redis redis-cli ping

# Check database
cd app && npx prisma db pull

# Check environment
cd app && cat .env
```

---

### Copilot Agent (Automated)

1. ✅ Setup workflow runs automatically
2. ✅ Bun 1.3.6 installed
3. ✅ Dependencies installed
4. ✅ Prisma Client generated
5. ✅ Redis service started
6. ✅ Environment variables injected from secrets
7. ✅ Ziit daemon started (if API key present)

**No manual steps required**

---

## Known Issues & Workarounds

### 1. DIRECT_URL Malformed

**Problem:** Copilot secret `DIRECT_URL` is malformed  
**Impact:** Prisma CLI commands fail with P1013 error  
**Workaround:**
```bash
DIRECT_URL="" npx prisma db push
DIRECT_URL="" npx prisma migrate dev
```

---

### 2. Supabase IPv6

**Problem:** Supabase direct connection uses IPv6  
**Impact:** GitHub Actions lacks IPv6 support  
**Solution:** Use connection pooler (port 6543)

```bash
# Wrong (IPv6)
DATABASE_URL="postgresql://...@db.project.supabase.co:5432/postgres"

# Correct (IPv4 pooler)
DATABASE_URL="postgresql://...@pooler.supabase.com:6543/postgres?pgbouncer=true"
```

---

### 3. Bun VM Crashes

**Problem:** Bun may crash in VM environments  
**Impact:** Dev server fails to start  
**Solution:** Use npm fallback

```bash
# Try Bun first
bun install && bun dev

# If crashes, use npm
npm install && npm run dev
```

**Reference:** `app/BUN_SETUP.md`

---

### 4. Redis Connection Issues

**Problem:** BullMQ fails silently if Redis not running  
**Impact:** AI jobs never process  
**Solution:** Always check Redis health

```bash
docker compose ps redis
docker exec wardrobe-redis redis-cli ping
```

---

## Environment Template

**File:** `app/.env.example`

```bash
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres:password@db.project.supabase.co:5432/postgres"

# Redis (BullMQ Queue)
REDIS_URL="redis://localhost:6379"

# AI Provider (OpenRouter)
OPENROUTER_API_KEY="sk-or-v1-..."

# Optional
DATA_DIR="./data"
AI_ENABLED="true"
PUBLIC_BASE_URL="http://localhost:3000"
NODE_ENV="development"
```

**Setup:**
```bash
cd app
cp .env.example .env
# Edit .env and fill in your values
```

---

**Next:** See `dev-commands.md` for build and test commands
