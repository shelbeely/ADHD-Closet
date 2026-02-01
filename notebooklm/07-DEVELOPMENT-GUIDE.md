# Twin Style - Development Guide

## Quick Start

### Prerequisites

- **Runtime**: Bun ≥1.0.0 (recommended) or Node.js ≥20
- **Database**: PostgreSQL ≥14
- **Cache/Queue**: Redis ≥7
- **Container**: Docker + Docker Compose (recommended)
- **AI**: OpenRouter API key

### Installation Steps

```bash
# 1. Clone repository
git clone https://github.com/shelbeely/ADHD-Closet.git
cd ADHD-Closet

# 2. Start database services
docker compose up -d

# 3. Navigate to app directory
cd app

# 4. Copy environment template
cp .env.example .env
# Edit .env and add OPENROUTER_API_KEY

# 5. Install dependencies
bun install  # or: npm install

# 6. Run database migrations
npx prisma migrate dev

# 7. Generate Prisma Client (REQUIRED)
npm run prisma:generate

# 8. Start development server
bun dev  # or: npm run dev
```

Visit http://localhost:3000 🎉

### Verification Steps

```bash
# Check Docker services are running
docker ps
# Should show: wardrobe-postgres and wardrobe-redis

# Verify PostgreSQL
docker exec wardrobe-postgres pg_isready -U wardrobe
# Should return: "accepting connections"

# Verify Redis
docker exec wardrobe-redis redis-cli ping
# Should return: PONG

# Check dev server
curl http://localhost:3000/api/items
# Should return: {"items":[],"total":0}
```

## Project Structure

```
/home/runner/work/ADHD-Closet/ADHD-Closet/
├── .github/
│   ├── agents/                       # Custom AI agent definitions
│   ├── humanizer/                    # Documentation humanization
│   ├── skills/                       # Reusable AI skills
│   └── workflows/                    # CI/CD workflows
├── app/                              # Main Next.js application
│   ├── app/
│   │   ├── api/                      # API routes (REST)
│   │   │   ├── items/                # Item CRUD
│   │   │   ├── outfits/              # Outfit management
│   │   │   ├── ai/                   # AI job management
│   │   │   ├── images/               # Image processing
│   │   │   ├── vision/               # Vision AI
│   │   │   ├── nfc/                  # NFC tag management
│   │   │   ├── export/               # Data export
│   │   │   └── import/               # Data import
│   │   ├── components/               # React components
│   │   ├── lib/                      # Utilities
│   │   │   ├── ai/                   # AI helpers
│   │   │   ├── hooks/                # Custom React hooks
│   │   │   ├── prisma.ts             # Prisma client
│   │   │   ├── queue.ts              # BullMQ setup
│   │   │   └── redis.ts              # Redis client
│   │   ├── (routes)/                 # Page routes
│   │   ├── globals.css               # Global styles
│   │   └── layout.tsx                # Root layout
│   ├── prisma/
│   │   ├── schema.prisma             # Database schema
│   │   └── migrations/               # DB migrations
│   ├── public/                       # Static assets
│   ├── data/                         # Runtime storage
│   │   ├── images/                   # Item images
│   │   └── thumbs/                   # Thumbnails
│   ├── .env.example                  # Environment template
│   ├── next.config.ts                # Next.js config
│   ├── tailwind.config.ts            # Tailwind config
│   ├── tsconfig.json                 # TypeScript config
│   └── package.json                  # Dependencies
├── docs/                             # Documentation
│   ├── api/                          # API docs
│   ├── developer/                    # Technical docs
│   ├── features/                     # Feature docs
│   ├── deployment/                   # Deployment guides
│   └── user-guides/                  # User guides
├── docker-compose.yml                # PostgreSQL + Redis
├── mkdocs.yml                        # MkDocs config
└── README.md                         # Project overview
```

**Key Directories**:
- `app/app/api/*/route.ts`: API endpoints
- `app/app/components/`: React components
- `app/app/lib/`: Shared utilities
- `app/prisma/`: Database schema and migrations
- `docs/`: Project documentation

## Development Workflow

### Starting Development

```bash
# Start services
cd /path/to/ADHD-Closet
docker compose up -d

# Start dev server (from app directory)
cd app
bun dev

# Open in browser
open http://localhost:3000
```

### Making Changes

**1. Database Schema Changes**:
```bash
# Edit app/prisma/schema.prisma

# Create migration
npx prisma migrate dev --name add_new_field

# ALWAYS regenerate Prisma Client
npm run prisma:generate
```

**2. API Route Changes**:
```bash
# Edit app/app/api/[route]/route.ts

# Test with curl
curl http://localhost:3000/api/items
```

**3. Component Changes**:
```bash
# Edit app/app/components/YourComponent.tsx

# Hot reload updates automatically
# Check browser for changes
```

