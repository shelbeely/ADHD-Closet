# Twin Style - Code Examples and Patterns

## Overview

This document provides real code examples and patterns used throughout the Twin Style project. These examples demonstrate best practices, common patterns, and reusable code snippets.

## Table of Contents

1. [API Routes](#api-routes)
2. [React Components](#react-components)
3. [Prisma Database Queries](#prisma-database-queries)
4. [AI Integration](#ai-integration)
5. [Utility Functions](#utility-functions)
6. [TypeScript Types](#typescript-types)
7. [Hooks](#custom-hooks)
8. [Error Handling](#error-handling)

---

## API Routes

### Basic CRUD Route Pattern

```typescript
// app/app/api/items/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// Validation schema
const createItemSchema = z.object({
  title: z.string().optional(),
  category: z.enum(['tops', 'bottoms', 'dresses', 'outerwear']).optional(),
  state: z.enum(['available', 'laundry', 'unavailable', 'donate']).default('available'),
  brand: z.string().optional(),
  sizeText: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// GET /api/items - List all items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const state = searchParams.get('state');
    
    const items = await prisma.item.findMany({
      where: {
        ...(category && { category: category as any }),
        ...(state && { state: state as any }),
      },
      include: {
        images: {
          where: { kind: 'ai_catalog' },
          take: 1,
        },
        tags: {
          include: { tag: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
    
    return NextResponse.json({
      items,
      total: items.length,
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch items' } },
      { status: 500 }
    );
  }
}

// POST /api/items - Create new item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createItemSchema.parse(body);
    
    // Handle tags separately
    const { tags, ...itemData } = data;
    
    const item = await prisma.item.create({
      data: {
        ...itemData,
        ...(tags && {
          tags: {
            create: tags.map(tagName => ({
              tag: {
                connectOrCreate: {
                  where: { name: tagName },
                  create: { name: tagName },
                },
              },
            })),
          },
        }),
      },
      include: {
        images: true,
        tags: { include: { tag: true } },
      },
    });
    
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: error.message, details: error.errors } },
        { status: 400 }
      );
    }
    console.error('Error creating item:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to create item' } },
      { status: 500 }
    );
  }
}
```

### File Upload Route

```typescript
// app/app/api/items/[id]/images/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';
import { prisma } from '@/lib/prisma';
import { queue } from '@/lib/queue';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const itemId = params.id;
    
    // Verify item exists
    const item = await prisma.item.findUnique({ where: { id: itemId } });
    if (!item) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Item not found' } },
        { status: 404 }
      );
    }
    
    // Parse multipart form
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const kind = formData.get('kind') as string;
    
    if (!file) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'No file provided' } },
        { status: 400 }
      );
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: { code: 'INVALID_FILE_TYPE', message: 'File must be an image' } },
        { status: 400 }
      );
    }
    
    // Create directory structure
    const dataDir = process.env.DATA_DIR || './data';
    const imagesDir = join(dataDir, 'images', itemId);
    await mkdir(imagesDir, { recursive: true });
    
    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Get image dimensions
    const metadata = await sharp(buffer).metadata();
    
    // Generate unique filename
    const imageId = crypto.randomUUID();
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `${imageId}.${ext}`;
    const filepath = join(imagesDir, filename);
    
    // Save original image
    await writeFile(filepath, buffer);
    
    // Create database record
    const image = await prisma.imageAsset.create({
      data: {
        id: imageId,
        itemId,
        kind: kind as any,
        filePath: `images/${itemId}/${filename}`,
        width: metadata.width,
        height: metadata.height,
        mimeType: file.type,
      },
    });
    
    // Enqueue AI jobs for processing
    const jobs = [];
    if (kind === 'original_main' || kind === 'original_back') {
      jobs.push(
        queue.add('generate_catalog_image', {
          itemId,
          imageId,
          imagePath: filepath,
        })
      );
    }
    
    if (kind === 'original_main') {
      jobs.push(
        queue.add('infer_item', {
          itemId,
          imageIds: [imageId],
        })
      );
    }
    
    return NextResponse.json({
      image,
      aiJobs: jobs.map(job => ({
        id: job.id,
        type: job.name,
        status: 'queued',
      })),
    }, { status: 201 });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to upload image' } },
      { status: 500 }
    );
  }
}
```

---

## React Components

### Basic Item Card Component

```typescript
// app/app/components/ItemCard.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Item, ImageAsset, ItemTag, Tag } from '@prisma/client';

interface ItemCardProps {
  item: Item & {
    images: ImageAsset[];
    tags: (ItemTag & { tag: Tag })[];
  };
  onStateChange?: (itemId: string, newState: string) => void;
}

/**
 * ItemCard displays a single wardrobe item with image, title, and quick actions.
 * 
 * ADHD-optimized:
 * - Large touch target (min 48x48dp)
 * - Clear visual hierarchy
 * - Quick state change without navigation
 * - Immediate visual feedback
 */
export default function ItemCard({ item, onStateChange }: ItemCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Get catalog image or first available image
  const displayImage = item.images.find(img => img.kind === 'ai_catalog') || item.images[0];
  
  const handleStateChange = async (newState: string) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/items/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: newState }),
      });
      
      if (!response.ok) throw new Error('Failed to update state');
      
      onStateChange?.(item.id, newState);
    } catch (error) {
      console.error('Error updating state:', error);
      alert('Failed to update item state');
    } finally {
      setIsUpdating(false);
    }
  };
  
  return (
    <div className="
      bg-surface text-on-surface
      rounded-3xl
      shadow-elevation-1
      overflow-hidden
      hover:shadow-elevation-2
      transition-all duration-200
    ">
      {/* Image */}
      <Link href={`/items/${item.id}`} className="block">
        <div className="aspect-square relative bg-surface-variant">
          {displayImage ? (
            <Image
              src={`/api/images/${displayImage.id}`}
              alt={item.title || 'Item'}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-on-surface-variant">
              No Image
            </div>
          )}
        </div>
      </Link>
      
      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <Link href={`/items/${item.id}`}>
          <h3 className="text-title-medium font-medium line-clamp-2 hover:text-primary">
            {item.title || 'Untitled Item'}
          </h3>
        </Link>
        
        {/* Category & Brand */}
        <div className="text-body-small text-on-surface-variant">
          {item.category && (
            <span className="capitalize">{item.category.replace('_', ' ')}</span>
          )}
          {item.brand && (
            <span> • {item.brand}</span>
          )}
        </div>
        
        {/* Tags */}
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {item.tags.slice(0, 3).map(({ tag }) => (
              <span
                key={tag.id}
                className="
                  px-2 py-1
                  rounded-full
                  bg-secondary-container text-on-secondary-container
                  text-label-small
                "
              >
                {tag.name}
              </span>
            ))}
            {item.tags.length > 3 && (
              <span className="text-label-small text-on-surface-variant">
                +{item.tags.length - 3} more
              </span>
            )}
          </div>
        )}
        
        {/* State Quick Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => handleStateChange('laundry')}
            disabled={isUpdating || item.state === 'laundry'}
            className="
              flex-1
              px-3 py-2
              rounded-xl
              border-2 border-outline
              text-label-medium
              hover:bg-surface-variant
              disabled:opacity-50
              transition-colors
              min-h-[40px]
            "
          >
            🧺 Laundry
          </button>
          <button
            onClick={() => handleStateChange('available')}
            disabled={isUpdating || item.state === 'available'}
            className="
              flex-1
              px-3 py-2
              rounded-xl
              border-2 border-outline
              text-label-medium
              hover:bg-surface-variant
              disabled:opacity-50
              transition-colors
              min-h-[40px]
            "
          >
            ✅ Available
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Custom Hook Example

```typescript
// app/app/lib/hooks/useItem.ts
import { useState, useEffect } from 'react';
import type { Item, ImageAsset, ItemTag, Tag } from '@prisma/client';

type ItemWithRelations = Item & {
  images: ImageAsset[];
  tags: (ItemTag & { tag: Tag })[];
};

interface UseItemResult {
  item: ItemWithRelations | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  updateItem: (data: Partial<Item>) => Promise<void>;
}

/**
 * Custom hook for fetching and managing a single item.
 * Provides loading states, error handling, and update functionality.
 */
export function useItem(itemId: string): UseItemResult {
  const [item, setItem] = useState<ItemWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchItem = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/items/${itemId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch item: ${response.statusText}`);
      }
      
      const data = await response.json();
      setItem(data.item);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching item:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const updateItem = async (data: Partial<Item>) => {
    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update item: ${response.statusText}`);
      }
      
      const updated = await response.json();
      setItem(updated.item);
    } catch (err) {
      setError(err as Error);
      console.error('Error updating item:', err);
      throw err;
    }
  };
  
  useEffect(() => {
    fetchItem();
  }, [itemId]);
  
  return {
    item,
    loading,
    error,
    refresh: fetchItem,
    updateItem,
  };
}
```

---

## Prisma Database Queries

### Complex Queries with Relations

```typescript
// Fetch items with filtered relations
const items = await prisma.item.findMany({
  where: {
    state: 'available',
    category: 'tops',
    tags: {
      some: {
        tag: {
          name: {
            in: ['goth', 'favorite'],
          },
        },
      },
    },
  },
  include: {
    images: {
      where: {
        kind: {
          in: ['ai_catalog', 'thumbnail'],
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    },
    tags: {
      include: {
        tag: true,
      },
    },
  },
  orderBy: {
    updatedAt: 'desc',
  },
  take: 20,
  skip: 0,
});
```

### Transaction Example

```typescript
// Create item with images and tags in a transaction
const item = await prisma.$transaction(async (tx) => {
  // Create item
  const newItem = await tx.item.create({
    data: {
      title: 'Black T-shirt',
      category: 'tops',
      state: 'available',
    },
  });
  
  // Create image
  await tx.imageAsset.create({
    data: {
      itemId: newItem.id,
      kind: 'original_main',
      filePath: `images/${newItem.id}/main.jpg`,
      width: 1024,
      height: 1024,
      mimeType: 'image/jpeg',
    },
  });
  
  // Create or connect tags
  await tx.itemTag.createMany({
    data: [
      {
        itemId: newItem.id,
        tagId: gothTagId,
      },
      {
        itemId: newItem.id,
        tagId: favoriteTagId,
      },
    ],
  });
  
  // Return item with relations
  return tx.item.findUnique({
    where: { id: newItem.id },
    include: {
      images: true,
      tags: { include: { tag: true } },
    },
  });
});
```

### Aggregation Queries

```typescript
// Get statistics
const stats = await prisma.item.groupBy({
  by: ['category', 'state'],
  _count: {
    id: true,
  },
  orderBy: {
    _count: {
      id: 'desc',
    },
  },
});

// Get most worn items
const mostWorn = await prisma.item.findMany({
  where: {
    currentWears: {
      gt: 0,
    },
  },
  orderBy: {
    currentWears: 'desc',
  },
  take: 10,
  select: {
    id: true,
    title: true,
    currentWears: true,
    lastWornDate: true,
    images: {
      where: { kind: 'ai_catalog' },
      take: 1,
    },
  },
});
```

---

## AI Integration

### OpenRouter API Call

```typescript
// app/app/lib/ai/openrouter.ts
interface OpenRouterRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string | Array<{ type: string; [key: string]: any }>;
  }>;
  max_tokens?: number;
  temperature?: number;
}

export async function callOpenRouter(request: OpenRouterRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY not configured');
  }
  
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.PUBLIC_BASE_URL || 'http://localhost:3000',
      'X-Title': 'Twin Style',
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} ${error}`);
  }
  
  return response.json();
}

// Vision analysis example
export async function analyzeItemImage(imagePath: string) {
  const imageBuffer = await readFile(imagePath);
  const base64Image = imageBuffer.toString('base64');
  const mimeType = 'image/jpeg';
  
  const response = await callOpenRouter({
    model: process.env.OPENROUTER_VISION_MODEL || 'google/gemini-2.0-flash-exp:free',
    messages: [
      {
        role: 'system',
        content: 'You are an expert fashion analyst specializing in emo/goth/alt aesthetics.',
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Analyze this clothing item and return JSON with: category, colors, colorPalette (hex codes), pattern, attributes, tags, confidence',
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${base64Image}`,
            },
          },
        ],
      },
    ],
    max_tokens: 1000,
    temperature: 0.3,
  });
  
  const content = response.choices[0].message.content;
  return JSON.parse(content);
}
```

### BullMQ Worker Example

```typescript
// app/app/lib/ai/worker.ts
import { Worker, Job } from 'bullmq';
import { redis } from '@/lib/redis';
import { prisma } from '@/lib/prisma';
import { analyzeItemImage, generateCatalogImage } from './openrouter';

