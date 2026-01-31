# Contributing to Wardrobe AI Closet

Thank you for your interest in contributing! This document outlines our standards and processes.

## Table of Contents
1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Setup](#development-setup)
4. [Code Standards](#code-standards)
5. [Component Structure](#component-structure)
6. [Testing Approach](#testing-approach)
7. [PR Process](#pr-process)
8. [Design System Rules](#design-system-rules)

---

## Code of Conduct

### Our Standards
- **Be respectful**: Value diverse perspectives and experiences
- **Be patient**: Especially with ADHD-related design decisions
- **Be constructive**: Provide actionable feedback
- **Be inclusive**: Use accessible language and design

### ADHD-First Philosophy
This app is designed FOR neurodivergent users BY understanding their needs. All contributions must:
- Reduce cognitive load
- Minimize friction
- Provide clear feedback
- Avoid decision paralysis
- Support time blindness

---

## Getting Started

### Prerequisites
- Node.js 20+ or Bun 1.0+
- PostgreSQL 14+
- Redis 7+
- Git
- Code editor (VS Code recommended)

### First Contribution Ideas
- Fix typos in documentation
- Add missing TypeScript types
- Improve error messages
- Add unit tests
- Optimize database queries
- Create new color themes

---

## Development Setup

### 1. Fork and Clone
```bash
git fork https://github.com/original/ADHD-Closet
git clone https://github.com/YOUR_USERNAME/ADHD-Closet
cd ADHD-Closet
```

### 2. Install Dependencies
```bash
cd app
bun install  # or npm install
```

### 3. Setup Environment
```bash
cp .env.example .env
# Edit .env with your values
```

### 4. Setup Database
```bash
# Start PostgreSQL and Redis
# (via Docker, system service, or locally)

# Run migrations
bunx prisma migrate dev

# Seed sample data (optional)
bunx prisma db seed
```

### 5. Run Dev Server
```bash
bun run dev
# Open http://localhost:3000
```

### 6. Create a Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-123
```

---

## Code Standards

### TypeScript
- **Use strict types**: No `any` unless absolutely necessary
- **Export interfaces**: Make types reusable
- **Document complex types**: Add JSDoc comments

#### Good:
```typescript
interface Item {
  id: string;
  title?: string;
  category: Category;
  state: ItemState;
}

async function getItem(id: string): Promise<Item> {
  // ...
}
```

#### Bad:
```typescript
function getItem(id: any): any {
  // ...
}
```

### React Components
- **Use functional components**: No class components
- **Use hooks appropriately**: Follow React hooks rules
- **Extract custom hooks**: Reuse stateful logic
- **Memoize expensive operations**: Use `useMemo`, `useCallback`

#### Good:
```typescript
'use client';

import { useState, useEffect } from 'react';

export default function ItemGrid({ items }: { items: Item[] }) {
  const [filtered, setFiltered] = useState<Item[]>(items);
  
  useEffect(() => {
    // Effect logic
  }, [items]);
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* ... */}
    </div>
  );
}
```

### Prisma & Database
- **Use transactions**: For multi-step database operations
- **Include relations wisely**: Only fetch what you need
- **Index frequently queried fields**: Add `@@index` directives
- **Use Zod for validation**: Validate inputs before database

#### Good:
```typescript
const item = await prisma.item.findUnique({
  where: { id },
  include: {
    images: {
      where: { kind: 'thumbnail' },
      take: 1,
    },
    tags: true,
  },
});
```

### API Routes
- **Use Zod schemas**: Validate request bodies
- **Return consistent errors**: Use error format from API_DOCUMENTATION.md
- **Include proper status codes**: 200, 201, 400, 404, 500
- **Document endpoints**: Update API_DOCUMENTATION.md

#### Good:
```typescript
import { z } from 'zod';

const createItemSchema = z.object({
  title: z.string().optional(),
  category: z.enum(['tops', 'bottoms', /* ... */]).optional(),
  state: z.enum(['available', 'laundry', 'unavailable', 'donate']),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createItemSchema.parse(body);
    
    const item = await prisma.item.create({ data });
    
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: error.message } },
        { status: 400 }
      );
    }
    // ...
  }
}
```

### File Naming
- **Components**: `PascalCase.tsx` (e.g., `ItemGrid.tsx`)
- **Utilities**: `camelCase.ts` (e.g., `formatDate.ts`)
- **API routes**: `route.ts` (Next.js convention)
- **Pages**: `page.tsx` (Next.js convention)

### Comments
- **Comment WHY, not WHAT**: Code should be self-explanatory
- **Document ADHD optimizations**: Explain UX decisions
- **Use JSDoc for public APIs**: Help IDE autocomplete

#### Good:
```typescript
// ADHD-optimized: Auto-save on blur to reduce "Did I save?" anxiety
<input onBlur={saveChanges} />

