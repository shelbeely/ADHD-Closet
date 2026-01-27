import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { z } from 'zod';

const createTagSchema = z.object({
  name: z.string().min(1).max(50),
});

// GET /api/tags - List all tags with usage counts
export async function GET(request: NextRequest) {
  try {
    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: {
            itemTags: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({
      tags: tags.map((tag: any) => ({
        ...tag,
        usageCount: tag._count.itemTags,
      })),
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch tags' } },
      { status: 500 }
    );
  }
}

// POST /api/tags - Create new tag
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createTagSchema.parse(body);

    const tag = await prisma.tag.create({
      data: {
        name: validated.name,
      },
    });

    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.issues } },
        { status: 400 }
      );
    }

    // Handle unique constraint violation
    if ((error as any).code === 'P2002') {
      return NextResponse.json(
        { error: { code: 'DUPLICATE', message: 'Tag already exists' } },
        { status: 409 }
      );
    }
    
    console.error('Error creating tag:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to create tag' } },
      { status: 500 }
    );
  }
}
