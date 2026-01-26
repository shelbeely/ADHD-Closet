import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const DATA_DIR = process.env.DATA_DIR || join(process.cwd(), 'data');

// GET /api/images/[imageId] - Serve image file
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ imageId: string }> }
) {
  try {
    const { imageId } = await params;

    // Fetch image metadata from database
    const image = await prisma.imageAsset.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Image not found' } },
        { status: 404 }
      );
    }

    // Construct file path
    // Security: filePath should only contain paths relative to DATA_DIR
    // Prevent directory traversal
    const filePath = join(DATA_DIR, image.filePath);
    
    // Verify the resolved path is still within DATA_DIR
    if (!filePath.startsWith(DATA_DIR)) {
      console.error('Directory traversal attempt:', image.filePath);
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Access denied' } },
        { status: 403 }
      );
    }

    // Check if file exists
    if (!existsSync(filePath)) {
      console.error('Image file not found on disk:', filePath);
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Image file not found' } },
        { status: 404 }
      );
    }

    // Read file
    const fileBuffer = await readFile(filePath);

    // Return image with appropriate headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': image.mimeType || 'application/octet-stream',
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving image:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to serve image' } },
      { status: 500 }
    );
  }
}
