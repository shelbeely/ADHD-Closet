import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

// Validation schema for creating/updating items
const createItemSchema = z.object({
  title: z.string().optional(),
  category: z.enum([
    'tops',
    'bottoms',
    'dresses',
    'outerwear',
    'shoes',
    'accessories',
    'underwear_bras',
    'jewelry',
  ]).optional(),
  state: z.enum(['available', 'laundry', 'unavailable', 'donate']).optional(),
  brand: z.string().optional(),
  sizeText: z.string().optional(),
  materials: z.string().optional(),
  colorPalette: z.array(z.string()).optional(),
  attributes: z.record(z.string(), z.any()).optional(),
  tags: z.array(z.string()).optional(),
  cleanStatus: z.enum(['clean', 'dirty', 'needs_wash']).optional(),
  wearsBeforeWash: z.number().int().min(1).optional(),
  currentWears: z.number().int().min(0).optional(),
  lastWornDate: z.string().datetime().optional(),
  lastWashedDate: z.string().datetime().optional(),
  storageType: z.enum(['hanging', 'folded', 'drawer', 'shelf', 'box', 'other']).optional(),
  locationInCloset: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

// GET /api/items - List items with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '30');
    const category = searchParams.get('category');
    const state = searchParams.get('state');
    const cleanStatus = searchParams.get('cleanStatus');
    const tag = searchParams.get('tag');
    const q = searchParams.get('q'); // search query

    // Build where clause
    const where: any = {};
    
    if (category) {
      where.category = category;
    }
    
    if (state) {
      where.state = state;
    }
    
    if (cleanStatus) {
      where.cleanStatus = cleanStatus;
    }
    
    if (tag) {
      where.tags = {
        some: {
          tag: {
            name: tag,
          },
        },
      };
    }
    
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { brand: { contains: q, mode: 'insensitive' } },
        { tags: { some: { tag: { name: { contains: q, mode: 'insensitive' } } } } },
      ];
    }

    // Get total count for pagination
    const total = await prisma.item.count({ where });

    // Get paginated items with relations
    const items = await prisma.item.findMany({
      where,
      include: {
        images: {
          where: {
            kind: {
              in: ['ai_catalog', 'thumbnail', 'original_main'],
            },
          },
          orderBy: {
            kind: 'asc', // ai_catalog first, then thumbnail, then original_main
          },
          take: 1, // Just get the best image for listing
        },
        tags: {
          include: {
            tag: true,
          },
        },
        _count: {
          select: {
            images: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return NextResponse.json({
      items: items.map((item: any) => ({
        ...item,
        tags: item.tags.map((t: any) => t.tag),
        imageCount: item._count.images,
      })),
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
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
    const validated = createItemSchema.parse(body);

    // Extract tags if provided
    const { tags: tagNames, colorPalette, attributes, ...itemData } = validated;

    // Create item
    const item = await prisma.item.create({
      data: {
        ...itemData,
        colorPalette: colorPalette ? colorPalette as any : Prisma.JsonNull,
        attributes: attributes ? attributes as any : Prisma.JsonNull,
      },
      include: {
        images: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    // Handle tags if provided
    if (tagNames && tagNames.length > 0) {
      // Create or find tags
      const tagPromises = tagNames.map(async (tagName) => {
        return prisma.tag.upsert({
          where: { name: tagName },
          update: {},
          create: { name: tagName },
        });
      });
      
      const tags = await Promise.all(tagPromises);
      
      // Link tags to item
      await Promise.all(
        tags.map((tag: any) =>
          prisma.itemTag.create({
            data: {
              itemId: item.id,
              tagId: tag.id,
            },
          })
        )
      );

      // Fetch item with tags
      const itemWithTags = await prisma.item.findUnique({
        where: { id: item.id },
        include: {
          images: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
      });

      return NextResponse.json(
        {
          ...itemWithTags,
          tags: itemWithTags?.tags.map((t: any) => t.tag) || [],
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      {
        ...item,
        tags: item.tags.map((t: any) => t.tag),
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.issues } },
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
