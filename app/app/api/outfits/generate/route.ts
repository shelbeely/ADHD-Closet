import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { aiJobQueue } from '@/app/lib/queue';
import { z } from 'zod';

// Validation schema for outfit generation request
const generateOutfitSchema = z.object({
  weather: z.enum(['hot', 'warm', 'cool', 'cold', 'rain', 'snow']).optional(),
  vibe: z.enum(['dysphoria_safe', 'confidence_boost', 'dopamine', 'neutral']).optional(),
  occasion: z.string().optional(),
  timeAvailable: z.enum(['quick', 'normal']).optional(),
  count: z.number().min(1).max(5).default(3), // Number of outfit suggestions
  panicPick: z.boolean().default(false) // If true, return only 1 best outfit immediately
});

// POST /api/outfits/generate - Generate outfit suggestions using AI
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = generateOutfitSchema.parse(body);

    // Get available items
    const items = await prisma.item.findMany({
      where: {
        state: 'available'
      },
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
    });

    if (items.length === 0) {
      return NextResponse.json(
        { error: 'No available items found' },
        { status: 400 }
      );
    }

    // For panic pick, use simpler logic (can be enhanced with AI later)
    if (validated.panicPick) {
      // Simple rule-based panic pick: grab one of each category
      const tops = items.filter(i => i.category === 'tops');
      const bottoms = items.filter(i => i.category === 'bottoms');
      const shoes = items.filter(i => i.category === 'shoes');

      if (tops.length === 0 || (bottoms.length === 0)) {
        return NextResponse.json(
          { error: 'Not enough items for panic pick (need at least top and bottom)' },
          { status: 400 }
        );
      }

      // Pick the first available item from each category
      const outfitItems: Array<{ itemId: string; role: 'top' | 'bottom' | 'dress' | 'outerwear' | 'shoes' | 'accessory' | 'underwear_bras' | 'jewelry' | 'swimwear' | 'activewear' | 'sleepwear' | 'loungewear' | 'suit_set' }> = [
        { itemId: tops[0].id, role: 'top' },
        { itemId: bottoms[0].id, role: 'bottom' }
      ];

      if (shoes.length > 0) {
        outfitItems.push({ itemId: shoes[0].id, role: 'shoes' });
      }

      // Create the outfit immediately
      const outfit = await prisma.outfit.create({
        data: {
          title: `Panic Pick ${new Date().toLocaleTimeString()}`,
          weather: validated.weather,
          vibe: validated.vibe,
          occasion: validated.occasion,
          timeAvailable: validated.timeAvailable,
          explanation: 'Quick outfit generated for immediate decision-making.',
          items: {
            create: outfitItems.map(item => ({
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

      return NextResponse.json({
        panicPick: true,
        outfit,
        message: 'Panic pick generated immediately'
      });
    }

    // For normal generation, queue an AI job
    const job = await aiJobQueue.add('generate_outfit', {
      constraints: {
        weather: validated.weather,
        vibe: validated.vibe,
        occasion: validated.occasion,
        timeAvailable: validated.timeAvailable
      },
      availableItems: items.map(item => ({
        id: item.id,
        category: item.category,
        colorPalette: item.colorPalette,
        attributes: item.attributes,
        tags: item.tags.map(t => t.tag.name)
      })),
      count: validated.count
    });

    // Create placeholder AI job record
    const aiJob = await prisma.aIJob.create({
      data: {
        type: 'generate_outfit',
        status: 'queued',
        modelName: process.env.OPENROUTER_TEXT_MODEL || 'google/gemini-3-flash-preview',
        inputRefs: {
          weather: validated.weather,
          vibe: validated.vibe,
          occasion: validated.occasion,
          timeAvailable: validated.timeAvailable,
          count: validated.count
        }
      }
    });

    return NextResponse.json({
      jobId: job.id,
      aiJobId: aiJob.id,
      status: 'queued',
      message: `Generating ${validated.count} outfit suggestions. This may take 10-30 seconds.`
    }, { status: 202 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error generating outfit:', error);
    return NextResponse.json(
      { error: 'Failed to generate outfit' },
      { status: 500 }
    );
  }
}
