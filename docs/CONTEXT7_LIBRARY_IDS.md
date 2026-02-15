# Context7 Library ID Reference

**Last Updated:** 2026-02-15  
**Purpose:** Quick reference for Context7 MCP library IDs to avoid repeated searches

## How to Use This Document

When using Context7 MCP tools, you can reference library IDs directly from this document:

```typescript
// Instead of calling resolve-library-id first:
context7-query-docs: {
  libraryId: "/vercel/next.js/v16.1.5",  // ← From this document
  query: "How to configure API routes?"
}
```

---

## Primary Tech Stack

### Next.js

**Primary Library ID:** `/vercel/next.js/v16.1.5`  
**Alternative IDs:**
- `/vercel/next.js` (latest)
- `/llmstxt/nextjs_llms-full_txt` (comprehensive docs, 10,222 snippets)
- `/websites/nextjs` (alternative source, 4,960 snippets)

**Stats:**
- Code Snippets: 2,043
- Source Reputation: High
- Benchmark Score: 92.9

**Available Versions:**
- v16.1.5 ✅ (Current project version: 16.1.4)
- v16.1.1
- v16.1.0
- v16.0.3
- v15.4.0-canary.82
- v15.1.11
- v15.1.8
- v14.3.0-canary.87
- v13.5.11
- v12.3.7
- v11.1.3

**Use Cases:**
- App Router configuration
- API routes with TypeScript
- Server/Client component patterns
- next.config.ts setup
- Middleware and routing

---

### React

**Primary Library ID:** `/facebook/react` (implied from Next.js docs)

**Use Cases:**
- Hooks (useState, useEffect, useRef)
- Component patterns
- TypeScript integration
- Context API
- Performance optimization

**Note:** React documentation is often integrated within Next.js docs for version compatibility.

---

### Prisma

**Primary Library ID:** `/prisma/docs`  
**Alternative IDs:**
- `/websites/prisma_io` (comprehensive, 8,000 snippets, score: 91.3)
- `/llmstxt/prisma_io_llms_txt` (8,621 snippets, score: 79.4)
- `/llmstxt/prisma_io_llms-full_txt` (Prisma Postgres specific, 45,708 snippets)
- `/prisma/prisma` (GitHub repo, 331 snippets)

**Stats:**
- Code Snippets: 7,702
- Source Reputation: High
- Benchmark Score: 86.6

**Available Versions:**
- (No specific version tags, uses latest from main branch)
- __branch__v6.19.0
- 6.19.2

**Current Project Version:** 7.3.0

**Use Cases:**
- Schema definition
- PrismaPg adapter setup
- Connection pooling with pg
- Migrations
- Query patterns
- TypeScript types
- Next.js integration

---

### BullMQ

**Primary Library ID:** `/taskforcesh/bullmq`  
**Alternative IDs:**
- `/websites/bullmq_io` (official website, 693 snippets, score: 83.7)
- `/websites/api_bullmq_io` (API docs, 104 snippets)

**Stats:**
- Code Snippets: 1,180
- Source Reputation: High
- Benchmark Score: 87.1

**Current Project Version:** 5.67.1

**Use Cases:**
- Queue setup with ioredis
- Worker configuration
- Job retry strategies
- Backoff patterns
- Job options (removeOnComplete, removeOnFail)
- Event handling
- Queue management

---

### Bun.js

**Primary Library ID:** `/oven-sh/bun`

**Stats:**
- Source Reputation: High
- Official Bun documentation

**Current Project Version:** 1.3.6

**Use Cases:**
- Bun.spawn() process spawning
- stdout/stderr handling
- File system operations
- Package management
- Runtime APIs
- Test runner

---

### Three.js Ecosystem

#### React Three Fiber

**Primary Library ID:** `/pmndrs/react-three-fiber`

**Stats:**
- Code Snippets: 413
- Source Reputation: High
- Benchmark Score: 77.2

**Current Project Version:** 9.5.0

**Use Cases:**
- Canvas component setup
- 3D scene rendering
- Hooks (useFrame, useThree)
- TypeScript types
- Performance optimization

#### Drei (React Three Fiber Helpers)

