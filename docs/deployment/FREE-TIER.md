# Free Tier Deployment Guide

This guide shows you how to deploy the ADHD Closet (Twin Style) application using **100% free tier services**, keeping your costs as close to $0 as possible. Perfect for personal use, development, testing, or small-scale production.

## Table of Contents
1. [Overview](#overview)
2. [Free Tier Service Options](#free-tier-service-options)
3. [Recommended Stack](#recommended-stack)
4. [Option 1: Vercel + Supabase + Upstash](#option-1-vercel--supabase--upstash-easiest)
5. [Option 2: Vercel + Neon + Upstash](#option-2-vercel--neon--upstash-best-scaling)
6. [Option 3: Render + Neon + Upstash](#option-3-render--neon--upstash-100-free-forever)
7. [Image Storage Solutions](#image-storage-solutions)
8. [Complete Setup Guide](#complete-setup-guide)
9. [Staying Within Limits](#staying-within-limits)
10. [Monitoring Usage](#monitoring-usage)
11. [When to Upgrade](#when-to-upgrade)

---

## Overview

The ADHD Closet app requires:
- **Hosting** for Next.js application
- **PostgreSQL Database** for storing items, outfits, metadata
- **Redis** for BullMQ background job queue (AI processing)
- **Image Storage** for clothing photos
- **AI API** (OpenRouter) - requires API key (pay-per-use, typically $1-5/month)

**Goal**: Get all infrastructure for **$0/month** (except OpenRouter API usage).

---

## Free Tier Service Options

### Hosting Options

| Provider | Free Tier | Best For | Limitations |
|----------|-----------|----------|-------------|
| **Vercel** | 100GB bandwidth, 1M serverless invocations | Next.js apps (made by Vercel!) | Non-commercial only, 10s function timeout |
| **Netlify** | 100GB bandwidth, 300 build minutes | Static sites, JAMstack | Limited server functions |
| **Render** | Static sites, 750 hours web services | Full-stack apps | Services sleep after inactivity |
| **Cloudflare Pages** | Unlimited bandwidth | Static + edge functions | Edge runtime only |

### Database Options (PostgreSQL)

| Provider | Free Tier | Best For | Limitations |
|----------|-----------|----------|-------------|
| **Supabase** | 500MB storage, 2 projects | Quick setup, includes auth/storage | Pauses after 1 week inactivity |
| **Neon** | 0.5GB storage, 100 CU-hours/month | Serverless, branching | Scale-to-zero (cold starts) |
| **Railway** | $5 trial credit (one-time) | Easy setup | Not forever-free |
| **ElephantSQL** | 20MB, 5 connections | Tiny databases | Very limited storage |

### Redis/Queue Options

| Provider | Free Tier | Best For | Limitations |
|----------|-----------|----------|-------------|
| **Upstash Redis** | 256MB, 500k commands/month | Serverless, global | 1 database only |
| **Redis Cloud** | 30MB | Basic caching | Very limited storage |
| **Render Redis** | 25MB (sleeps when inactive) | Development | Sleeps after 15 min inactivity |

### Image Storage Options

| Provider | Free Tier | Best For | Limitations |
|----------|-----------|----------|-------------|
| **Supabase Storage** | 1GB (included with Supabase) | Integrated solution | Limited to Supabase projects |
| **Cloudflare R2** | 10GB storage, free egress | Large media files | Requires credit card |
| **Vercel Blob** | 0.5GB | Next.js integration | Limited to Vercel projects |
| **ImgBB/Imgur API** | Free with limits | Simple image hosting | Rate limits, no guarantees |

---

## Recommended Stack

### 🏆 Best Overall: Vercel + Neon + Upstash

**Why this combination?**
- **Vercel**: Native Next.js support, zero config, excellent DX
- **Neon**: Serverless PostgreSQL, scale-to-zero, better free tier than Supabase
- **Upstash**: Serverless Redis, generous free tier, BullMQ compatible
- **Supabase Storage**: Use just for images (1GB free)

**Estimated Monthly Cost**: **$0-5** (only OpenRouter API usage)

**Good for**: 
- Personal use with moderate traffic
- Development/testing
- Small production deployments (<10k visits/month)

---

## Option 1: Vercel + Supabase + Upstash (Easiest)

**Pros**: 
- Fastest setup (all services have excellent free tiers)
- Supabase includes database + file storage in one
- Great documentation and community support

**Cons**:
- Supabase pauses after 1 week of inactivity (need to wake it up)
- Vercel free tier is non-commercial only
- 500MB database limit might be tight for many items

### Setup Steps

#### 1. Create Supabase Project

```bash
# 1. Sign up at https://supabase.com (no credit card required)
# 2. Create new project
# 3. Save these credentials:
#    - Database URL (connection string)
#    - Service Role Key (for Storage API)
#    - Anon Key
```

**Configure Supabase:**
```sql
-- In Supabase SQL Editor, run migrations
-- (We'll use Prisma migrations, but can also use Supabase migrations)
```

#### 2. Setup Upstash Redis

```bash
# 1. Sign up at https://upstash.com (no credit card required)
# 2. Create new Redis database (choose closest region)
# 3. Copy the connection URL (starts with redis://)
```

**Free Tier Limits:**
- 256MB storage
- 500,000 commands/month
- 10,000 concurrent connections

#### 3. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# From the app directory
cd /home/runner/work/ADHD-Closet/ADHD-Closet/app

# Login and deploy
vercel login
vercel

# Follow prompts:
# - Connect to your GitHub repo
# - Set project name
# - Configure build settings (auto-detected for Next.js)
```

#### 4. Configure Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables:

```bash
# Database (Supabase)
DATABASE_URL=postgresql://postgres:[PASSWORD]@[PROJECT].supabase.co:5432/postgres

# Redis (Upstash)
REDIS_URL=redis://default:[PASSWORD]@[ENDPOINT].upstash.io:6379

# OpenRouter API
OPENROUTER_API_KEY=your_api_key_here

# AI Models (optional, uses defaults if not set)
OPENROUTER_IMAGE_MODEL=google/gemini-3-pro-image-preview
OPENROUTER_VISION_MODEL=google/gemini-3-pro-preview
OPENROUTER_TEXT_MODEL=google/gemini-3-flash-preview

# Storage (we'll use Supabase Storage)
SUPABASE_URL=https://[PROJECT].supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key

# App URL
PUBLIC_BASE_URL=https://your-app.vercel.app
```

#### 5. Run Database Migrations

```bash
# Locally (one time)
cd app
DATABASE_URL="your_supabase_url" npx prisma migrate deploy
npx prisma generate
```

#### 6. Adapt Image Storage to Supabase

Create `app/lib/supabase-storage.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function uploadImage(
  file: Buffer,
  filename: string,
  bucket: string = 'wardrobe-images'
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filename, file, {
      contentType: 'image/jpeg',
      cacheControl: '3600',
    });

  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filename);
    
  return publicUrl;
}

export async function getImageUrl(filename: string): Promise<string> {
  const { data: { publicUrl } } = supabase.storage
    .from('wardrobe-images')
    .getPublicUrl(filename);
  
  return publicUrl;
}
```

**Create Supabase Storage Bucket:**
1. Go to Supabase Dashboard → Storage
2. Create new bucket: `wardrobe-images`
3. Set to Public or Private (recommend Public for easy access)
4. Configure CORS if needed

#### 7. Update Image API Routes

Modify `app/api/images/upload/route.ts` to use Supabase Storage instead of filesystem.

#### 8. Deploy

```bash
# Commit changes
git add .
git commit -m "Configure for Vercel + Supabase deployment"
git push

# Vercel will auto-deploy on push (if connected to GitHub)
# Or manually deploy:
vercel --prod
```

---

## Option 2: Vercel + Neon + Upstash (Best Scaling)

**Pros**:
- Neon's scale-to-zero means true $0 when not in use
- Better database limits than Supabase (same storage but better compute)
- Neon has database branching (great for development)

**Cons**:
- Need separate solution for image storage
- Cold starts on database (1-2 seconds after inactivity)

### Setup Steps

#### 1. Create Neon Database

```bash
# 1. Sign up at https://neon.tech (no credit card required)
# 2. Create new project
# 3. Copy connection string
```

**Free Tier:**
- 0.5GB storage
- 100 compute-hours/month (auto-scales 0-2 vCPU)
- Scale-to-zero (no cost when idle)
- 10 projects, 10 branches per project

#### 2. Setup Upstash Redis

Same as Option 1 (see above).

#### 3. Setup Image Storage

**Option A: Use Supabase Storage only** (recommended)
- Create Supabase project just for Storage (doesn't count toward DB limits)
- 1GB free file storage

**Option B: Use Cloudflare R2**
- Requires credit card but has very generous free tier
- 10GB storage, unlimited egress
- See [Cloudflare deployment guide](CLOUDFLARE.md#image-storage-cloudflare-r2)

**Option C: Use Vercel Blob**
- 0.5GB free storage
- Integrated with Vercel

```bash
# Install Vercel Blob SDK
npm install @vercel/blob
```

Create `app/lib/vercel-storage.ts`:

```typescript
import { put, list } from '@vercel/blob';

export async function uploadImage(
  file: Buffer | Blob,
  filename: string
): Promise<string> {
  const blob = await put(filename, file, {
    access: 'public',
    addRandomSuffix: false,
  });
  
  return blob.url;
}
```

#### 4. Deploy to Vercel

Same as Option 1, but use Neon DATABASE_URL:

```bash
DATABASE_URL=postgresql://[USER]:[PASSWORD]@[HOST].neon.tech/[DB]?sslmode=require
```

#### 5. Configure for Scale-to-Zero

Neon automatically scales to zero. To minimize cold starts:

```typescript
// app/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// Use connection pooling to reduce cold starts
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

---

## Option 3: Render + Neon + Upstash (100% Free Forever)

**Pros**:
- Render allows commercial use on free tier (unlike Vercel)
- True forever-free stack
- Good for public/commercial projects

**Cons**:
- Render free tier sleeps web services after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds (cold start)
- Not ideal for real-time/interactive apps

### Setup Steps

#### 1. Create Services

- **Neon**: Follow Option 2 setup
- **Upstash**: Follow Option 1 setup

#### 2. Prepare Next.js for Render

Render can deploy Next.js as:
- **Static site** (using `next export`) - NO server functions
- **Web service** (full SSR) - sleeps after inactivity

**For full app functionality, use Web Service:**

Create `render.yaml` in project root:

```yaml
services:
  - type: web
    name: adhd-closet
    runtime: node
    plan: free
    buildCommand: cd app && npm install && npx prisma generate && npm run build
    startCommand: cd app && npm run start
    envVars:
      - key: DATABASE_URL
        sync: false
      - key: REDIS_URL
        sync: false
      - key: OPENROUTER_API_KEY
        sync: false
      - key: NODE_ENV
        value: production
```

#### 3. Deploy to Render

```bash
# 1. Sign up at https://render.com (no credit card required)
# 2. Connect your GitHub repository
# 3. Create new Web Service
# 4. Select repository and branch
# 5. Render auto-detects Next.js settings
# 6. Add environment variables
# 7. Deploy
```

**Environment Variables** (set in Render Dashboard):
```bash
DATABASE_URL=postgresql://[USER]:[PASSWORD]@[HOST].neon.tech/[DB]
REDIS_URL=redis://default:[PASSWORD]@[ENDPOINT].upstash.io:6379
OPENROUTER_API_KEY=your_key
PUBLIC_BASE_URL=https://your-app.onrender.com
```

#### 4. Handle Cold Starts

Since Render sleeps services, add a health check endpoint and use a service to ping it:

Create `app/api/health/route.ts`:

```typescript
export async function GET() {
  return Response.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString() 
  });
}
```

**Keep-Alive Options:**
- Use [UptimeRobot](https://uptimerobot.com) (free) to ping every 5 minutes
- Use [Cron-Job.org](https://cron-job.org) for scheduled pings
- Accept the cold start behavior for low-traffic apps

---

## Image Storage Solutions

### For Option 1 & 2: Supabase Storage

**Setup:**
```bash
# Install Supabase client
npm install @supabase/supabase-js
```

**Configuration:**
```typescript
// app/lib/storage.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export const storage = {
  async upload(path: string, file: Buffer): Promise<string> {
    const { data, error } = await supabase.storage
      .from('wardrobe-images')
      .upload(path, file);
    
    if (error) throw error;
    return supabase.storage
      .from('wardrobe-images')
      .getPublicUrl(path).data.publicUrl;
  },
  
  async delete(path: string): Promise<void> {
    await supabase.storage.from('wardrobe-images').remove([path]);
  },
  
  getUrl(path: string): string {
    return supabase.storage
      .from('wardrobe-images')
      .getPublicUrl(path).data.publicUrl;
  }
};
```

**Update API routes** to use this storage abstraction.

### Alternative: Vercel Blob

```bash
npm install @vercel/blob
```

```typescript
// app/lib/storage.ts
import { put, del, list } from '@vercel/blob';

export const storage = {
  async upload(path: string, file: Buffer): Promise<string> {
    const blob = await put(path, file, { access: 'public' });
    return blob.url;
  },
  
  async delete(path: string): Promise<void> {
    await del(path);
  },
  
  getUrl(path: string): string {
    // Vercel Blob URLs are absolute
    return path;
  }
};
```

---

## Complete Setup Guide

### Prerequisites

1. **GitHub Account** - for code repository
2. **OpenRouter API Key** - sign up at [openrouter.ai](https://openrouter.ai)
   - Add credits (~$5-10 should last months for personal use)
3. **Email** - for service signups

### Step-by-Step (Using Option 2 - Recommended)

#### Step 1: Setup Database (Neon)

```bash
# 1. Go to https://neon.tech
# 2. Sign in with GitHub
# 3. Create new project: "adhd-closet-db"
# 4. Select region closest to you
# 5. Copy connection string
```

**Connection string format:**
```
postgresql://[user]:[password]@[host].neon.tech/[database]?sslmode=require
```

#### Step 2: Setup Redis (Upstash)

```bash
# 1. Go to https://upstash.com
# 2. Sign in with GitHub
# 3. Create new Redis database
# 4. Name: "adhd-closet-redis"
# 5. Select region (same as Neon if possible)
# 6. Copy connection URL
```

#### Step 3: Setup Image Storage (Supabase)

```bash
# 1. Go to https://supabase.com
# 2. Sign in with GitHub
# 3. Create new project: "adhd-closet-storage"
# 4. Wait for project to provision
# 5. Go to Storage → Create bucket → "wardrobe-images"
# 6. Make bucket public
# 7. Copy: Project URL, Anon Key, Service Key
```

#### Step 4: Prepare Application

```bash
# Clone repository (if not already)
git clone https://github.com/shelbeely/ADHD-Closet.git
cd ADHD-Closet/app

# Install dependencies
npm install

# Add Supabase client
npm install @supabase/supabase-js
```

#### Step 5: Configure Environment Variables

Create `app/.env.local`:

```bash
# Database (Neon)
DATABASE_URL="postgresql://[user]:[password]@[host].neon.tech/[database]?sslmode=require"

# Redis (Upstash)
REDIS_URL="redis://default:[password]@[endpoint].upstash.io:6379"

# OpenRouter
OPENROUTER_API_KEY="sk-or-v1-..."

# Supabase Storage
SUPABASE_URL="https://[project].supabase.co"
SUPABASE_ANON_KEY="your_anon_key"
SUPABASE_SERVICE_KEY="your_service_role_key"

# App Config
NODE_ENV="development"
PUBLIC_BASE_URL="http://localhost:3000"
```

#### Step 6: Run Migrations

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Optional: Seed sample data
npx prisma db seed
```

#### Step 7: Test Locally

```bash
# Start development server
npm run dev

# Open http://localhost:3000
# Test:
# - Add an item
# - Upload an image
# - Generate outfit (tests AI + Redis queue)
```

#### Step 8: Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables in Vercel Dashboard
# (same as .env.local, but use production URLs)

# Deploy to production
vercel --prod
```

#### Step 9: Verify Deployment

```bash
# Check app is running
curl https://your-app.vercel.app/api/health

# Check database connection
curl https://your-app.vercel.app/api/items

# Monitor logs in Vercel Dashboard
```

---

## Staying Within Limits

### Database (Neon 0.5GB / Supabase 500MB)

**Typical storage usage:**
- 1 item with metadata: ~1-2 KB
- 1000 items: ~1-2 MB
- Outfit metadata: ~0.5 KB each

**Optimization tips:**
1. Don't store images in database (use external storage)
2. Limit AI-generated descriptions length
3. Compress metadata JSON fields
4. Regularly archive old/unused items

**Monitoring:**
```sql
-- Check database size (run in Supabase SQL editor or Neon console)
SELECT pg_size_pretty(pg_database_size('postgres'));

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Redis (Upstash 256MB / 500k commands)

**Typical usage:**
- BullMQ metadata: ~10-50 KB per job
- Job retention: Keep completed jobs for 24 hours only

**Optimization tips:**
1. Set aggressive job cleanup in BullMQ
2. Don't cache large images in Redis
3. Use Redis for queues only, not general caching

**Configure job cleanup** in `app/lib/queue.ts`:

```typescript
import { Queue } from 'bullmq';

export const aiQueue = new Queue('ai-processing', {
  connection: process.env.REDIS_URL,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: {
      age: 3600, // 1 hour (was 24 hours)
      count: 100, // Keep last 100 (was 1000)
    },
    removeOnFail: {
      age: 7200, // 2 hours
      count: 50,
    },
  },
});
```

### Vercel Bandwidth (100GB/month)

**Typical usage:**
- Average page load: 200-500 KB
- 100GB = ~200,000-500,000 page views

**Optimization tips:**
1. Use Supabase/R2 for images (doesn't count toward Vercel bandwidth)
2. Enable image optimization
3. Use CDN headers for static assets
4. Compress API responses

**Add compression to API routes:**

```typescript
// app/api/items/route.ts
export async function GET(request: Request) {
  const items = await prisma.item.findMany();
  
  return new Response(JSON.stringify(items), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Encoding': 'gzip', // If using middleware
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
}
```

### Image Storage (Supabase 1GB / Vercel Blob 0.5GB)

**Typical usage:**
- Original photo: 2-5 MB (smartphone camera)
- Optimized photo: 200-500 KB (after compression)
- Thumbnail: 20-50 KB
- 1GB = 2000-5000 optimized images

**Optimization tips:**
1. Always compress images before upload
2. Generate thumbnails (store both)
3. Use image dimensions limits (max 1920px)
4. Delete AI-generated catalog images after a period

**Add image compression** in `app/lib/image-processing.ts`:

```typescript
import sharp from 'sharp';

export async function optimizeImage(
  buffer: Buffer,
  maxWidth: number = 1920
): Promise<Buffer> {
  return await sharp(buffer)
    .resize(maxWidth, null, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer();
}

export async function generateThumbnail(
  buffer: Buffer,
  size: number = 300
): Promise<Buffer> {
  return await sharp(buffer)
    .resize(size, size, { fit: 'cover' })
    .jpeg({ quality: 80 })
    .toBuffer();
}
```

### OpenRouter API (Pay-per-use)

**Typical costs:**
- Vision (item inference): ~$0.001-0.01 per image
- Image generation: ~$0.01-0.05 per image
- Text (outfit generation): ~$0.0001-0.001 per request

**Monthly usage estimate:**
- 100 items added: ~$1-5
- 50 outfit generations: ~$0.05

**Optimization tips:**
1. Cache AI results in database
2. Only regenerate when explicitly requested
3. Use Gemini Flash for text (cheaper than Pro)
4. Batch requests when possible

---

## Monitoring Usage

### Neon Dashboard

```
https://console.neon.tech/app/projects/[project-id]
→ Dashboard tab
→ View: Storage used, Compute hours, Active time
```

### Upstash Console

```
https://console.upstash.com/redis/[database-id]
→ Metrics tab
→ View: Commands/day, Memory usage
```

### Vercel Analytics

```
https://vercel.com/[username]/[project]/analytics
→ View: Bandwidth, Function invocations, Build minutes
```

### Supabase Dashboard

```
https://supabase.com/dashboard/project/[project-id]
→ Database tab: See storage usage
→ Storage tab: See file storage usage
```

### Setup Alerts

**Neon**: Set up email alerts for high usage
**Upstash**: Monitor daily command count
**Vercel**: Check usage weekly
**Supabase**: Watch for inactivity warnings

---

## When to Upgrade

Consider upgrading when:

### Database
- Approaching 400MB (80% of 500MB limit)
- Need more than 50k MAU (Supabase)
- Need consistent sub-100ms response times (Neon cold starts)
- Need point-in-time backups

**Upgrade to:**
- Supabase Pro: $25/month (8GB storage, no pausing)
- Neon Launch: $19/month (pay-as-you-go, better compute)

### Redis
- Using >200MB regularly
- Approaching 400k commands/month
- Need multiple databases

**Upgrade to:**
- Upstash Pro: $10/month base (pay-as-you-go)
- Redis Cloud: $7+/month for dedicated instances

### Hosting
- Need commercial use (Vercel free is non-commercial)
- Exceeding 80GB bandwidth/month
- Need longer function timeouts
- Need team collaboration

**Upgrade to:**
- Vercel Pro: $20/month (unlimited bandwidth on Pro plan, longer timeouts)
- Keep Render Free (allows commercial use)

### Image Storage
- Approaching 800MB (80% of 1GB)
- Need more than 5GB egress/month

**Upgrade to:**
- Cloudflare R2: $0.015/GB/month storage (no egress fees)
- Vercel Blob Pro: $0.30/GB/month

---

## Cost Comparison

### Free Tier Stack (This Guide)

```
Hosting (Vercel Free)         $0
Database (Neon Free)           $0
Redis (Upstash Free)           $0
Storage (Supabase Free)        $0
OpenRouter API                 $1-5/month
────────────────────────────────
TOTAL:                         $1-5/month
```

### Entry Production Stack

```
Hosting (Vercel Pro)           $20
Database (Neon Launch)         $19
Redis (Upstash Pro)            $10
Storage (Cloudflare R2)        $2-5
OpenRouter API                 $5-20
────────────────────────────────
TOTAL:                         $56-74/month
```

### Cloudflare Stack (see CLOUDFLARE.md)

```
Workers                        $5 (included in bundle)
Hyperdrive                     $5
External Postgres (Neon)       $19
R2 Storage                     $2-5
OpenRouter API                 $5-20
────────────────────────────────
TOTAL:                         $36-54/month
```

---

## Troubleshooting

### "Database connection failed"

**Neon:**
- Check if database is sleeping (scale-to-zero)
- First connection after sleep takes 1-2 seconds
- Verify connection string includes `?sslmode=require`

**Supabase:**
- Check if project is paused (1 week inactivity)
- Wake up project in dashboard
- Verify database password is correct

### "Redis connection timeout"

**Upstash:**
- Verify connection URL format: `redis://default:[password]@[host]:6379`
- Check if using TLS port (6380) for some regions
- Verify firewall/security group settings

### "Image upload failed"

**Supabase Storage:**
- Verify bucket exists and is public (or has correct policies)
- Check service key has storage permissions
- Verify file size < 50MB

**Vercel Blob:**
- Check if within 0.5GB limit
- Verify BLOB_READ_WRITE_TOKEN is set

### "Function timeout on Vercel"

- Free tier has 10s timeout (max 60s)
- Move long-running tasks to background queue
- Optimize database queries
- Consider upgrading to Pro for 60s timeout

### "App sleeps on Render"

- Normal behavior for free tier (15 min inactivity)
- Use UptimeRobot to ping every 5 minutes
- Or accept 30-60s cold start
- Upgrade to paid plan for always-on

---

## Additional Tips

### Development vs Production

**Use separate free tier projects for dev/prod:**
- Development: Neon project #1, Upstash database #1
- Production: Neon project #2, Upstash database #2 (if you have limits)
- Share staging database for both if needed

### Database Branching (Neon only)

Use Neon's branching feature for safe migrations:

```bash
# Create branch for testing migration
neon branches create --project-id [id] --name test-migration

# Run migration on branch
DATABASE_URL=[branch_url] npx prisma migrate deploy

# Test on branch
# If successful, run on main database
```

### Backup Strategy

**Free tier doesn't include automatic backups**. Manual backup options:

```bash
# Export PostgreSQL data
pg_dump $DATABASE_URL > backup.sql

# Or use Prisma
npx prisma db pull
npx prisma db push --preview-feature
```

**Schedule weekly exports** and store in:
- GitHub repository (careful with secrets!)
- Google Drive / Dropbox
- Another free database (as backup)

### Multi-region Setup

Free tiers are single-region. For better global performance:

1. Choose database region close to most users
2. Use Cloudflare CDN for static assets (free)
3. Deploy to Vercel (automatically uses global CDN)
4. Consider upgrading for multi-region when traffic justifies cost

---

## Summary

**Best Free Setup for Personal Use:**
```
✅ Vercel (hosting) - Free, 100GB bandwidth
✅ Neon (database) - Free, 0.5GB + scale-to-zero
✅ Upstash (Redis) - Free, 256MB + 500k commands
✅ Supabase (storage) - Free, 1GB for images
✅ OpenRouter (AI) - Pay-per-use, ~$1-5/month
─────────────────────────────────────────────
Total: $1-5/month for personal use
```

**Expected Capacity:**
- ~1000-2000 clothing items
- ~2000-5000 optimized images
- ~10,000+ page views/month
- Unlimited outfit generations (cached)

**Perfect for:**
- Personal wardrobe management
- Testing and development
- Small household use (1-3 people)
- MVP / proof-of-concept

**When you outgrow free tier:**
- See [When to Upgrade](#when-to-upgrade)
- Or [Cloudflare Stack](CLOUDFLARE.md) for middle-ground option

---

For questions or issues, see [Troubleshooting](../user-guides/TROUBLESHOOTING.md) or open an issue on GitHub.
