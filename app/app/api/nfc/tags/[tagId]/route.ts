/**
 * Get NFC Tag by ID API
 * 
 * GET /api/nfc/tags/[tagId] - Get a specific NFC tag by its tag ID
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tagId: string }> }
) {
  try {
    const { tagId } = await params;

    const tag = await prisma.nFCTag.findUnique({
      where: { tagId },
      include: {
        item: {
          include: {
            images: {
              where: {
                kind: { in: ['ai_catalog', 'thumbnail', 'original_main'] },
              },
              take: 1,
            },
          },
        },
      },
    });

    if (!tag) {
      return NextResponse.json(
        { error: 'NFC tag not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ tag });
  } catch (error) {
    console.error('Error fetching NFC tag:', error);
    return NextResponse.json(
      { error: 'Failed to fetch NFC tag' },
      { status: 500 }
    );
  }
}