**Primary Library ID:** `/pmndrs/drei`

**Stats:**
- Code Snippets: 573
- Source Reputation: High
- Benchmark Score: 90.3

**Current Project Version:** 10.7.7

**Use Cases:**
- OrbitControls
- PerspectiveCamera
- Texture loading utilities
- HTML overlays
- Effects and post-processing helpers

#### Three.js Core

**Primary Library ID:** `/mrdoob/three.js` (implied)

**Current Project Version:** 0.182.0

**Use Cases:**
- Core Three.js classes (Scene, Mesh, Material, Geometry)
- Texture loading (THREE.TextureLoader)
- Math utilities
- Renderer configuration

---

### Validation & Type Safety

#### Zod

**Primary Library ID:** `/colinhacks/zod/v4.0.1`  
**Alternative IDs:**
- `/colinhacks/zod` (latest)
- `/websites/zod_dev_v4` (v4 docs, 2,358 snippets)
- `/websites/zod_dev` (comprehensive, 112,267 snippets, score: 80.7)
- `/websites/v3_zod_dev` (v3 docs, 8,255 snippets, score: 88.4)

**Stats:**
- Code Snippets: 552
- Source Reputation: High
- Benchmark Score: 92.7

**Available Versions:**
- v4.0.1 ✅ (Current project version: 4.3.6)
- v3.24.2

**Use Cases:**
- API input validation
- Schema definition
- Type inference (z.infer)
- Enum validation
- Complex object schemas
- Error handling

---

### Styling

#### Tailwind CSS

**Primary Library ID:** `/websites/tailwindcss`  
**Alternative IDs:**
- `/tailwindlabs/tailwindcss.com` (official site, 2,077 snippets, score: 76.6)
- `/websites/v3_tailwindcss` (v3 specific, 2,664 snippets, score: 91.4)
- `/websites/v2_tailwindcss` (v2 specific, 1,228 snippets, score: 77.9)

**Stats:**
- Code Snippets: 2,105
- Source Reputation: High
- Benchmark Score: 76.7

**Current Project Version:** 4.x

**Use Cases:**
- Tailwind 4 CSS-first configuration
- @import directive usage
- PostCSS plugin setup
- Custom properties integration
- Utility classes
- Responsive design
- Dark mode

---

## Supporting Libraries

### Redis Client

#### ioredis

**Library ID:** (Not queried, but standard npm package)

**Current Project Version:** 5.9.2

**Documentation:** Available via npm documentation

**Use Cases:**
- Redis connection for BullMQ
- Connection options (maxRetriesPerRequest, enableReadyCheck)
- Cluster support
- Pipeline operations

---

### Image Processing

#### Sharp

**Library ID:** (Not queried, but standard npm package)

**Current Project Version:** 0.34.5

**Use Cases:**
- Image resizing
- Thumbnail generation
- Format conversion
- Image optimization
- Metadata extraction

---

### Database Driver

#### node-postgres (pg)

**Library ID:** (Not queried, but standard npm package)

**Current Project Version:** 8.17.2

**Use Cases:**
- PostgreSQL connection pooling
- PrismaPg adapter integration
- Direct database queries
- Transaction handling

---

### Mobile/Native

#### Capacitor

**Primary Library ID:** `/ionic-team/capacitor` (implied)

**Current Project Versions:**
- @capacitor/core: 8.0.2
- @capacitor/cli: 8.0.2
- @capacitor/android: 8.0.2
- @capacitor/ios: 8.0.2

**Plugins:**
- @capacitor/camera: 8.0.0
- @capacitor/filesystem: 8.1.0
- @capacitor/haptics: 8.0.0
- @capacitor/share: 8.0.0
- @capacitor/splash-screen: 8.0.0
- @capacitor/status-bar: 8.0.0
- @capgo/capacitor-nfc: 8.0.7

**Use Cases:**
- Native iOS/Android bridge
- Camera access
- File system operations
- Haptic feedback
- NFC reading/writing
- Social sharing

---

### PWA

#### next-pwa

**Library ID:** (Not queried, standard Next.js plugin)

**Current Project Version:** 5.6.0

**Use Cases:**
- Service worker generation
- Offline support
- Runtime caching strategies
- Manifest configuration
- App installation

