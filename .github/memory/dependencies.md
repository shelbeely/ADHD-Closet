# Dependencies

**Last Updated:** 2026-02-15  
**Purpose:** Actually used libraries and their purpose

## Overview

This document lists dependencies that are **actively used** in the codebase, not just installed. For Context7 library IDs, see `docs/CONTEXT7_LIBRARY_IDS.md`.

## Core Framework

### Next.js 16.1.4

**Package:** `next`  
**Context7 ID:** `/vercel/next.js/v16.1.5`  
**Usage:** Primary application framework

**Used For:**
- App Router (file-based routing)
- API Routes (backend endpoints)
- Server/Client components
- Image optimization
- Bundle optimization

**Key Files:**
- `app/next.config.ts` - Configuration
- `app/app/layout.tsx` - Root layout
- `app/app/api/*/route.ts` - API handlers

**Critical Patterns:**
- `'use client'` directive for client components
- App Router API routes (not Pages Router)
- Dynamic segments with `[id]`

---

### React 19.2.3

**Packages:** `react`, `react-dom`  
**Context7 ID:** `/facebook/react` (integrated with Next.js docs)  
**Usage:** UI library

**Used For:**
- Functional components
- Hooks (useState, useEffect, useRef, useMemo, useCallback)
- Context API
- Suspense boundaries

**Key Patterns:**
- No class components (100% functional)
- Custom hooks in `app/app/lib/hooks/`
- Material Design 3 component patterns

---

### TypeScript 5.9.3

**Package:** `typescript`  
**Usage:** Type system

**Used For:**
- Type safety across entire codebase
- Interface definitions
- Zod type inference
- Prisma type generation

**Config:** `app/tsconfig.json`

**Critical Settings:**
- `strict: true`
- `esModuleInterop: true`
- `moduleResolution: "bundler"`

---

## Database & ORM

### Prisma 7.3.0

**Packages:** `prisma` (dev), `@prisma/client`, `@prisma/adapter-pg`  
**Context7 ID:** `/prisma/docs`  
**Usage:** Database ORM

**Used For:**
- Schema definition (`schema.prisma`)
- Database migrations
- Type-safe queries
- PostgreSQL adapter pattern

**Key Files:**
- `app/prisma/schema.prisma` - Schema
- `app/prisma.config.ts` - Adapter config
- `app/app/lib/prisma.ts` - Client singleton

**Important Patterns:**
```typescript
// Prisma 7 requires adapter pattern
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
```

**Commands:**
- `npx prisma generate` - Generate client (REQUIRED after schema changes)
- `npx prisma migrate dev` - Create/apply migrations
- `npx prisma studio` - Database GUI

---

### node-postgres (pg) 8.17.2

**Package:** `pg`  
**Usage:** PostgreSQL connection pooling

**Used For:**
- Connection pool for PrismaPg adapter
- Direct database queries (rare)

**Used In:**
- `app/app/lib/prisma.ts` - Pool creation
- `app/prisma.config.ts` - Adapter configuration

---

## Background Jobs

### BullMQ 5.67.1

**Package:** `bullmq`  
**Context7 ID:** `/taskforcesh/bullmq`  
**Usage:** Job queue system

**Used For:**
- AI job queuing (catalog generation, item inference)
- Retry logic with exponential backoff
- Job status tracking

**Key Files:**
- `app/app/lib/queue.ts` - Queue setup
- `app/app/lib/ai/worker.ts` - Worker implementation

**Job Types:**
- `generate_catalog_image` - Transform photos to catalog images
- `infer_item` - Detect category, colors, attributes
- `extract_label` - OCR for brand/care labels
- `generate_outfit` - AI outfit suggestions
- `generate_outfit_visualization` - Outfit board images

**Configuration:**
```typescript
{
  attempts: 3,
  backoff: { type: 'exponential', delay: 2000 },
  removeOnComplete: { count: 100 },
  removeOnFail: { count: 500 }
}
```

---

### ioredis 5.9.2

**Package:** `ioredis`  
**Usage:** Redis client for BullMQ

**Used For:**
- Redis connection for BullMQ
- Connection options optimized for BullMQ

**Used In:**
- `app/app/lib/queue.ts` - Queue connection
- `app/app/lib/redis.ts` - Redis client
- `app/app/lib/ai/worker.ts` - Worker connection

**Critical Settings:**
```typescript
{
  maxRetriesPerRequest: null,  // Required for BullMQ
  enableReadyCheck: false       // Faster startup
}
```

---

## Validation & Type Safety

### Zod 4.3.6

**Package:** `zod`  
**Context7 ID:** `/colinhacks/zod/v4.0.1`  
**Usage:** Runtime validation