/**
 * Generates outfit suggestions with AI.
 * @param constraints - Weather, vibe, occasion filters
 * @returns Array of outfit suggestions (1-5 max to avoid overwhelm)
 */
```

---

## Component Structure

### Recommended Structure
```
app/
├── app/
│   ├── components/
│   │   ├── ItemCard.tsx         # Presentational
│   │   ├── ItemGrid.tsx         # Container
│   │   └── SearchBar.tsx
│   ├── lib/
│   │   ├── utils.ts             # Pure functions
│   │   ├── hooks/
│   │   │   └── useItems.ts      # Custom hooks
│   │   └── types.ts             # Shared types
│   ├── api/
│   │   └── items/
│   │       └── route.ts
│   └── items/
│       └── [id]/
│           └── page.tsx          # Pages
```

### Component Template
```typescript
'use client'; // If using hooks/state

import { useState } from 'react';

interface ComponentNameProps {
  // Props
}

/**
 * Brief description
 * 
 * Material Design 3 + ADHD-optimized:
 * - Design decision 1
 * - Design decision 2
 */
export default function ComponentName({ prop1, prop2 }: ComponentNameProps) {
  const [state, setState] = useState<Type>(initialValue);
  
  // Event handlers
  const handleAction = () => {
    // ...
  };
  
  return (
    <div className="...">
      {/* JSX */}
    </div>
  );
}
```

---

## Testing Approach

### Manual Testing (Current)
We currently rely on manual testing. When making changes:

1. **Test the happy path**: Normal user flow
2. **Test edge cases**: Empty states, errors, loading
3. **Test responsive design**: Mobile (<1024px) and desktop (≥1024px)
4. **Test accessibility**: Keyboard navigation, screen readers
5. **Test dark mode**: Switch themes and verify contrast

### Future: Automated Testing
We plan to add:
- **Unit tests**: Jest/Vitest for utilities and hooks
- **Integration tests**: Test API routes
- **E2E tests**: Playwright for user flows

Contributions adding tests are welcome!

---

## PR Process

### 1. Before Opening a PR
- [ ] Code follows style guidelines
- [ ] New code has comments explaining ADHD optimizations
- [ ] Manual testing completed
- [ ] Documentation updated (if needed)
- [ ] Branch is up to date with `main`

### 2. Open a PR
- **Title**: Clear, concise (e.g., "Add dark mode toggle to settings")
- **Description**: 
  - What changes were made
  - Why (reference issue if applicable)
  - How to test
  - Screenshots (for UI changes)

### 3. Code Review
- Address reviewer comments
- Push changes to the same branch
- Request re-review when ready

### 4. Merge
- Squash commits (keep history clean)
- Delete branch after merge

### PR Template
```markdown
## Description
Brief description of changes.

## Issue
Fixes #123

## Changes Made
- Added dark mode toggle
- Updated theme CSS variables
- Added localStorage persistence

## Testing
1. Go to Settings
2. Toggle between Light/Dark/Auto
3. Verify theme persists on page reload
4. Check all pages render correctly in both modes

## Screenshots
[Attach screenshots]

