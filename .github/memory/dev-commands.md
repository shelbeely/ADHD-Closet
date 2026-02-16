# Development Commands

**Last Updated:** 2026-02-16  
**Purpose:** Build, test, lint, and development commands

## GitHub Copilot Hooks

### Hook System Overview

**Location:** `.github/hooks/`  
**Purpose:** Automated validation, telemetry, and knowledge maintenance

The repository uses GitHub Copilot hooks for:
- Session initialization and environment verification
- Automatic file validation after edits
- Command execution logging
- Error tracking
- Session summary generation
- Repository knowledge updates

**Documentation:** `.github/hooks/README.md`

### Hook-Related Commands

**Test runtime detection:**
```bash
node scripts/hooks/runtime-detector.js
```

**Test file validation:**
```bash
node scripts/hooks/file-validator.js app/components/Test.tsx
```

**Update knowledge graph manually:**
```bash
node scripts/hooks/knowledge-updater.js
```

**Enable verbose hook logging:**
```bash
export HOOK_VERBOSE=true
```

---

## Overview

All commands run from the `app/` directory unless otherwise specified.

```bash
cd /home/runner/work/ADHD-Closet/ADHD-Closet/app
```

## Package Manager Commands

### Install Dependencies

**Bun (Preferred - Fast):**
```bash
bun install
```
**Time:** ~3-5 seconds  
**Lockfile:** `bun.lockb`

**npm (Fallback):**
```bash
npm install
```
**Time:** ~15-30 seconds  
**Lockfile:** `package-lock.json`

**Important:** Project supports both Bun and npm equally.

---

### Add Dependencies

**Production:**
```bash
bun add <package>
# OR
npm install <package>
```

**Development:**
```bash
bun add -d <package>
# OR
npm install --save-dev <package>
```

**Important:** Run `npm run prisma:generate` after adding Prisma-related packages.

---

## Development Server

### Start Dev Server

**Bun:**
```bash
bun dev
```

**npm:**
```bash
npm run dev
```

**Time:** ~2-3 seconds to start  
**URL:** http://localhost:3000  
**Hot Reload:** Enabled (Fast Refresh)

**Features:**
- File watching
- Auto-reload on changes
- Error overlay
- Source maps

---

## Build Commands

### Production Build

```bash
npm run build
```

**Time:** ~30-60 seconds  
**Output:** `.next/` directory

**Steps:**
1. Compiles TypeScript
2. Bundles JavaScript
3. Optimizes images
4. Generates static pages
5. Creates service worker

**Verification:**
```bash
# Check build output
ls -lh .next/

# Start production server
npm start
```

---

### Production Start

```bash
npm start
```

**Requires:** Production build (`npm run build`) must run first  
**Port:** 3000 (or PORT env var)

---

## Linting

### Run ESLint

```bash
npm run lint
```

**Time:** ~5-10 seconds  
**Config:** `eslint.config.mjs`

**Checks:**
- TypeScript type errors
- React hooks rules
- Next.js best practices
- Unused variables
- Code style

**Fix Auto-Fixable Issues:**
```bash
npm run lint -- --fix
```

---

## Database Commands

### Generate Prisma Client

```bash
npm run prisma:generate
```

**Time:** ~3-5 seconds  
**Output:** `node_modules/@prisma/client/`

**⚠️ CRITICAL:** Run this after ANY change to `prisma/schema.prisma`

**When to Run:**
- After modifying `schema.prisma`
- After pulling schema changes from git
- After switching branches
- When TypeScript errors about Prisma types

---

### Create Migration

```bash
npm run prisma:migrate
# OR
npx prisma migrate dev --name <migration-name>
```

**Time:** ~5-10 seconds  
**Output:** `prisma/migrations/` directory

**Steps:**
1. Compares schema to database
2. Generates SQL migration
3. Applies migration to database
4. Regenerates Prisma Client

**Example:**
```bash
npx prisma migrate dev --name add_has_tucking_field
```

---

### Open Prisma Studio (Database GUI)

```bash
npm run prisma:studio
```

**Time:** ~2 seconds to start  
**URL:** http://localhost:5555  
**Features:** Visual database browser and editor

---

### Database Connection Test

```bash
npm run db:check
```

**Purpose:** Verify database connection  
**Script:** `scripts/check-db-connection.js`

---

## Database Seeding

### Basic Seed (53 Items)

```bash
npm run prisma:seed
```

