import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import archiver from 'archiver';
import path from 'path';
import fs from 'fs';

/**
 * Export API - Creates a ZIP backup of the entire wardrobe
 * 
 * Includes:
 * - items.json: All item metadata
 * - outfits.json: All outfit metadata
 * - tags.json: All tags
 * - manifest.json: Export metadata (version, date, counts)
 * - images/: All image files with original names
 * - catalog.csv: Spreadsheet-friendly item list
 * 
 * Design: ADHD-optimized (one-click export, progress indication, clear naming)
 */
export async function POST(request: NextRequest) {
  try {
    // Fetch all data
    const [items, outfits, tags, imageAssets] = await Promise.all([
      prisma.item.findMany({
        include: {
          images: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
      }),
      prisma.outfit.findMany({
        include: {
          items: {
            include: {
              item: {
                select: {
                  id: true,
                  title: true,
                  category: true,
                },
              },
            },
          },
        },
      }),
      prisma.tag.findMany(),
      prisma.imageAsset.findMany(),
    ]);

    // Create manifest
    const manifest = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      itemCount: items.length,
      outfitCount: outfits.length,
      tagCount: tags.length,
      imageCount: imageAssets.length,
    };

    // Create CSV catalog for spreadsheet users
    const csvRows = [
      ['ID', 'Title', 'Category', 'Brand', 'Size', 'State', 'Colors', 'Tags', 'Image Count', 'Created At'].join(','),
    ];

    for (const item of items) {
      const tagNames = item.tags.map((t: { tag: { name: string } }) => t.tag.name).join('; ');
      const colors = item.colorPalette ? JSON.stringify(item.colorPalette) : '';
      csvRows.push([
        item.id,
        `"${(item.title || '').replace(/"/g, '""')}"`,
        item.category || '',
        `"${(item.brand || '').replace(/"/g, '""')}"`,
        `"${(item.sizeText || '').replace(/"/g, '""')}"`,
        item.state,
        `"${colors}"`,
        `"${tagNames}"`,
        item.images.length,
        item.createdAt.toISOString(),
      ].join(','));
    }

    // Create archive
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Maximum compression
    });

    // Set up response headers
    const filename = `wardrobe-backup-${new Date().toISOString().split('T')[0]}.zip`;

    // Add JSON files
    archive.append(JSON.stringify(manifest, null, 2), { name: 'manifest.json' });
    archive.append(JSON.stringify(items, null, 2), { name: 'items.json' });
    archive.append(JSON.stringify(outfits, null, 2), { name: 'outfits.json' });
    archive.append(JSON.stringify(tags, null, 2), { name: 'tags.json' });
    archive.append(csvRows.join('\n'), { name: 'catalog.csv' });

    // Add images
    const dataDir = process.env.DATA_DIR || './data';
    for (const image of imageAssets) {
      const imagePath = path.join(dataDir, image.filePath);
      if (fs.existsSync(imagePath)) {
        const imageBuffer = fs.readFileSync(imagePath);
        archive.append(imageBuffer, { name: `images/${image.id}-${path.basename(image.filePath)}` });
      }
    }

    // Finalize archive
    archive.finalize();

    // Convert archive stream to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of archive) {
      chunks.push(Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to create export' },
      { status: 500 }
    );
  }
}
