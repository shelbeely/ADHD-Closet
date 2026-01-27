import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { aiJobQueue } from '@/app/lib/queue';
import { z } from 'zod';

const createJobSchema = z.object({
  type: z.enum(['generate_catalog_image', 'infer_item', 'extract_label', 'generate_outfit']),
  itemId: z.string().uuid().optional(),
  outfitId: z.string().uuid().optional(),
  inputRefs: z.any().optional(),
});

// POST /api/ai/jobs - Create and queue AI job
export async function POST(request: NextRequest) {
  try {
    if (!process.env.AI_ENABLED || process.env.AI_ENABLED === 'false') {
      return NextResponse.json(
        { error: { code: 'AI_DISABLED', message: 'AI processing is disabled' } },
        { status: 503 }
      );
    }

    const body = await request.json();
    const validated = createJobSchema.parse(body);

    // Validate references exist
    if (validated.itemId) {
      const item = await prisma.item.findUnique({
        where: { id: validated.itemId },
      });
      if (!item) {
        return NextResponse.json(
          { error: { code: 'NOT_FOUND', message: 'Item not found' } },
          { status: 404 }
        );
      }
    }

    if (validated.outfitId) {
      const outfit = await prisma.outfit.findUnique({
        where: { id: validated.outfitId },
      });
      if (!outfit) {
        return NextResponse.json(
          { error: { code: 'NOT_FOUND', message: 'Outfit not found' } },
          { status: 404 }
        );
      }
    }

    // Create AI job record
    const aiJob = await prisma.aIJob.create({
      data: {
        type: validated.type,
        status: 'queued',
        itemId: validated.itemId,
        outfitId: validated.outfitId,
        inputRefs: validated.inputRefs || null,
      },
    });

    // Queue the job
    await aiJobQueue.add(
      validated.type,
      {
        jobId: aiJob.id,
        type: validated.type,
        itemId: validated.itemId,
        outfitId: validated.outfitId,
        inputRefs: validated.inputRefs,
      },
      {
        jobId: aiJob.id,
      }
    );

    return NextResponse.json(aiJob, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.issues } },
        { status: 400 }
      );
    }

    console.error('Error creating AI job:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to create AI job' } },
      { status: 500 }
    );
  }
}

// GET /api/ai/jobs - List AI jobs with filtering
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const itemId = searchParams.get('itemId');
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    const where: any = {};
    if (itemId) where.itemId = itemId;
    if (status) where.status = status;
    if (type) where.type = type;

    const jobs = await prisma.aIJob.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error('Error fetching AI jobs:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch AI jobs' } },
      { status: 500 }
    );
  }
}
