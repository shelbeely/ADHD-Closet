import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import sharp from 'sharp';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const DATA_DIR = process.env.DATA_DIR || join(process.cwd(), 'data');

// Valid image kinds for upload
const VALID_IMAGE_KINDS = [
  'original_main',
  'original_back',
  'label_brand',
  'label_care',
  'detail',
] as const;

// POST /api/items/[id]/images - Upload image
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: itemId } = await params;

    // Check if item exists
    const item = await prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Item not found' } },
        { status: 404 }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const kind = formData.get('kind') as string;

    // Validate file
    if (!file) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'No file provided' } },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: {
            code: 'FILE_TOO_LARGE',
            message: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`,
          },
        },
        { status: 400 }
      );
    }

    // Validate kind
    if (!kind || !VALID_IMAGE_KINDS.includes(kind as any)) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: `Invalid kind. Must be one of: ${VALID_IMAGE_KINDS.join(', ')}`,
          },
        },
        { status: 400 }
      );
    }

    // Validate MIME type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'File must be an image' } },
        { status: 400 }
      );
    }

    // Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Get image metadata
    const metadata = await sharp(buffer).metadata();

    // Generate unique filename
    const imageId = crypto.randomUUID();
    const extension = file.type.split('/')[1] || 'jpg';
    const filename = `${imageId}.${extension}`;

    // Create directories
    const imagesDir = join(DATA_DIR, 'images', itemId);
    const thumbsDir = join(DATA_DIR, 'thumbs', itemId);

    if (!existsSync(imagesDir)) {
      await mkdir(imagesDir, { recursive: true });
    }
    if (!existsSync(thumbsDir)) {
      await mkdir(thumbsDir, { recursive: true });
    }

    // Save original image
    const imagePath = join(imagesDir, filename);
    await writeFile(imagePath, buffer);

    // Generate thumbnail (max 512px, WebP format)
    const thumbFilename = `${imageId}.webp`;
    const thumbPath = join(thumbsDir, thumbFilename);
    
    await sharp(buffer)
      .resize(512, 512, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toFile(thumbPath);

    // Save to database
    const [originalImage, thumbnailImage] = await Promise.all([
      // Save original
      prisma.imageAsset.create({
        data: {
          id: imageId,
          itemId,
          kind: kind as any,
          filePath: `images/${itemId}/${filename}`,
          width: metadata.width,
          height: metadata.height,
          mimeType: file.type,
        },
      }),
      // Save thumbnail
      prisma.imageAsset.create({
        data: {
          itemId,
          kind: 'thumbnail',
          filePath: `thumbs/${itemId}/${thumbFilename}`,
          width: 512,
          height: 512,
          mimeType: 'image/webp',
        },
      }),
    ]);

    return NextResponse.json(originalImage, { status: 201 });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to upload image' } },
      { status: 500 }
    );
  }
}
