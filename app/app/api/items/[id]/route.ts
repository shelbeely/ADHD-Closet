import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { z } from 'zod';

// Validation schema for updating items
const updateItemSchema = z.object({
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
  storageType: z.enum(['hanging', 'folded', 'drawer', 'shelf', 'box', 'other']).optional(),
  locationInCloset: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

// GET /api/items/[id] - Get single item with full details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: {
            createdAt: 'asc',
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        aiJobs: {
          where: {
            status: {
              in: ['queued', 'running', 'succeeded', 'needs_review'],
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10, // Latest 10 jobs
        },
      },
    });

    if (!item) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Item not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      item: {
        ...item,
        colorPalette: item.colorPalette ? JSON.parse(item.colorPalette as string) : null,
        attributes: item.attributes ? JSON.parse(item.attributes as string) : null,
      },
      images: item.images,
      tags: item.tags.map((t: any) => t.tag),
      ai: {
        latestJobs: item.aiJobs,
      },
    });
  } catch (error) {
    console.error('Error fetching item:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch item' } },
      { status: 500 }
    );
  }
}

// PATCH /api/items/[id] - Update item
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateItemSchema.parse(body);

    // Check if item exists
    const existingItem = await prisma.item.findUnique({
      where: { id },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Item not found' } },
        { status: 404 }
      );
    }

    // Extract tags if provided
    const { tags: tagNames, colorPalette, attributes, ...itemData } = validated;

    // Update item
    const item = await prisma.item.update({
      where: { id },
      data: {
        ...itemData,
        colorPalette: colorPalette ? (colorPalette as any) : undefined,
        attributes: attributes ? (attributes as any) : undefined,
      },
    });

    // Handle tags if provided
    if (tagNames !== undefined) {
      // Remove existing tags
      await prisma.itemTag.deleteMany({
        where: { itemId: id },
      });

      if (tagNames.length > 0) {
        // Create or find new tags
        const tagPromises = tagNames.map(async (tagName) => {
          return prisma.tag.upsert({
            where: { name: tagName },
            update: {},
            create: { name: tagName },
          });
        });
        
        const tags = await Promise.all(tagPromises);
        
        // Link new tags to item
        await Promise.all(
          tags.map((tag: any) =>
            prisma.itemTag.create({
              data: {
                itemId: id,
                tagId: tag.id,
              },
            })
          )
        );
      }
    }

    // Fetch updated item with relations
    const updatedItem = await prisma.item.findUnique({
      where: { id },
      include: {
        images: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return NextResponse.json({
      ...updatedItem,
      tags: updatedItem?.tags.map((t: any) => t.tag) || [],
      colorPalette: updatedItem?.colorPalette
        ? JSON.parse(updatedItem.colorPalette as string)
        : null,
      attributes: updatedItem?.attributes
        ? JSON.parse(updatedItem.attributes as string)
        : null,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.issues } },
        { status: 400 }
      );
    }
    
    console.error('Error updating item:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to update item' } },
      { status: 500 }
    );
  }
}

// DELETE /api/items/[id] - Delete item (soft delete recommended)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if item exists
    const existingItem = await prisma.item.findUnique({
      where: { id },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Item not found' } },
        { status: 404 }
      );
    }

    // Delete item (cascade will handle related records)
    await prisma.item.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error deleting item:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to delete item' } },
      { status: 500 }
    );
  }
}