const worker = new Worker(
  'ai-jobs',
  async (job: Job) => {
    console.log(`Processing job ${job.id}: ${job.name}`);
    
    try {
      switch (job.name) {
        case 'infer_item':
          return await processInferItem(job);
        case 'generate_catalog_image':
          return await processGenerateCatalog(job);
        default:
          throw new Error(`Unknown job type: ${job.name}`);
      }
    } catch (error) {
      console.error(`Job ${job.id} failed:`, error);
      throw error;
    }
  },
  {
    connection: redis,
    concurrency: 3,
    limiter: {
      max: 10,
      duration: 60000, // 10 jobs per minute
    },
    settings: {
      maxStalledCount: 2,
      stalledInterval: 30000,
    },
  }
);

async function processInferItem(job: Job) {
  const { itemId, imageIds } = job.data;
  
  // Update job status in database
  await prisma.aIJob.create({
    data: {
      type: 'infer_item',
      status: 'running',
      itemId,
      inputRefs: { imageIds },
    },
  });
  
  // Get image paths
  const images = await prisma.imageAsset.findMany({
    where: { id: { in: imageIds } },
  });
  
  const imagePath = images[0].filePath;
  
  // Call AI to analyze
  const result = await analyzeItemImage(imagePath);
  
  // Update item with inferred data
  await prisma.item.update({
    where: { id: itemId },
    data: {
      category: result.category,
      colorPalette: result.colorPalette,
      attributes: result.attributes,
      tags: {
        create: result.tags.map((tagName: string) => ({
          tag: {
            connectOrCreate: {
              where: { name: tagName },
              create: { name: tagName },
            },
          },
        })),
      },
    },
  });
  
  // Update job status
  await prisma.aIJob.updateMany({
    where: { itemId, type: 'infer_item', status: 'running' },
    data: {
      status: 'succeeded',
      outputJson: result,
      completedAt: new Date(),
    },
  });
  
  return result;
}

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});