**4. Style Changes**:
```bash
# Edit app/app/globals.css or component styles

# Tailwind hot reload updates automatically
```

### Testing Changes

**Manual Testing Checklist**:
- [ ] Test on mobile viewport (<1024px)
- [ ] Test on desktop viewport (≥1024px)
- [ ] Test in light mode
- [ ] Test in dark mode
- [ ] Test keyboard navigation
- [ ] Test with screen reader (optional)
- [ ] Verify loading states
- [ ] Verify error states
- [ ] Check console for errors

**Automated Testing** (future):
```bash
# Unit tests (planned)
npm test

# E2E tests (planned)
npm run test:e2e
```

### Linting

```bash
# Run ESLint
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

### Building

```bash
# Production build
npm run build

# Test production build locally
npm start
# Visit http://localhost:3000
```

## Code Standards

### TypeScript

**Always use strict types**:
```typescript
// ✅ Good
interface Item {
  id: string;
  title?: string;
  category: Category;
}

async function getItem(id: string): Promise<Item> {
  return await prisma.item.findUnique({ where: { id } });
}

// ❌ Bad
function getItem(id: any): any {
  return prisma.item.findUnique({ where: { id } });
}
```

**Export interfaces for reusability**:
```typescript
// lib/types.ts
export interface ItemWithImages extends Item {
  images: ImageAsset[];
  tags: ItemTag[];
}
```

### React Components

**Use functional components with hooks**:
```typescript
'use client';

import { useState, useEffect } from 'react';

interface Props {
  itemId: string;
}

export default function ItemDetail({ itemId }: Props) {
  const [item, setItem] = useState<Item | null>(null);
  
  useEffect(() => {
    fetchItem(itemId).then(setItem);
  }, [itemId]);
  
  return (
    <div className="p-4">
      {item && <h1>{item.title}</h1>}
    </div>
  );
}
```

**Extract custom hooks**:
```typescript
// lib/hooks/useItem.ts
export function useItem(id: string) {
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchItem(id)
      .then(setItem)
      .finally(() => setLoading(false));
  }, [id]);
  
  return { item, loading };
}

// Component usage
const { item, loading } = useItem(itemId);
```

### API Routes

**Use Zod for validation**:
```typescript
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

const createItemSchema = z.object({
  title: z.string().optional(),
  category: z.enum(['tops', 'bottoms', 'dresses']).optional(),
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
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Server error' } },
      { status: 500 }
    );
  }
}
```

**Return consistent errors**:
```typescript
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {}  // Optional
  }
}
```

### Prisma Best Practices

**Use transactions for multi-step operations**:
```typescript
await prisma.$transaction(async (tx) => {
  const item = await tx.item.create({ data: itemData });
  await tx.imageAsset.create({ data: { itemId: item.id, ...imageData } });
  return item;
});
```

**Only include needed relations**:
```typescript
// ✅ Good - specific includes
const item = await prisma.item.findUnique({
  where: { id },
  include: {
    images: {
      where: { kind: 'ai_catalog' },
      take: 1,
    },
  },
});

// ❌ Bad - includes everything
const item = await prisma.item.findUnique({
  where: { id },
  include: {
    images: true,
    tags: true,
    outfitItems: true,
    aiJobs: true,
  },
});
```

**Always regenerate after schema changes**:
```bash
# After editing schema.prisma
npm run prisma:generate
```

### Styling with Tailwind

**Use Material Design 3 tokens**:
```html
<!-- ✅ Good -->
<div class="bg-surface text-on-surface rounded-3xl shadow-elevation-1">

<!-- ❌ Bad - arbitrary colors -->
<div class="bg-gray-100 text-gray-900 rounded-xl shadow-md">
```

**Responsive design**:
```html
<div class="
  grid grid-cols-2 gap-4
  md:grid-cols-4 md:gap-6
">
```

### Comments

**Comment WHY, not WHAT**:
```typescript
// ✅ Good
// ADHD-optimized: Auto-save on blur to reduce "Did I save?" anxiety
<input onBlur={saveChanges} />

// ❌ Bad
// Saves changes when input loses focus
<input onBlur={saveChanges} />
```

**Use JSDoc for public APIs**:
```typescript
/**
 * Generates outfit suggestions with AI.
 * @param constraints - Weather, vibe, occasion filters
 * @returns Array of outfit suggestions (1-5 max to avoid overwhelm)
 */
export async function generateOutfits(
  constraints: OutfitConstraints
): Promise<Outfit[]> {
  // Implementation
}
```

## Common Tasks

### Adding a New API Endpoint

```bash
# 1. Create route file
touch app/app/api/new-endpoint/route.ts

# 2. Implement handler
# app/app/api/new-endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'Hello' });
}

# 3. Test
curl http://localhost:3000/api/new-endpoint

