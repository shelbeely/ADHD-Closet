import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { z } from 'zod';

const updateOutfitSchema = z.object({
  title: z.string().optional(),
  notes: z.string().optional(),
  rating: z.enum(['up', 'down', 'neutral']).optional(),
  weather: z.enum(['hot', 'warm', 'cool', 'cold', 'rain', 'snow']).optional(),
  vibe: z.enum(['dysphoria_safe', 'confidence_boost', 'dopamine', 'neutral']).optional(),
  occasion: z.string().optional()
});

// GET /api/outfits/[id] - Get a single outfit
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const outfit = await prisma.outfit.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            item: {
              include: {
                images: {
                  where: { kind: 'ai_catalog' },
                  take: 1
                },
                tags: {
                  include: {
                    tag: true
                  }
                }
              }
            }
          }
        },
        images: true,
        aiJobs: {
          where: {
            type: 'generate_outfit_visualization'
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!outfit) {
      return NextResponse.json(
        { error: 'Outfit not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(outfit);
  } catch (error) {
    console.error('Error fetching outfit:', error);
    return NextResponse.json(
      { error: 'Failed to fetch outfit' },
      { status: 500 }
    );
  }
}

// PATCH /api/outfits/[id] - Update an outfit
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateOutfitSchema.parse(body);

    const outfit = await prisma.outfit.update({
      where: { id },
      data: validated,
      include: {
        items: {
          include: {
            item: {
              include: {
                images: {
                  where: { kind: 'ai_catalog' },
                  take: 1
                }
              }
            }
          }
        }
      }
    });

    return NextResponse.json(outfit);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error updating outfit:', error);
    return NextResponse.json(
      { error: 'Failed to update outfit' },
      { status: 500 }
    );
  }
}

// DELETE /api/outfits/[id] - Delete an outfit
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.outfit.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting outfit:', error);
    return NextResponse.json(
      { error: 'Failed to delete outfit' },
      { status: 500 }
    );
  }
}