export default worker;
```

---

## Utility Functions

### Image Processing

```typescript
// app/app/lib/utils/images.ts
import sharp from 'sharp';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function generateThumbnail(
  inputPath: string,
  itemId: string,
  imageId: string
): Promise<string> {
  const dataDir = process.env.DATA_DIR || './data';
  const thumbsDir = join(dataDir, 'thumbs', itemId);
  await mkdir(thumbsDir, { recursive: true });
  
  const outputPath = join(thumbsDir, `${imageId}.webp`);
  
  await sharp(inputPath)
    .resize(512, 512, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: 85 })
    .toFile(outputPath);
  
  return `thumbs/${itemId}/${imageId}.webp`;
}

export async function optimizeImage(
  buffer: Buffer,
  maxWidth: number = 2048
): Promise<Buffer> {
  return sharp(buffer)
    .resize(maxWidth, maxWidth, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({ quality: 90, progressive: true })
    .toBuffer();
}
```

### Date Formatting

```typescript
// app/app/lib/utils/dates.ts
export function formatRelativeDate(date: Date | string): string {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

export function formatTimeEstimate(seconds: number): string {
  if (seconds < 60) return `~${seconds} seconds`;
  const minutes = Math.ceil(seconds / 60);
  return `~${minutes} minute${minutes !== 1 ? 's' : ''}`;
}
```

---

## TypeScript Types

### Common Type Definitions

```typescript
// app/app/lib/types.ts
import type { Item, ImageAsset, ItemTag, Tag, Outfit, OutfitItem } from '@prisma/client';

// Extended types with relations
export type ItemWithImages = Item & {
  images: ImageAsset[];
};

export type ItemWithTags = Item & {
  tags: (ItemTag & { tag: Tag })[];
};

export type ItemComplete = Item & {
  images: ImageAsset[];
  tags: (ItemTag & { tag: Tag })[];
};

export type OutfitComplete = Outfit & {
  items: (OutfitItem & {
    item: ItemComplete;
  })[];
};

// API Response types
export interface APIResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
}

// Constraint types
export interface OutfitConstraints {
  weather?: 'hot' | 'warm' | 'cool' | 'cold' | 'rain' | 'snow';
  vibe?: 'dysphoria_safe' | 'confidence_boost' | 'dopamine' | 'neutral';
  occasion?: string;
  timeAvailable?: 'quick' | 'normal';
}

// Filter types
export interface ItemFilters {
  category?: string[];
  state?: string[];
  tags?: string[];
  search?: string;
  colors?: string[];
  brand?: string;
}
```

---

## Error Handling

### Centralized Error Handler

```typescript
// app/app/lib/utils/errors.ts
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super('VALIDATION_ERROR', message, 400, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super('NOT_FOUND', `${resource} not found`, 404);
    this.name = 'NotFoundError';
  }
}

