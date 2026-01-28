import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { aiJobQueue } from '@/app/lib/queue';
import { z } from 'zod';

const generateVisualizationSchema = z.object({
  visualizationType: z.enum(['outfit_board', 'person_wearing']).default('outfit_board'),
});

// POST /api/outfits/[id]/visualize - Generate AI visualization for an outfit
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const outfitId = params.id;
    const body = await request.json();
    const validated = generateVisualizationSchema.parse(body);

    // Check if outfit exists
    const outfit = await prisma.outfit.findUnique({
      where: { id: outfitId },
      include: {
        items: {
          include: {
            item: {
              include: {
                images: {
                  where: {
                    kind: {
                      in: ['ai_catalog', 'original_main'],
                    },
                  },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!outfit) {
      return NextResponse.json(
        { error: 'Outfit not found' },
        { status: 404 }
      );
    }

    if (outfit.items.length === 0) {
      return NextResponse.json(
        { error: 'Outfit has no items' },
        { status: 400 }
      );
    }

    // Check if items have images
    const itemsWithImages = outfit.items.filter((oi: any) => oi.item.images.length > 0);
    if (itemsWithImages.length === 0) {
      return NextResponse.json(
        { error: 'No images found for outfit items' },
        { status: 400 }
      );
    }

    // Queue visualization job
    const job = await aiJobQueue.add('generate_outfit_visualization', {
      outfitId,
      visualizationType: validated.visualizationType,
    });

    // Create AI job record
    const aiJob = await prisma.aIJob.create({
      data: {
        type: 'generate_outfit_visualization',
        status: 'queued',
        outfitId,
        modelName: process.env.OPENROUTER_IMAGE_MODEL || 'google/gemini-3-pro-image-preview',
        inputRefs: {
          visualizationType: validated.visualizationType,
        },
      },
    });

    // Update job data with the AI job ID
    await job.updateData({
      jobId: aiJob.id,
      type: 'generate_outfit_visualization',
      outfitId,
      inputRefs: {
        visualizationType: validated.visualizationType,
      },
    });

    return NextResponse.json({
      jobId: job.id,
      aiJobId: aiJob.id,
      status: 'queued',
      message: `Generating ${validated.visualizationType === 'outfit_board' ? 'outfit board' : 'person wearing outfit'} visualization. This may take 30-60 seconds.`,
    }, { status: 202 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error generating outfit visualization:', error);
    return NextResponse.json(
      { error: 'Failed to generate visualization' },
      { status: 500 }
    );
  }
}