**Time:** ~5-10 seconds  
**Creates:**
- 53 test items
- Covers all categories
- Diverse attributes

**Script:** `prisma/seed.ts`

---

### Full Seed (71 Items + AI Jobs)

```bash
npm run prisma:seed:full
```

**Time:** ~10-15 seconds  
**Creates:**
- 71 comprehensive items
- 10 tags
- 3 outfits
- 5 AI jobs
- 7 images
- 2 NFC tags

**Scripts:**
- `prisma/seed.ts`
- `prisma/seed-extension.ts`

---

### Demo Seed (284 Items - Realistic)

```bash
npm run prisma:seed:demo
```

**Time:** ~20-30 seconds  
**Creates:**
- 284 realistic items
- 15+ colors
- 30+ brands
- 15 tags
- 3 outfits
- All sizes and categories

**Script:** `prisma/seed-demo.ts`

**Best For:** Demos, screenshots, user testing

---

## Capacitor (Native Apps)

### Initialize Capacitor

```bash
npm run cap:init
```

**First-time setup only**

---

### Add Platforms

```bash
npm run cap:add:ios
npm run cap:add:android
```

**Requires:**
- Xcode (iOS)
- Android Studio (Android)

---

### Sync Web Build to Native

```bash
npm run cap:sync
# OR
npm run build:mobile
```

**Steps:**
1. Builds web app
2. Copies to native projects
3. Updates native dependencies

---

### Open in IDE

```bash
npm run cap:open:ios
npm run cap:open:android
```

**Opens:**
- Xcode (iOS)
- Android Studio (Android)

---

### Run on Device

```bash
npm run cap:run:ios
npm run cap:run:android
```

**Requires:** Device connected or simulator running

---

### Build Android APK

```bash
npm run build:android
```

**Output:** `android/app/build/outputs/apk/debug/app-debug.apk`  
**Time:** ~2-5 minutes

**Release Build:**
```bash
npm run build:android:release
```

---

## Ziit Heartbeat (Monitoring)

### Start Heartbeat Daemon

```bash
npm run ziit:watch
# OR
bun run ziit:watch
```

**Purpose:** Send heartbeats to Ziit.app for session monitoring  
**Requires:** `ZIIT_API_KEY` env var  
**Script:** `scripts/ziit/watch-daemon.ts`

**Background Process:** Runs indefinitely, monitors git changes

---

### Check Daemon Health

```bash
npm run ziit:health
# OR
bun run ziit:health
```

**Purpose:** Verify daemon is running  
**Script:** `scripts/ziit/health-check.ts`

**Output:**
- Daemon status
- PID
- Last heartbeat time
- Git branch and commit

---

### Send Test Heartbeat

```bash
npm run ziit:test
# OR
bun run ziit:test
```

**Purpose:** Verify Ziit API key and integration  
**Script:** `scripts/ziit/test-heartbeat.ts`

---

## Docker Commands

### Start Services

**Redis only:**
```bash
cd ..  # Repository root
docker compose up -d redis
```

**All services (includes optional local PostgreSQL):**
```bash
cd ..  # Repository root
docker compose --profile local-db up -d
```

---

### Stop Services

```bash
cd ..  # Repository root
docker compose down
```

---

### View Logs

```bash
cd ..  # Repository root
docker compose logs -f redis
```

---

### Check Service Health

**Redis:**
```bash
docker exec wardrobe-redis redis-cli ping
# Should return: PONG
```

**PostgreSQL (if using local):**
```bash
docker exec wardrobe-postgres pg_isready -U wardrobe
# Should return: accepting connections
```

---

## Git Commands (Frequent)

### Check Status

```bash
git --no-pager status
```

**Important:** Always use `--no-pager` in automated contexts

---

### View Changes

```bash
git --no-pager diff
```

---

### View Specific File Changes

```bash
git --no-pager show <commit> -- <file>
```

---

## Testing Commands

**Status:** No automated tests currently  
**Testing Strategy:** Manual testing

**Manual Testing Checklist:**
1. Test on mobile viewport (<1024px)
2. Test on desktop viewport (≥1024px)
3. Test in light mode
4. Test in dark mode
5. Test keyboard navigation
6. Verify loading states
7. Check error handling

---

## CI/CD Commands

### Copilot Setup (Automated)

**Workflow:** `.github/workflows/copilot-setup-steps.yml`