## Checklist
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] Manual testing completed
- [ ] Responsive design tested
- [ ] Accessibility tested
```

---

## Design System Rules

### Material Design 3 Compliance
All UI changes must follow M3 guidelines:

#### Colors
- Use color tokens from `globals.css`:
  - `bg-primary`, `text-on-primary`
  - `bg-secondary-container`, `text-on-secondary-container`
  - `bg-surface`, `text-on-surface`
- **Never use arbitrary colors**: Use theme tokens

#### Shapes
- **Rounded corners**: 16-28px (`rounded-2xl`, `rounded-3xl`)
- **Cards**: `rounded-3xl` with `shadow-elevation-1`
- **Buttons**: `rounded-full` for primary, `rounded-xl` for secondary

#### Typography
- Use typography classes: `text-headline-large`, `text-body-medium`, etc.
- **Hierarchy**: Display > Headline > Title > Body > Label

#### Elevation
- Use shadow utilities: `shadow-elevation-1` through `shadow-elevation-4`
- Higher elevation = more importance

### ADHD-Optimized UX Rules
Every design decision must prioritize ADHD users:

#### 1. Visual Hierarchy
- **One primary action per screen**: Make it unmissable
- **Secondary actions demoted**: Outlined or text buttons
- **Clear focal points**: Don't compete for attention

#### 2. Progressive Disclosure
- **Hide advanced options**: Behind "More" buttons
- **Show only essentials**: Reveal details on demand
- **No information overload**: Chunk content into cards

#### 3. Minimal Friction
- **Auto-save**: Don't make users remember to save
- **Smart defaults**: Pre-select common options
- **Skip optional fields**: Let users add details later

#### 4. Decision Paralysis Reducers
- **Limit choices**: 3-5 options max
- **Provide guidance**: Clear next steps
- **Quick picks**: Panic button for overwhelm

#### 5. Immediate Feedback
- **Show loading states**: Users know something is happening
- **Confirm actions**: Visual feedback for all interactions
- **Explain what's next**: "Redirecting in 3 seconds..."

#### 6. Time Blindness Support
- **Show time estimates**: "~30 seconds"
- **Progress indicators**: "Step 2 of 3"
- **Status visibility**: Processing/Done/Failed

#### 7. Memory Support
- **Breadcrumbs**: Always show where you are
- **Recent items**: Quick access to last viewed
- **Clear labels**: No ambiguous icons

#### 8. Error Handling
- **Forgiving**: Easy undo
- **Clear recovery**: Explain how to fix
- **No blame**: Never imply user failure

### Testing UX Changes
For every UX change, ask:
1. Does this reduce cognitive load?
2. Can a user complete this while distracted?
3. Is the next step obvious?
4. Can they easily undo a mistake?
5. Does it work in a low-focus state?

---

## Documentation Standards

When writing or updating documentation:

### Use Natural, Clear Language

Follow the humanizer guidelines in `.github/humanizer/README.md` to avoid AI-generated writing patterns:
- Use direct, simple language
- Replace "serves as" with "is", "boasts" with "has"
- Avoid AI vocabulary: "crucial", "pivotal", "testament", "landscape" (abstract), "showcase"
- Be specific instead of vague: cite actual sources, use concrete examples
- Skip promotional language: "nestled", "vibrant", "stunning"

### Good Example
```markdown
## Authentication

The app uses JWT tokens stored in localStorage. Tokens expire after 24 hours.
```

### Bad Example
```markdown
## Authentication

