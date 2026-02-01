# Cloudflare Deployment Guide

This guide covers deploying the ADHD Closet (Twin Style) application using Cloudflare services. By using Cloudflare's edge infrastructure, you get global distribution, low latency, and integrated services.

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Service Choices](#service-choices)
4. [Option A: Full Cloudflare Stack](#option-a-full-cloudflare-stack)
5. [Option B: Hybrid Approach](#option-b-hybrid-approach)
6. [Setup Steps](#setup-steps)
7. [Configuration](#configuration)
8. [Deployment](#deployment)
9. [Post-Deployment](#post-deployment)
10. [Monitoring & Troubleshooting](#monitoring--troubleshooting)

---

## Architecture Overview

The ADHD Closet app consists of:
- **Frontend**: Next.js 16 App Router (React 19)
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL 14+ with Prisma ORM
- **Queue System**: BullMQ with Redis
- **Image Storage**: Local filesystem
- **AI Processing**: OpenRouter API (Google Gemini models)

When deploying to Cloudflare, we need to adapt this stack to work with Cloudflare's edge-native services.

---

## Prerequisites

Before starting, ensure you have:

1. **Cloudflare Account**: Sign up at [cloudflare.com](https://dash.cloudflare.com/sign-up)
   - Free tier is sufficient for development/testing
   - Paid plans ($20-100/month) recommended for production

2. **Domain Name**: 
   - Can purchase through Cloudflare Registrar
   - Or point existing domain to Cloudflare nameservers

3. **Development Tools**:
   ```bash
   # Install Wrangler CLI (Cloudflare's deployment tool)
   npm install -g wrangler
   
   # Login to Cloudflare
   wrangler login
   ```

4. **OpenRouter API Key**: Required for AI features
   - Sign up at [openrouter.ai](https://openrouter.ai)
   - Get API key from dashboard

5. **GitHub Repository**: Code must be in a Git repository
   - Can be GitHub, GitLab, or Bitbucket
   - Cloudflare Pages can deploy from all three

---

## Service Choices

You have two main approaches for deploying to Cloudflare:

### Option A: Full Cloudflare Stack (Recommended for Simplicity)
- **Hosting**: Cloudflare Workers + OpenNext adapter
- **Database**: Cloudflare D1 (SQLite-based, edge-optimized)
- **Queue/State**: Cloudflare Durable Objects + Queues
- **Images**: Cloudflare R2 (S3-compatible)
- **Pros**: Fully integrated, edge-native, simple management
- **Cons**: D1 has SQLite limitations (no ENUMs, limited transactions)

### Option B: Hybrid Approach (Recommended for Full Features)
- **Hosting**: Cloudflare Workers + OpenNext adapter
- **Database**: External PostgreSQL (Neon, Supabase, or Railway) + Hyperdrive
- **Queue/State**: Cloudflare Durable Objects or external Redis (Upstash)
- **Images**: Cloudflare R2
- **Pros**: Full PostgreSQL features, mature ecosystem
- **Cons**: Slightly more complex setup, external service management

**Recommendation**: Start with Option B (Hybrid) to keep full PostgreSQL compatibility and minimize code changes.

---

## Option A: Full Cloudflare Stack

### Database: Cloudflare D1

**Important**: D1 is SQLite-based and has limitations. The current Prisma schema uses PostgreSQL features that D1 doesn't support (like ENUMs). You'll need to modify the schema.

#### Step 1: Create D1 Database
```bash
# Create database
wrangler d1 create wardrobe-closet

# Output will show database ID - save this!
# Add to wrangler.toml:
[[d1_databases]]
binding = "DB"
database_name = "wardrobe-closet"
database_id = "your-database-id-here"
```

#### Step 2: Adapt Prisma Schema
You'll need to convert the PostgreSQL schema to SQLite. Key changes:

```prisma
// Original (PostgreSQL):
enum ItemCategory {
  TOP
  BOTTOM
  SHOES
  // ...
}

// Convert to (SQLite):
model ItemCategory {
  id    String @id @default(cuid())
  value String @unique
  items Item[]
}

// Also change datasource:
datasource db {
  provider = "sqlite"  // Changed from "postgresql"
  url      = env("DATABASE_URL")
}
```

#### Step 3: Install D1 Adapter
```bash
cd /home/runner/work/ADHD-Closet/ADHD-Closet/app
npm install @prisma/adapter-d1
```

#### Step 4: Update Prisma Client Initialization
Create `app/lib/prisma-d1.ts`:
```typescript
import { PrismaClient } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';

export function getPrismaClient(env: any) {
  const adapter = new PrismaD1(env.DB);
  return new PrismaClient({ adapter });
}
```

Update API routes to use this:
```typescript
// In your API routes
import { getPrismaClient } from '@/lib/prisma-d1';

export async function GET(request: Request, { env }: { env: any }) {
  const prisma = getPrismaClient(env);
  // ... rest of your code
}
```

#### Step 5: Migrate Database
```bash
# Generate migration SQL
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script > migrations/0001_init.sql

# Apply to D1
wrangler d1 execute wardrobe-closet --file=migrations/0001_init.sql
```

### Queue System: Cloudflare Durable Objects & Queues

BullMQ won't work on Cloudflare Workers. Replace with Durable Objects.

#### Step 1: Create Queue Durable Object
Create `app/workers/ai-queue.ts`:
```typescript
export class AIQueue {
  state: DurableObjectState;
  jobs: Map<string, any>;

  constructor(state: DurableObjectState) {
    this.state = state;
    this.jobs = new Map();
  }

  async fetch(request: Request) {
    const url = new URL(request.url);
    
    if (url.pathname === '/enqueue') {
      const job = await request.json();
      const jobId = crypto.randomUUID();
      this.jobs.set(jobId, job);
      
      // Process job asynchronously
      this.processJob(jobId, job);
      
      return new Response(JSON.stringify({ jobId }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (url.pathname.startsWith('/status/')) {
      const jobId = url.pathname.split('/').pop();
      const job = this.jobs.get(jobId!);
      return new Response(JSON.stringify(job), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response('Not Found', { status: 404 });
  }

  async processJob(jobId: string, job: any) {
    // Implement AI processing logic here
    // Call OpenRouter API, update job status
  }
}
```

Update `wrangler.toml`:
```toml
[[durable_objects.bindings]]
name = "AI_QUEUE"
class_name = "AIQueue"
script_name = "wardrobe-worker"

[[migrations]]
tag = "v1"
new_classes = ["AIQueue"]
```

---

## Option B: Hybrid Approach (Recommended)

This approach keeps PostgreSQL and requires minimal code changes.

### Database: External PostgreSQL + Hyperdrive

#### Step 1: Choose PostgreSQL Provider

**Neon (Recommended)**
- Serverless PostgreSQL
- Free tier: 0.5 GB storage, 191 compute hours/month
- Auto-scales, auto-sleeps
- Sign up: [neon.tech](https://neon.tech)

**Supabase**
- PostgreSQL with built-in features (auth, storage, realtime)
- Free tier: 500 MB storage, 2 GB bandwidth
- Sign up: [supabase.com](https://supabase.com)

**Railway**
- Simple PostgreSQL hosting
- $5/month minimum
- Sign up: [railway.app](https://railway.app)

**Example: Setting up Neon**
```bash
# 1. Sign up at neon.tech
# 2. Create new project "wardrobe-closet"
# 3. Copy connection string (looks like):
#    postgres://user:pass@ep-xxx.us-east-2.aws.neon.tech/wardrobe

# 4. Test connection locally
DATABASE_URL="postgres://..." bunx prisma migrate dev
```

#### Step 2: Setup Cloudflare Hyperdrive
Hyperdrive provides connection pooling and query caching for your database.

```bash
# Create Hyperdrive configuration
wrangler hyperdrive create wardrobe-db \
  --connection-string="postgres://user:pass@host:5432/wardrobe"

# Save the Hyperdrive ID output
# Add to wrangler.toml:
[[hyperdrive]]
binding = "HYPERDRIVE"
id = "your-hyperdrive-id-here"
```

#### Step 3: Update Prisma for Hyperdrive
Install Prisma adapter:
```bash
cd /home/runner/work/ADHD-Closet/ADHD-Closet/app
npm install @prisma/adapter-pg pg
```

Create `app/lib/prisma-hyperdrive.ts`:
```typescript
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

export function getPrismaClient(hyperdriveUrl: string) {
  const pool = new Pool({ connectionString: hyperdriveUrl });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}
```

Update API routes:
```typescript
import { getPrismaClient } from '@/lib/prisma-hyperdrive';

export async function GET(request: Request, { env }: { env: any }) {
  const prisma = getPrismaClient(env.HYPERDRIVE.connectionString);
  // ... rest of your code
}
```

### Queue System: Options

**Option 1: Cloudflare Queues (Simplest)**
```bash
# Create queue
wrangler queues create ai-jobs

# Add to wrangler.toml
[[queues.producers]]
queue = "ai-jobs"
binding = "AI_QUEUE"

[[queues.consumers]]
queue = "ai-jobs"
max_batch_size = 10
max_batch_timeout = 30
```

Create consumer in `app/workers/queue-consumer.ts`:
```typescript
export default {
  async queue(batch: MessageBatch, env: Env): Promise<void> {
    for (const message of batch.messages) {
      const job = message.body;
      // Process AI job
      await processAIJob(job, env);
      message.ack();
    }
  }
};
```

**Option 2: Upstash Redis (Drop-in BullMQ replacement)**
```bash
# 1. Sign up at upstash.com
# 2. Create Redis database (free tier available)
# 3. Get connection URL (Redis URL with TLS)

# Add to Cloudflare secrets
wrangler secret put REDIS_URL
# Paste: rediss://user:pass@host:port
```

Keep existing BullMQ code, it will work with Upstash Redis URL.

### Image Storage: Cloudflare R2

R2 is S3-compatible object storage with zero egress fees.

#### Step 1: Create R2 Bucket
```bash
# Create bucket
wrangler r2 bucket create wardrobe-images

# Add to wrangler.toml
[[r2_buckets]]
binding = "IMAGES"
bucket_name = "wardrobe-images"
```

#### Step 2: Configure CORS
In Cloudflare Dashboard → R2 → wardrobe-images → Settings → CORS Policy:
```json
[
  {
    "AllowedOrigins": ["https://your-domain.com"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

#### Step 3: Update Image Upload Code
Install AWS SDK:
```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

Create `app/lib/r2-client.ts`:
```typescript
import { S3Client } from '@aws-sdk/client-s3';

export function getR2Client(env: any) {
  return new S3Client({
    region: 'auto',
    endpoint: env.R2_ENDPOINT,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
  });
}
```

Update image upload API routes to use R2 instead of filesystem.

---

## Setup Steps

### 1. Install Dependencies

```bash
cd /home/runner/work/ADHD-Closet/ADHD-Closet/app

# Install Cloudflare adapter
npm install @opennextjs/cloudflare

# Install database adapters (choose one)
npm install @prisma/adapter-d1  # For D1
# OR
npm install @prisma/adapter-pg pg  # For PostgreSQL + Hyperdrive

# Install AWS SDK for R2
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

### 2. Create wrangler.toml

Create `/home/runner/work/ADHD-Closet/ADHD-Closet/app/wrangler.toml`:

**For Hybrid Approach (PostgreSQL + Hyperdrive + R2):**
```toml
name = "wardrobe-closet"
compatibility_date = "2024-01-01"
main = ".open-next/worker.js"

# Hyperdrive (Database connection pooling)
[[hyperdrive]]
binding = "HYPERDRIVE"
id = "your-hyperdrive-id"

# R2 (Image storage)
[[r2_buckets]]
binding = "IMAGES"
bucket_name = "wardrobe-images"

# Environment variables (non-secret)
[vars]
NODE_ENV = "production"
PUBLIC_BASE_URL = "https://your-domain.com"

# Queues (optional - for AI jobs)
[[queues.producers]]
queue = "ai-jobs"
binding = "AI_QUEUE"

[[queues.consumers]]
queue = "ai-jobs"
max_batch_size = 5
max_batch_timeout = 30
max_retries = 3
dead_letter_queue = "ai-jobs-dlq"
```

**For Full Cloudflare Stack (D1 + Durable Objects + R2):**
```toml
name = "wardrobe-closet"
compatibility_date = "2024-01-01"
main = ".open-next/worker.js"

# D1 Database
[[d1_databases]]
binding = "DB"
database_name = "wardrobe-closet"
database_id = "your-d1-id"

# Durable Objects (for queue/state)
[[durable_objects.bindings]]
name = "AI_QUEUE"
class_name = "AIQueue"
script_name = "wardrobe-worker"

[[migrations]]
tag = "v1"
new_classes = ["AIQueue"]

# R2 (Image storage)
[[r2_buckets]]
binding = "IMAGES"
bucket_name = "wardrobe-images"

# Environment variables
[vars]
NODE_ENV = "production"
PUBLIC_BASE_URL = "https://your-domain.com"
```

### 3. Update next.config.ts

Modify `/home/runner/work/ADHD-Closet/ADHD-Closet/app/next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configure for Cloudflare Workers
  output: 'export',  // Static export for edge compatibility
  images: {
    unoptimized: true,  // R2 will handle images
  },
};

module.exports = nextConfig;
```

### 4. Add Edge Runtime to API Routes

For each API route, add edge runtime support:

```typescript
// Example: app/api/items/route.ts
export const runtime = 'edge';  // Add this line

export async function GET(request: Request) {
  // Your existing code
}
```

Do this for all files in:
- `app/api/items/`
- `app/api/outfits/`
- `app/api/ai/`
- `app/api/images/`

### 5. Configure Environment Secrets

```bash
# OpenRouter API key
wrangler secret put OPENROUTER_API_KEY
# Paste your key when prompted

# R2 credentials (get from Cloudflare Dashboard → R2 → Manage R2 API Tokens)
wrangler secret put R2_ACCESS_KEY_ID
wrangler secret put R2_SECRET_ACCESS_KEY

# For Hybrid approach: Database URL (if not using Hyperdrive binding)
wrangler secret put DATABASE_URL

# For Option with Upstash Redis
wrangler secret put REDIS_URL
```

### 6. Update Package Scripts

Add to `/home/runner/work/ADHD-Closet/ADHD-Closet/app/package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "build:cloudflare": "npx @opennextjs/cloudflare",
    "deploy": "npm run build:cloudflare && wrangler deploy",
    "preview": "wrangler dev",
    "start": "next start"
  }
}
```

---

## Configuration

### Environment Variables Mapping

The app currently uses these environment variables. Map them for Cloudflare:

| Local Variable | Cloudflare Equivalent | How to Set |
|----------------|----------------------|------------|
| `DATABASE_URL` | `env.HYPERDRIVE.connectionString` (Hybrid) or `env.DB` (D1) | Wrangler binding |
| `REDIS_URL` | `env.AI_QUEUE` (Durable Objects) or keep as secret (Upstash) | Binding or secret |
| `OPENROUTER_API_KEY` | `env.OPENROUTER_API_KEY` | `wrangler secret put` |
| `DATA_DIR` | Not needed (use R2) | Remove |
| `PUBLIC_BASE_URL` | `env.PUBLIC_BASE_URL` | Add to `wrangler.toml` vars |

### Update Code to Access Environment

Workers use a different pattern for environment variables:

```typescript
// Before (Node.js):
const apiKey = process.env.OPENROUTER_API_KEY;

// After (Cloudflare Workers):
export async function GET(request: Request, { env }: { env: Env }) {
  const apiKey = env.OPENROUTER_API_KEY;
  // ...
}
```

Define types in `app/types/env.d.ts`:
```typescript
export interface Env {
  OPENROUTER_API_KEY: string;
  HYPERDRIVE: Hyperdrive;  // Or DB: D1Database
  IMAGES: R2Bucket;
  AI_QUEUE: Queue;  // Or DurableObjectNamespace
  PUBLIC_BASE_URL: string;
  // Add other env vars here
}
```

---

## Deployment

### First-Time Deployment

```bash
cd /home/runner/work/ADHD-Closet/ADHD-Closet/app

# 1. Build for Cloudflare
npm run build:cloudflare

# 2. Deploy to Cloudflare Workers
wrangler deploy

# Output will show your deployment URL:
# https://wardrobe-closet.your-subdomain.workers.dev
```

### Database Migration

**For Hybrid Approach (PostgreSQL):**
```bash
# Run migrations on your external database
DATABASE_URL="postgres://..." bunx prisma migrate deploy
```

**For D1:**
```bash
# Generate migration SQL
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script > migrations/init.sql

# Apply to D1
wrangler d1 execute wardrobe-closet --file=migrations/init.sql
```

### Setup Custom Domain

```bash
# Add custom domain
wrangler domains add your-domain.com

# Or use Cloudflare Dashboard:
# Workers & Pages → wardrobe-closet → Settings → Domains
# Click "Add Custom Domain"
```

### Configure DNS

In Cloudflare Dashboard → DNS:
1. Add CNAME record: `@` → `wardrobe-closet.your-subdomain.workers.dev`
2. Enable proxy (orange cloud icon)
3. SSL/TLS → Full (strict)

---

## Post-Deployment

### 1. Test the Application

```bash
# Test your deployment
curl https://your-domain.com/api/health

# Test image upload
curl -X POST https://your-domain.com/api/items \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Item"}'
```

### 2. Enable Caching

In `wrangler.toml`, add caching rules:
```toml
[site]
bucket = ".open-next/assets"

[[routes]]
pattern = "*.jpg"
cache_level = "cache_everything"
edge_cache_ttl = 2592000  # 30 days

[[routes]]
pattern = "*.png"
cache_level = "cache_everything"
edge_cache_ttl = 2592000
```

### 3. Setup Analytics

Enable Cloudflare Analytics:
1. Dashboard → Workers & Pages → wardrobe-closet
2. Analytics tab
3. View requests, errors, CPU time, etc.

Optional: Add Cloudflare Web Analytics for frontend:
```html
<!-- Add to app/layout.tsx -->
<script defer 
  src='https://static.cloudflareinsights.com/beacon.min.js'
  data-cf-beacon='{"token": "your-token-here"}'>
</script>
```

### 4. Configure Rate Limiting

Protect API routes from abuse:
```bash
# In Cloudflare Dashboard:
# Security → WAF → Rate limiting rules

# Example rule:
# If incoming requests match:
#   - URI Path contains "/api/"
#   - Rate exceeds 100 requests per 1 minute
# Then:
#   - Block for 1 hour
```

### 5. Backup Strategy

**Database Backups:**
- Neon: Automatic backups (7 days retention)
- Supabase: Automatic daily backups
- D1: Manual exports via `wrangler d1 export`

**R2 Backups:**
```bash
# Sync R2 to local backup
wrangler r2 object get wardrobe-images --file=backup.zip

# Or use rclone for continuous sync
rclone sync cloudflare:wardrobe-images ./backups/
```

---

## Monitoring & Troubleshooting

### View Logs

```bash
# Tail live logs
wrangler tail

# View logs in dashboard
# Workers & Pages → wardrobe-closet → Logs → Real-time Logs
```

### Common Issues

#### 1. "Module not found" errors
**Solution**: Ensure all dependencies are installed and compatible with Workers runtime.
```bash
npm install
npm run build:cloudflare
```

#### 2. Database connection timeout
**Solution**: Check Hyperdrive configuration and database allowlist.
```bash
# Test Hyperdrive connection
wrangler hyperdrive get wardrobe-db

# Verify database is accessible from Cloudflare IPs
# Add Cloudflare IP ranges to database firewall
```

#### 3. R2 CORS errors
**Solution**: Update CORS policy to include your domain.
```json
{
  "AllowedOrigins": ["https://your-domain.com", "https://*.workers.dev"],
  "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
  "AllowedHeaders": ["*"]
}
```

#### 4. Function execution timeout (30s limit)
**Solution**: Break long-running tasks into smaller chunks or use Durable Objects.
```typescript
// Use Durable Objects for long-running AI processing
const id = env.AI_QUEUE.idFromName("processor");
const stub = env.AI_QUEUE.get(id);
await stub.fetch(request);
```

#### 5. Cold start latency
**Solution**: 
- Use Smart Placement (Dashboard → Settings → Smart Placement)
- Keep functions warm with health check pings
- Optimize bundle size

### Performance Optimization

**1. Enable Smart Placement**
```bash
# In wrangler.toml
[placement]
mode = "smart"
```

**2. Reduce Bundle Size**
```bash
# Analyze bundle
npm run build:cloudflare -- --analyze

# Remove unused dependencies
# Enable tree-shaking in next.config.ts
```

**3. Use Cache API**
```typescript
// Cache AI responses
const cache = await caches.open('ai-responses');
const cached = await cache.match(request);
if (cached) return cached;

const response = await fetch(openRouterAPI);
await cache.put(request, response.clone());
return response;
```

### Monitoring Costs

Check usage in Dashboard → Workers & Pages → wardrobe-closet → Usage:
- **Requests**: First 100k/day free, then $0.50/million
- **Duration**: First 10ms/request free, then $12.50/million GB-s
- **R2 Storage**: $0.015/GB/month
- **R2 Operations**: Class A (writes) $4.50/million, Class B (reads) $0.36/million
- **Hyperdrive**: $5/month per database

**Free Tier Summary:**
- 100k requests/day
- Unlimited bandwidth (R2 egress free!)
- 10 GB R2 storage
- Basic DDoS protection

**Typical Monthly Cost (Small App):**
- ~$5-10 for Hyperdrive
- ~$5-20 for external PostgreSQL (Neon/Supabase)
- ~$1-5 for R2 storage
- Workers: Usually stays within free tier
- **Total: $10-35/month**

---

## CI/CD Setup (GitHub Actions)

Create `.github/workflows/deploy-cloudflare.yml`:

```yaml
name: Deploy to Cloudflare

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install dependencies
        working-directory: ./app
        run: npm ci
        
      - name: Build for Cloudflare
        working-directory: ./app
        run: npm run build:cloudflare
        
      - name: Deploy to Cloudflare
        working-directory: ./app
        run: npx wrangler deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

Setup secrets in GitHub:
1. Go to repo Settings → Secrets → Actions
2. Add `CLOUDFLARE_API_TOKEN`:
   - Get from Cloudflare Dashboard → My Profile → API Tokens
   - Use "Edit Cloudflare Workers" template
   - Copy token and paste in GitHub secret

---

## Migration from Existing Deployment

If you're migrating from an existing Docker/VPS deployment:

### 1. Export Data
```bash
# Export database
pg_dump $DATABASE_URL > backup.sql

# Backup images
tar -czf images-backup.tar.gz ./app/data/images/
```

### 2. Import to Cloudflare
```bash
# Import database to Neon/Supabase
psql $NEW_DATABASE_URL < backup.sql

# Upload images to R2
wrangler r2 object put wardrobe-images --file=images-backup.tar.gz

# Or use AWS CLI (R2 is S3-compatible)
aws s3 sync ./app/data/images/ s3://wardrobe-images/ \
  --endpoint-url https://[account-id].r2.cloudflarestorage.com
```

### 3. Update Environment Variables
```bash
# Point to new database
wrangler secret put DATABASE_URL
# Enter: postgres://new-host/...
```

### 4. Test Before DNS Switch
```bash
# Test on workers.dev subdomain first
curl https://wardrobe-closet.your-subdomain.workers.dev

# When ready, update DNS
```

---

## Rollback Procedure

If deployment fails:

```bash
# List deployments
wrangler deployments list

# Rollback to previous version
wrangler rollback [deployment-id]
```

Or use Cloudflare Dashboard:
- Workers & Pages → wardrobe-closet → Deployments
- Click "···" on previous deployment → Rollback

---

## Security Checklist

Before going to production:

- [ ] All secrets set via `wrangler secret put` (not in code)
- [ ] R2 bucket CORS configured correctly
- [ ] Database firewall allows only Cloudflare IPs
- [ ] Rate limiting rules configured
- [ ] WAF rules enabled (if needed)
- [ ] SSL/TLS set to "Full (strict)"
- [ ] API routes have input validation (Zod schemas)
- [ ] File upload size limits enforced
- [ ] User authentication enabled (if multi-user)
- [ ] Regular backups configured
- [ ] Monitoring/alerts set up

---

## Additional Resources

### Official Documentation
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [OpenNext Cloudflare Adapter](https://opennext.js.org/cloudflare)
- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [Cloudflare Hyperdrive Docs](https://developers.cloudflare.com/hyperdrive/)
- [Prisma on Cloudflare](https://www.prisma.io/docs/orm/prisma-client/deployment/edge/deploy-to-cloudflare)

### Community Resources
- [Cloudflare Developers Discord](https://discord.gg/cloudflaredev)
- [Next.js on Cloudflare Examples](https://github.com/cloudflare/next-on-pages)
- [Cloudflare Workers Examples](https://github.com/cloudflare/workers-sdk/tree/main/templates)

### Cost Calculators
- [Cloudflare Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- [R2 Pricing Calculator](https://r2-calculator.cloudflare.com/)

---

## Summary

**Quick Start (Hybrid Approach - Recommended)**
```bash
# 1. Setup external services
# - Create PostgreSQL database (Neon/Supabase)
# - Create R2 bucket
# - Create Hyperdrive configuration

# 2. Install dependencies
cd /home/runner/work/ADHD-Closet/ADHD-Closet/app
npm install @opennextjs/cloudflare @prisma/adapter-pg pg @aws-sdk/client-s3

# 3. Create wrangler.toml (see setup section)

# 4. Add edge runtime to API routes
# Add: export const runtime = 'edge';

# 5. Set secrets
wrangler secret put OPENROUTER_API_KEY
wrangler secret put R2_ACCESS_KEY_ID
wrangler secret put R2_SECRET_ACCESS_KEY

# 6. Deploy
npm run build:cloudflare
wrangler deploy

# 7. Run migrations
DATABASE_URL="postgres://..." bunx prisma migrate deploy
```

Your app will be live at `https://wardrobe-closet.your-subdomain.workers.dev`!

---

For questions or issues, see [Troubleshooting](#monitoring--troubleshooting) or open an issue on GitHub.