**Steps:**
1. Checkout code
2. Setup Bun 1.3.6
3. Install dependencies (`bun install --frozen-lockfile`)
4. Generate Prisma Client (`bunx prisma generate`)
5. Setup environment file (copy `.env.example`, inject `DATABASE_URL`)
6. Start Ziit daemon (if `ZIIT_API_KEY` present)

**No manual steps required**

---

### Documentation Deployment

**Workflow:** `.github/workflows/deploy-docs.yml`  
**Trigger:** Push to `main` affecting `docs/` or `mkdocs.yml`

**Steps:**
1. Install Python + MkDocs
2. Build documentation (`mkdocs build`)
3. Deploy to GitHub Pages (`mkdocs gh-deploy --force`)

**Output:** https://shelbeely.github.io/ADHD-Closet/

---

## Validation Commands

### Verify Everything Works

**Full Validation:**
```bash
# 1. Install dependencies
bun install

# 2. Generate Prisma Client
npm run prisma:generate

# 3. Check database connection
npm run db:check

# 4. Lint code
npm run lint

# 5. Build production
npm run build

# 6. Start production server
npm start
```

**Estimated Time:** ~2-3 minutes total

---

### Quick Health Check

```bash
# Check services
docker compose ps
docker exec wardrobe-redis redis-cli ping

# Check environment
cat .env | grep -v "API_KEY"

# Start dev server
bun dev
```

**Estimated Time:** ~10 seconds

---

## Command Reference (Quick)

| Task | Command | Time |
|------|---------|------|
| Install deps (Bun) | `bun install` | 3-5s |
| Install deps (npm) | `npm install` | 15-30s |
| Start dev server | `bun dev` | 2-3s |
| Production build | `npm run build` | 30-60s |
| Run linter | `npm run lint` | 5-10s |
| Generate Prisma | `npm run prisma:generate` | 3-5s |
| Create migration | `npm run prisma:migrate` | 5-10s |
| Prisma Studio | `npm run prisma:studio` | 2s |
| Seed database | `npm run prisma:seed` | 5-10s |
| Demo seed | `npm run prisma:seed:demo` | 20-30s |
| Start Redis | `docker compose up -d redis` | 5s |
| Build Android | `npm run build:android` | 2-5min |

---

## Common Workflows

### First-Time Setup

```bash
# 1. Clone repository
git clone https://github.com/shelbeely/ADHD-Closet.git
cd ADHD-Closet

# 2. Start Redis
docker compose up -d redis

# 3. Install dependencies
cd app
bun install

# 4. Setup environment
cp .env.example .env
# Edit .env with your values

# 5. Generate Prisma Client
npm run prisma:generate

# 6. Apply migrations
npm run prisma:migrate

# 7. Seed database (optional)
npm run prisma:seed:demo

# 8. Start dev server
bun dev
```

---

### After Pulling Changes

```bash
# 1. Install new dependencies (if package.json changed)
bun install

# 2. Regenerate Prisma Client (if schema.prisma changed)
npm run prisma:generate

# 3. Apply migrations (if new migrations)
npm run prisma:migrate

# 4. Start dev server
bun dev
```

---

### Before Committing

```bash
# 1. Lint code
npm run lint

# 2. Build to check for errors
npm run build

# 3. Manual testing
bun dev
# Test in browser

# 4. Commit
git add .
git commit -m "Description of changes"
```

---

## Troubleshooting Commands

### Fix: Prisma Client Out of Sync

```bash
npm run prisma:generate
```

---

### Fix: Redis Not Running

```bash
docker compose restart redis
docker exec wardrobe-redis redis-cli ping
```

---

### Fix: Build Failures

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules bun.lockb package-lock.json
bun install

# Regenerate Prisma
npm run prisma:generate

# Try build again
npm run build
```

---

### Fix: Database Connection Issues

```bash
# Test connection
npm run db:check

# Pull schema (validates connection)
npx prisma db pull

# Check environment
cat .env | grep DATABASE_URL
```

---

## Environment-Specific Notes

### GitHub Copilot Agent

- All commands automated in `copilot-setup-steps.yml`
- No manual commands needed
- Database schema already exists (Supabase persistent)
- Migrations not applied automatically (must be committed)

---

### Local Development

- Manual setup required first time
- Docker Compose for Redis
- Bun preferred for speed
- Hot reload enabled

---

### Production Deployment

- Build required: `npm run build`
- Start: `npm start`
- Environment variables from hosting platform
- Redis and PostgreSQL must be externally hosted

---

**Next:** See `context7-notes.md` for Context7 usage patterns