---

## Related Libraries (Not Currently Used)

### NestJS Bull

**Library ID:** `/nestjs/bull`

**Stats:**
- Code Snippets: 30
- Source Reputation: High
- Benchmark Score: 68.4

**Use Case:** If migrating to NestJS framework

---

### React Postprocessing

**Library ID:** `/pmndrs/react-postprocessing`

**Stats:**
- Code Snippets: 43
- Source Reputation: High
- Benchmark Score: 71.6

**Use Case:** Advanced visual effects for Three.js scenes

---

### React Three A11y

**Library ID:** `/pmndrs/react-three-a11y`

**Stats:**
- Code Snippets: 44
- Source Reputation: High

**Use Case:** Accessibility features for WebGL applications

---

### React Three CSG

**Library ID:** `/pmndrs/react-three-csg`

**Stats:**
- Code Snippets: 11
- Source Reputation: High

**Use Case:** Boolean operations on 3D models

---

### bunqueue

**Library ID:** `/egeominotti/bunqueue`

**Stats:**
- Code Snippets: 699
- Source Reputation: High
- Benchmark Score: 94.8

**Use Case:** Alternative to BullMQ specifically for Bun runtime (zero external dependencies, SQLite storage)

---

### Express Zod API

**Library ID:** `/robintail/express-zod-api`

**Stats:**
- Code Snippets: 96
- Source Reputation: High
- Benchmark Score: 92.4

**Use Case:** If building Express.js API instead of Next.js API routes

---

## Quick Reference Commands

### Query with Specific Version

```bash
context7-query-docs: {
  libraryId: "/vercel/next.js/v16.1.5",
  query: "Your question here"
}
```

### Query Latest Version

```bash
context7-query-docs: {
  libraryId: "/vercel/next.js",
  query: "Your question here"
}
```

### Multiple Library Comparison

Query both sources for comprehensive answers:

```bash
# Query 1
context7-query-docs: {
  libraryId: "/prisma/docs",
  query: "Adapter configuration"
}

# Query 2
context7-query-docs: {
  libraryId: "/websites/prisma_io",
  query: "Adapter configuration"
}
```

---

## Context7 Usage Tracking

**Monthly Quota:** 1,000 requests  
**Used in This Validation:** 12 queries  
**Remaining:** 988 queries

### Queries Used (2026-02-15):

1. `/vercel/next.js/v16.1.5` - Next.js configuration and patterns
2. `/prisma/docs` - Prisma adapter and client setup
3. `/taskforcesh/bullmq` - BullMQ queue configuration
4. `/pmndrs/react-three-fiber` - React Three Fiber patterns
5. `/oven-sh/bun` - Bun.js spawn and file operations
6. `/colinhacks/zod/v4.0.1` - Zod validation schemas

### Efficiency Tips:

1. **Batch Related Queries:** Ask multiple questions in a single query when possible
2. **Use Specific Versions:** Reference exact versions when validating production code
3. **Cache Common Patterns:** Store frequently-used patterns in project memory
4. **Prioritize Critical Queries:** Use for unfamiliar libraries or breaking changes

---

## Version Update Guide

When upgrading dependencies, update this document:

1. Check for new versions available in Context7
2. Test queries against new version library IDs
3. Update "Current Project Version" fields
4. Document any breaking changes or new patterns
5. Update validation date at top of document

---

## Additional Resources

### Finding New Library IDs

If you need a library not listed here:

```bash
context7-resolve-library-id: {
  libraryName: "library-name",
  query: "What you want to do with it"
}
```

This will return available library IDs with:
- Code snippet count
- Source reputation
- Benchmark score
- Available versions

### Best Practices

1. **Always use specific versions** when available (e.g., `/vercel/next.js/v16.1.5`)
2. **Prefer official sources** (highest benchmark scores and reputation)
3. **Use high snippet counts** for comprehensive examples
4. **Check multiple sources** for critical implementations

---

**Maintained By:** GitHub Copilot Agent  
**Update Frequency:** After major dependency upgrades or every 6 months  
**Last Validation:** 2026-02-15 (STACK_VALIDATION.md)