**Used For:**
- API input validation
- Schema definition
- Type inference (`z.infer<>`)
- Enum validation

**Used In:**
- All API routes (`app/app/api/*/route.ts`)
- `app/app/lib/attributeValidation.ts`

**Common Patterns:**
```typescript
const itemSchema = z.object({
  name: z.string().min(1),
  category: z.enum(['tops', 'bottoms', ...]),
  color: z.string().optional(),
});

type Item = z.infer<typeof itemSchema>;
```

---

## Image Processing

### Sharp 0.34.5

**Package:** `sharp`  
**Usage:** Image manipulation

**Used For:**
- Thumbnail generation (300x300px)
- Image resizing
- Format conversion
- EXIF metadata extraction

**Used In:**
- `app/app/api/items/[id]/images/route.ts` - Thumbnail creation
- Image optimization during uploads

**Key Operations:**
- `.resize(300, 300, { fit: 'cover' })` - Thumbnails
- `.jpeg({ quality: 80 })` - Compression
- `.metadata()` - EXIF reading

---

## Styling

### Tailwind CSS 4.x

**Packages:** `tailwindcss`, `@tailwindcss/postcss`  
**Context7 ID:** `/websites/tailwindcss`  
**Usage:** Utility-first CSS

**Used For:**
- Component styling
- Responsive design
- Dark mode support
- Custom design tokens

**Config:**
- `app/tailwind.config.ts` - Tailwind config
- `app/postcss.config.mjs` - PostCSS setup
- `app/app/globals.css` - Material Design 3 tokens

**Key Patterns:**
- CSS-first configuration (Tailwind 4)
- `@import "tailwindcss"` directive
- Custom properties for MD3 tokens

**Material Design 3 Tokens:**
```css
/* From globals.css */
--color-primary: ...;
--color-on-primary: ...;
--color-secondary-container: ...;
.bg-primary { background: var(--color-primary); }
.text-on-primary { color: var(--color-on-primary); }
```

---

## 3D Graphics

### Three.js 0.182.0

**Package:** `three`, `@types/three`  
**Context7 ID:** `/mrdoob/three.js` (implied)  
**Usage:** 3D rendering

**Used For:**
- 3D closet rail visualization
- Scene, mesh, material, geometry

**Used In:**
- `app/app/components/ClosetRail.tsx`
- `app/app/closet-rail/page.tsx`

---

### React Three Fiber 9.5.0

**Package:** `@react-three/fiber`  
**Context7 ID:** `/pmndrs/react-three-fiber`  
**Usage:** React renderer for Three.js

**Used For:**
- Canvas component
- Hooks (useFrame, useThree)
- Declarative 3D scenes

**Key Components:**
```tsx
<Canvas>
  <PerspectiveCamera />
  <OrbitControls />
  <mesh />
</Canvas>
```

---

### Drei 10.7.7

**Package:** `@react-three/drei`  
**Context7 ID:** `/pmndrs/drei`  
**Usage:** React Three Fiber helpers

**Used For:**
- OrbitControls (camera control)
- PerspectiveCamera (camera setup)
- Texture loading utilities

**Used In:**
- `app/app/components/ClosetRail.tsx`

---

## Mobile/Native

### Capacitor 8.x

**Packages:**
- `@capacitor/core` 8.0.2
- `@capacitor/cli` 8.0.2
- `@capacitor/android` 8.0.2
- `@capacitor/ios` 8.0.2

**Context7 ID:** `/ionic-team/capacitor` (implied)  
**Usage:** Native app bridge

**Used For:**
- Building iOS/Android apps
- Web → Native API bridge

**Config:** `app/capacitor.config.ts`

---

### Capacitor Plugins

**Packages:**
- `@capacitor/camera` 8.0.0 - Camera access
- `@capacitor/filesystem` 8.1.0 - File operations
- `@capacitor/haptics` 8.0.0 - Haptic feedback
- `@capacitor/share` 8.0.0 - Social sharing
- `@capacitor/splash-screen` 8.0.0 - Splash screen
- `@capacitor/status-bar` 8.0.0 - Status bar styling
- `@capgo/capacitor-nfc` 8.0.7 - NFC reading/writing

**Used In:**
- `app/app/lib/capacitor.ts` - Native bridge utilities
- Mobile pages with native features

---

## PWA

### next-pwa 5.6.0

**Package:** `next-pwa` (dev dependency)  
**Usage:** Progressive Web App support

**Used For:**
- Service worker generation
- Offline support
- App installation
- Runtime caching

**Config:** `app/next.config.ts`

**Features:**
- Offline-first strategy
- Cache static assets
- Background sync (future)

---

## Build Tools

### Bun 1.3.6

**Package Manager:** `bun@1.3.6`  
**Context7 ID:** `/oven-sh/bun`  
**Usage:** JavaScript runtime (preferred)