The authentication system serves as a crucial component that showcases 
industry-leading security practices, leveraging JWT tokens to foster a 
robust and secure user experience.
```

### Quick Check

Before submitting documentation changes:
```bash
# Check for AI vocabulary patterns
grep -i "crucial\|pivotal\|testament\|showcase\|serves as\|boasts" your-file.md
```

---

## Definition of Done

This checklist ensures features are production-ready before merging.

### A) Setup & DevEx
- [ ] `docker-compose up` starts Postgres + Redis successfully
- [ ] `pnpm install` works without manual steps
- [ ] `pnpm dev` starts the app and connects to database
- [ ] Prisma migrations run cleanly
- [ ] App boots with empty DB and shows usable UI

### B) Data Integrity
- [ ] Creating items writes DB records correctly
- [ ] Uploading images creates ImageAsset rows + files
- [ ] Deleting items is safe (soft delete, no orphans)
- [ ] Tagging works (many-to-many) without duplicates
- [ ] State transitions work correctly

### C) Mobile Mode (ADHD-first)
- [ ] Category tabs as primary navigation
- [ ] One-tap add item flow
- [ ] Progressive disclosure (basics first)
- [ ] Decision paralysis reducers (limited choices)
- [ ] Time estimates shown ("~30s to add item")

### D) Desktop Mode (Power tools)
- [ ] Bulk edit with multi-select
- [ ] Keyboard shortcuts working
- [ ] Analytics panel shows correct data

### E) AI Pipeline
- [ ] All OpenRouter calls server-side only
- [ ] Catalog images generate correctly
- [ ] Item inference extracts metadata
- [ ] Outfit generation works with constraints
- [ ] Job history tracks all operations

### F) Tests
- [ ] Unit tests pass for new features
- [ ] Integration tests cover critical paths
- [ ] Manual testing on mobile and desktop
- [ ] No console errors in production build

### G) Documentation
- [ ] User-facing features documented
- [ ] API changes reflected in docs
- [ ] README updated if needed
- [ ] No AI writing patterns

---

## Questions?

- **Design questions**: Reference `SPEC.md` sections 7.1-7.1.11
- **Architecture questions**: See `ARCHITECTURE.md`
- **Technical issues**: Check `TROUBLESHOOTING.md`
- **Documentation guidelines**: See `.github/humanizer/README.md`
- **Need help?**: Open a GitHub Discussion

Thank you for contributing! 💜
# Definition of Done (DoD) + Acceptance Checklist

This is the "ship it" checklist for Wardrobe AI Closet (v1). The goal is to make it impossible for the build to be “mostly done”.

---

## A) Setup & DevEx
- [ ] `docker-compose up` starts Postgres + Redis successfully
- [ ] `pnpm install` (or npm/yarn) works without manual steps
- [ ] `pnpm dev` starts the Next.js app and connects to Postgres
- [ ] Prisma migrations run cleanly: `prisma migrate dev` / `prisma migrate deploy`
- [ ] App boots with an empty DB and shows a usable UI (no crashes)

---

## B) Data Integrity
- [ ] Creating an Item writes a DB record with correct defaults
- [ ] Uploading images writes ImageAsset rows + files on disk
- [ ] Deleting an item is safe (soft delete preferred) and does not orphan files or rows
- [ ] Tagging works (many-to-many) without duplicates
- [ ] State transitions work (available/laundry/unavailable/donate)

---

## C) Mobile Mode (ADHD-first)
### Category-first browsing
- [ ] Mobile home shows category tabs/chips as primary navigation
- [ ] Each category view loads a grid of items using thumbnails
- [ ] Filters are accessible via a drawer and do not overwhelm the main view

### Add Item flow (one-tap)
- [ ] “Add Item” is one-tap from mobile home
- [ ] User can select camera or gallery
- [ ] Item is created immediately after upload starts (even before AI completes)
- [ ] The UI shows a clear “Processing…” state without blocking navigation

### Progressive disclosure
- [ ] Item detail shows “Basics” first (category, state, size, brand, colors)
- [ ] Advanced fields are collapsed by default

### Decision paralysis reducers
- [ ] Outfit generator starts with 2–3 quick constraint choices
- [ ] Results are limited to max 5 outfits
- [ ] “Panic pick” returns a single best outfit

### Time blindness support
- [ ] UI labels flows with estimated time (“~30s to add an item”)
- [ ] No multi-step wizard that forces completion before saving

---

## D) Desktop Mode (Power tools)
- [ ] Desktop layout provides persistent filters + results + inspector (or equivalent)
- [ ] Bulk edit table:
  - [ ] multi-select
  - [ ] apply category/state/tags
  - [ ] batch AI regeneration action
- [ ] Keyboard shortcuts:
  - [ ] `/` focus search
  - [ ] `g` open outfit generator
  - [ ] `e` edit selected item
  - [ ] `l` toggle laundry state
- [ ] Side-by-side compare for 2–4 items
- [ ] Drag/drop outfit builder with role slots (top/bottom/shoes/etc.)
- [ ] Analytics panel loads and shows correct counts by category and tags

---

## E) AI Pipeline (OpenRouter)
> All OpenRouter calls happen server-side. No client keys. All AI outputs are stored with model ID and raw response for reproducibility.

### E1) Catalog image generation (NO transparent cutouts)
- [ ] Uploading a main photo can enqueue `generate_catalog_image`
- [ ] Completed job creates an `ai_catalog` ImageAsset + stores file on disk
- [ ] Thumbnail is generated (Sharp) and stored as `thumbnail` ImageAsset
- [ ] Output image is:
  - [ ] square
  - [ ] centered garment with consistent padding
  - [ ] neutral background
  - [ ] no added text/watermarks
  - [ ] preserves garment colors and graphic detail
- [ ] Failures retry with backoff
- [ ] After retries, job can be marked `needs_review`
- [ ] UI shows before/after and allows Accept/Retry (Retry triggers new job)

### E2) Item inference + label extraction
- [ ] Inference produces structured JSON including:
  - [ ] category (enum, required)
  - [ ] colors/palette
  - [ ] pattern
  - [ ] relevant attributes
  - [ ] emo/goth/alt tags
- [ ] If label photos exist, attempt OCR extraction for size/brand/materials (best-effort)
- [ ] UI shows suggestions with confidence and allows user override

### E3) Outfit generation
- [ ] Generator uses only `available` items
- [ ] Outputs 1–5 outfits with item IDs + roles + explanation
- [ ] User can save outfit and rate it up/down
- [ ] Next generation reflects ratings via simple re-ranking (no fake ML)

---

## F) Three.js Closet Rail (Hanging Cards)
- [ ] Closet rail view uses thumbnails of **AI catalog images**
- [ ] Texture loading is lazy and does not freeze UI
- [ ] Scroll performance is smooth on your devices
- [ ] Search highlights matching cards
- [ ] Drag from rail to outfit builder works on desktop

---

## G) Export / Import
### Export ZIP
- [ ] Export endpoint produces a ZIP containing:
  - [ ] `manifest.json` (app + schema versions)
  - [ ] `export.json` (full data)
  - [ ] `items.csv`
  - [ ] `outfits.csv`
  - [ ] images directory with originals + ai_catalog + thumbs
- [ ] ZIP export restores perfectly after import

### Import ZIP
- [ ] Import validates manifest/schema versions
- [ ] Restores DB records and files to correct locations
- [ ] Handles conflicts safely (fresh install import is the main path)
- [ ] After import, UI loads full closet without errors

---

## H) Security & Privacy
- [ ] OpenRouter key never shipped to client
- [ ] Upload endpoints enforce reasonable file size limits
- [ ] Only images in DATA_DIR are served; no arbitrary file reads
- [ ] App includes an “AI processing sends images to providers” disclosure and toggle
- [ ] If toggle off, app still works (manual categories, no AI jobs)

---

## I) Performance
- [ ] Lists are paginated or virtualized
- [ ] Thumbnails are used in grids and 3D textures (never full-res originals)
- [ ] Background jobs do not block UI requests
- [ ] Three.js view has guardrails for low memory (texture size cap, LOD)

---

## J) “It feels done” checks
- [ ] No dead ends or empty screens without helpful copy
- [ ] No fake data or placeholder demo content
- [ ] Errors are human-readable and actionable
- [ ] The app is stable when adding 50+ items

