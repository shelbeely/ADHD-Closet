import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { z } from 'zod';

// Validation schema for creating outfits
const createOutfitSchema = z.object({
  title: z.string().optional(),
  weather: z.enum(['hot', 'warm', 'cool', 'cold', 'rain', 'snow']).optional(),
  vibe: z.enum(['dysphoria_safe', 'confidence_boost', 'dopamine', 'neutral']).optional(),
  occasion: z.string().optional(),
  timeAvailable: z.enum(['quick', 'normal']).optional(),
  items: z.array(z.object({
    itemId: z.string(),
    role: z.enum(['top', 'bottom', 'dress', 'outerwear', 'shoes', 'accessory', 'jewelry', 'underwear_bras'])
  })),
  explanation: z.string().optional(),
  swapSuggestions: z.string().optional()
});

// GET /api/outfits - List all outfits
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const [outfits, total] = await Promise.all([
      prisma.outfit.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
      }),
      prisma.outfit.count()
    ]);

    return NextResponse.json({
      outfits,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching outfits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch outfits' },
      { status: 500 }
    );
  }
}

// POST /api/outfits - Create a new outfit
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createOutfitSchema.parse(body);

    const outfit = await prisma.outfit.create({
      data: {
        title: validated.title || `Outfit ${new Date().toLocaleDateString()}`,
        weather: validated.weather,
        vibe: validated.vibe,
        occasion: validated.occasion,
        timeAvailable: validated.timeAvailable,
        explanation: validated.explanation,
        swapSuggestions: validated.swapSuggestions,
        items: {
          create: validated.items.map(item => ({
            role: item.role,
            item: {
              connect: { id: item.itemId }
            }
          }))
        }
      },
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

    return NextResponse.json(outfit, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error creating outfit:', error);
    return NextResponse.json(
      { error: 'Failed to create outfit' },
      { status: 500 }
    );
  }
}