# 4. Update API documentation
# docs/api/API_DOCUMENTATION.md
```

### Adding a New Database Model

```bash
# 1. Edit schema
# app/prisma/schema.prisma
model NewModel {
  id        String   @id @default(uuid())
  name      String
  createdAt DateTime @default(now())
  
  @@map("new_models")
}

# 2. Create migration
npx prisma migrate dev --name add_new_model

# 3. Generate Prisma Client
npm run prisma:generate

# 4. Use in code
const newItem = await prisma.newModel.create({
  data: { name: 'Test' }
});
```

### Adding a New Component

```bash
# 1. Create component file
touch app/app/components/NewComponent.tsx

# 2. Implement component
# app/app/components/NewComponent.tsx
'use client';

interface Props {
  title: string;
}

export default function NewComponent({ title }: Props) {
  return (
    <div className="bg-surface p-4 rounded-3xl">
      <h2 className="text-headline-medium">{title}</h2>
    </div>
  );
}

# 3. Use in page
import NewComponent from '@/components/NewComponent';

<NewComponent title="Hello" />
```

### Adding Environment Variables

```bash
# 1. Add to .env
NEW_VARIABLE=value

# 2. Add to .env.example
NEW_VARIABLE=your-value-here

# 3. Use in code (server-side only)
const value = process.env.NEW_VARIABLE;
```

## Debugging

### Database Issues

```bash
# Check connection
docker exec wardrobe-postgres pg_isready -U wardrobe

# View logs
docker logs wardrobe-postgres

# Connect to database
docker exec -it wardrobe-postgres psql -U wardrobe -d wardrobe_closet

# View tables
\dt

# Query items
SELECT * FROM items LIMIT 5;
```

### Redis Issues

```bash
# Check connection
docker exec wardrobe-redis redis-cli ping

# View logs
docker logs wardrobe-redis

# Connect to Redis
docker exec -it wardrobe-redis redis-cli

# View queue jobs
KEYS bull:ai-jobs:*
```

### Prisma Client Issues

```bash
# Regenerate client
npm run prisma:generate

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# View studio GUI
npm run prisma:studio
# Opens http://localhost:5555
```

### Build Issues

```bash
# Clear cache
rm -rf .next
rm -rf node_modules
bun install  # or npm install

# Rebuild
npm run build
```

## Deployment

### Environment Setup

```bash
# Production .env
NODE_ENV=production
DATABASE_URL="postgresql://user:pass@host:5432/db"
REDIS_URL="redis://host:6379"
OPENROUTER_API_KEY="sk-..."
PUBLIC_BASE_URL="https://yourdomain.com"
```

### Building for Production

```bash
# Build
npm run build

# Start production server
npm start
```

### Docker Deployment

```bash
# Build Docker image
docker build -t wardrobe-ai-closet .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="..." \
  -e REDIS_URL="..." \
  -e OPENROUTER_API_KEY="..." \
  wardrobe-ai-closet
```

### Native Mobile Apps

```bash
# Build web app
npm run build

# Initialize Capacitor
npm run cap:init

# Add platforms
npm run cap:add:ios
npm run cap:add:android

# Sync assets
npm run cap:sync

# Open in IDE
npm run cap:open:ios    # Xcode
npm run cap:open:android # Android Studio

# Build and run
npm run cap:run:ios
npm run cap:run:android
```

## Troubleshooting

### "Cannot find module 'prisma/client'"

```bash
# Run Prisma generate
npm run prisma:generate
```

### "Connection refused" on database

```bash
# Check Docker services
docker compose ps

# Restart services
docker compose restart postgres
```

### Bun crashes in VM

See `app/BUN_SETUP.md` for workarounds. Use npm as fallback:
```bash
npm install
npm run dev
```

### Type errors after schema change

```bash
# Regenerate Prisma Client
npm run prisma:generate

# Restart TypeScript server in IDE
```

## Resources

- **Documentation**: https://shelbeely.github.io/ADHD-Closet/
- **Repository**: https://github.com/shelbeely/ADHD-Closet
- **Contributing Guide**: https://github.com/shelbeely/ADHD-Closet/blob/main/CONTRIBUTING.md
- **API Reference**: https://shelbeely.github.io/ADHD-Closet/api/API_DOCUMENTATION/
- **Architecture**: https://shelbeely.github.io/ADHD-Closet/developer/ARCHITECTURE/

## Getting Help

- **GitHub Issues**: https://github.com/shelbeely/ADHD-Closet/issues
- **GitHub Discussions**: https://github.com/shelbeely/ADHD-Closet/discussions
- **Documentation**: https://shelbeely.github.io/ADHD-Closet/

## Contributing

See [CONTRIBUTING.md](https://github.com/shelbeely/ADHD-Closet/blob/main/CONTRIBUTING.md) for:
- Code standards
- PR process
- Testing requirements
- Design principles
- Documentation guidelines