export function handleAPIError(error: unknown): Response {
  if (error instanceof AppError) {
    return new Response(
      JSON.stringify({
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      }),
      {
        status: error.statusCode,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
  
  console.error('Unexpected error:', error);
  return new Response(
    JSON.stringify({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    }),
    {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
```

### Error Boundary Component

```typescript
// app/app/components/ErrorBoundary.tsx
'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error boundary caught:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-8 text-center">
            <h2 className="text-headline-medium text-error mb-4">
              Something went wrong
            </h2>
            <p className="text-body-medium text-on-surface-variant mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="
                px-6 py-3
                bg-primary text-on-primary
                rounded-full
                text-label-large font-medium
                hover:shadow-elevation-2
                transition-shadow
              "
            >
              Try Again
            </button>
          </div>
        )
      );
    }
    
    return this.props.children;
  }
}
```

---

## External Resources

- **Next.js Patterns**: https://nextjs.org/docs/app/building-your-application
- **Prisma Best Practices**: https://www.prisma.io/docs/guides/performance-and-optimization
- **React Patterns**: https://react.dev/learn/thinking-in-react
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/handbook/
- **Repository**: https://github.com/shelbeely/ADHD-Closet
- **Full Documentation**: https://shelbeely.github.io/ADHD-Closet/