**Used For:**
- Faster package installation
- Development server
- Build processes
- Bun-specific APIs (Bun.spawn, fs operations)

**Critical Files:**
- `app/scripts/ziit/watch-daemon.ts` - Uses `Bun.spawn()`
- `app/scripts/ziit/health-check.ts` - Uses `Bun.spawn()`

**Fallback:** npm (project fully supports both)

---

### ESLint 9.x

**Package:** `eslint`, `eslint-config-next`  
**Usage:** Code linting

**Config:** `app/eslint.config.mjs`  
**Command:** `npm run lint`

**Used For:**
- Code quality checks
- Next.js best practices
- React hooks rules

---

## Utilities

### archiver 7.0.1

**Package:** `archiver`  
**Usage:** ZIP file creation

**Used For:**
- Export functionality (ZIP backup)

**Used In:**
- `app/app/api/export/route.ts`

---

### adm-zip 0.5.16

**Package:** `adm-zip`  
**Usage:** ZIP file extraction

**Used For:**
- Import functionality (ZIP restore)

**Used In:**
- `app/app/api/import/route.ts`

---

### chart.js 4.5.1

**Packages:** `chart.js`, `react-chartjs-2`  
**Usage:** Data visualization

**Used For:**
- Analytics dashboard
- Usage statistics

**Used In:**
- `app/app/analytics/page.tsx`

---

## Development-Only Dependencies

### tsx 4.21.0

**Package:** `tsx` (dev dependency)  
**Usage:** TypeScript execution

**Used For:**
- Running seed scripts
- Running Ziit scripts

**Commands:**
- `npx tsx prisma/seed.ts`
- `bun run scripts/ziit/watch-daemon.ts`

---

### dotenv 17.2.3

**Package:** `dotenv` (dev dependency)  
**Usage:** Environment variable loading

**Used For:**
- Loading `.env` files in scripts
- Seed scripts

---

## Dependency Map (Visual)

```
Next.js 16 (Framework)
├── React 19 (UI)
├── TypeScript 5.9 (Type System)
├── Tailwind CSS 4 (Styling)
│   └── PostCSS (CSS Processing)
├── API Routes
│   ├── Zod 4 (Validation)
│   ├── Prisma 7 (ORM)
│   │   ├── @prisma/adapter-pg (Adapter)
│   │   └── pg 8 (PostgreSQL Driver)
│   ├── BullMQ 5 (Queue)
│   │   └── ioredis 5 (Redis Client)
│   └── Sharp 0.34 (Image Processing)
├── 3D Graphics
│   ├── Three.js 0.182
│   ├── React Three Fiber 9.5
│   └── Drei 10.7
├── Mobile/Native
│   └── Capacitor 8.x
│       ├── Camera Plugin
│       ├── Filesystem Plugin
│       ├── NFC Plugin
│       └── Other Plugins
└── PWA
    └── next-pwa 5.6
```

## Version Constraints

### Critical Version Requirements

- **Next.js:** Must be 16.x (App Router features)
- **React:** Must be 19.x (Next.js 16 requirement)
- **Prisma:** Must be 7.x (adapter pattern)
- **BullMQ:** 5.x (ioredis compatibility)
- **Bun:** ≥1.0.0 (package manager version)

### Breaking Changes to Watch

1. **Next.js 16 → 17:** App Router stability, API changes
2. **Prisma 7 → 8:** Adapter pattern changes
3. **React 19 → 20:** Hooks API changes
4. **Tailwind 4 → 5:** CSS-first config changes

## Installation Commands

### Full Install (Bun - Preferred)

```bash
cd app
bun install --frozen-lockfile
npm run prisma:generate
```

**Time:** ~3-5 seconds

### Full Install (npm - Fallback)

```bash
cd app
npm install
npm run prisma:generate
```

**Time:** ~15-30 seconds

### Add New Dependency

```bash
cd app
bun add <package>              # Production
bun add -d <package>           # Development
npm run prisma:generate        # If Prisma-related
```

## Dependency Health

**Last Validated:** 2026-02-15 (via Context7)  
**Validation Report:** `docs/STACK_VALIDATION.md`

**Results:**
- ✅ 100% compliance with official documentation
- ✅ Zero deprecated APIs in use
- ✅ Zero breaking changes detected
- ✅ All patterns validated against Context7 docs

**Critical Dependencies Validated:**
- Next.js 16 App Router ✅
- Prisma 7 PrismaPg adapter ✅
- BullMQ 5 queue setup ✅
- Bun.js 1.3.6 spawn/fs APIs ✅
- Three.js + R3F Canvas ✅

---

**Next:** See `context7-notes.md` for Context7 usage patterns
