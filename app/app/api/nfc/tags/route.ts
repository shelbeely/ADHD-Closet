/**
 * NFC Tags List API
 * 
 * GET /api/nfc/tags - List all NFC tags
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const tags = await prisma.nFCTag.findMany({
      include: {
        item: {
          select: {
            id: true,
            title: true,
            category: true,
            state: true,
            images: {
              where: {
                kind: { in: ['ai_catalog', 'thumbnail', 'original_main'] },
              },
              take: 1,
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get recent events for each tag
    const tagsWithEvents = await Promise.all(
      tags.map(async (tag) => {
        const recentEvents = await prisma.nFCEvent.findMany({
          where: { tagId: tag.tagId },
          orderBy: { createdAt: 'desc' },
          take: 5,
        });

        return {
          ...tag,
          recentEvents,
        };
      })
    );

    return NextResponse.json({
      tags: tagsWithEvents,
      total: tags.length,
    });
  } catch (error) {
    console.error('Error fetching NFC tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch NFC tags' },
      { status: 500 }
    );
  }
}
