/**
 * NFC Tag Assignment API
 * 
 * POST /api/nfc/assign - Associate an NFC tag with an item
 * DELETE /api/nfc/assign - Remove NFC tag association
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tagId, itemId, label } = body;

    if (!tagId || !itemId) {
      return NextResponse.json(
        { error: 'tagId and itemId are required' },
        { status: 400 }
      );
    }

    // Check if item exists
    const item = await prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    // Check if tag is already assigned to another item
    const existingTag = await prisma.nFCTag.findUnique({
      where: { tagId },
      include: { item: true },
    });

    if (existingTag && existingTag.itemId !== itemId) {
      return NextResponse.json(
        {
          error: 'NFC tag is already assigned to another item',
          existingItem: {
            id: existingTag.item.id,
            title: existingTag.item.title,
          },
        },
        { status: 409 }
      );
    }

    // Create or update the NFC tag assignment
    const nfcTag = await prisma.nFCTag.upsert({
      where: { tagId },
      create: {
        tagId,
        itemId,
        label: label || null,
      },
      update: {
        itemId,
        label: label || null,
      },
      include: {
        item: {
          select: {
            id: true,
            title: true,
            category: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      nfcTag,
    });
  } catch (error) {
    console.error('Error assigning NFC tag:', error);
    return NextResponse.json(
      { error: 'Failed to assign NFC tag' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tagId = searchParams.get('tagId');
    const itemId = searchParams.get('itemId');

    if (!tagId && !itemId) {
      return NextResponse.json(
        { error: 'Either tagId or itemId is required' },
        { status: 400 }
      );
    }

    // Delete by tagId or itemId
    const where = tagId ? { tagId } : { itemId: itemId! };
    
    const deleted = await prisma.nFCTag.deleteMany({
      where,
    });

    if (deleted.count === 0) {
      return NextResponse.json(
        { error: 'NFC tag not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      deletedCount: deleted.count,
    });
  } catch (error) {
    console.error('Error removing NFC tag:', error);
    return NextResponse.json(
      { error: 'Failed to remove NFC tag' },
      { status: 500 }
    );
  }
}
