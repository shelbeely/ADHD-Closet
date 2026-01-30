/**
 * NFC Tags List API
 * 
 * GET /api/nfc/tags - List all NFC tags
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Fetch all tags with their items and recent events in a single query
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

    // Fetch all recent events for all tags in a single query
    const allEvents = await prisma.nFCEvent.findMany({
      where: {
        tagId: {
          in: tags.map(tag => tag.tagId),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: tags.length * 5, // Up to 5 events per tag
    });

    // Group events by tagId
    const eventsByTagId = allEvents.reduce((acc: any, event: any) => {
      if (!acc[event.tagId]) {
        acc[event.tagId] = [];
      }
      if (acc[event.tagId].length < 5) {
        acc[event.tagId].push(event);
      }
      return acc;
    }, {});

    // Combine tags with their events
    const tagsWithEvents = tags.map(tag => ({
      ...tag,
      recentEvents: eventsByTagId[tag.tagId] || [],
    }));

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
