/**
 * NFC Tag Scanning API
 * 
 * POST /api/nfc/scan - Record an NFC tag scan (item removal/return)
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tagId, action, notes } = body;

    if (!tagId || !action) {
      return NextResponse.json(
        { error: 'tagId and action are required' },
        { status: 400 }
      );
    }

    if (action !== 'removed' && action !== 'returned') {
      return NextResponse.json(
        { error: 'action must be "removed" or "returned"' },
        { status: 400 }
      );
    }

    // Find the NFC tag and associated item
    const nfcTag = await prisma.nFCTag.findUnique({
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

    if (!nfcTag) {
      return NextResponse.json(
        { error: 'NFC tag not found. Please assign the tag to an item first.' },
        { status: 404 }
      );
    }

    // Create NFC event
    const event = await prisma.nFCEvent.create({
      data: {
        tagId,
        itemId: nfcTag.itemId,
        action,
        notes: notes || null,
      },
    });

    // Update item state based on action
    let updateData: any = {};
    
    if (action === 'removed') {
      // Mark as unavailable when removed
      updateData.state = 'unavailable';
      updateData.lastWornDate = new Date();
      
      // Increment wear count
      const currentWears = nfcTag.item.currentWears ?? 0;
      const wearsBeforeWash = nfcTag.item.wearsBeforeWash ?? 1;
      updateData.currentWears = currentWears + 1;
      
      // Check if needs wash
      if (currentWears + 1 >= wearsBeforeWash) {
        updateData.cleanStatus = 'needs_wash';
      }
    } else if (action === 'returned') {
      // Mark as available when returned (unless needs wash)
      if (nfcTag.item.cleanStatus === 'needs_wash') {
        updateData.state = 'laundry';
      } else {
        updateData.state = 'available';
      }
    }

    const updatedItem = await prisma.item.update({
      where: { id: nfcTag.itemId },
      data: updateData,
      include: {
        images: {
          where: {
            kind: { in: ['ai_catalog', 'thumbnail', 'original_main'] },
          },
          take: 1,
        },
      },
    });

    return NextResponse.json({
      success: true,
      event,
      item: updatedItem,
      message: action === 'removed' 
        ? `${updatedItem.title || 'Item'} marked as removed from closet`
        : `${updatedItem.title || 'Item'} returned to closet`,
    });
  } catch (error) {
    console.error('Error recording NFC scan:', error);
    return NextResponse.json(
      { error: 'Failed to record NFC scan' },
      { status: 500 }
    );
  }
}
