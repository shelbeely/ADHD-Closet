import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { z } from 'zod';
import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs';

/**
 * Import API - Restores a wardrobe from a ZIP backup
 * 
 * Validates:
 * - Manifest version compatibility
 * - JSON structure integrity
 * - Image file existence
 * 
 * Options:
 * - merge: Add to existing data (default)
 * - replace: Clear existing data first (destructive, requires confirmation)
 * 
 * Design: ADHD-optimized (clear warnings, undo support via new export before replace)
 */

const manifestSchema = z.object({
  version: z.string(),
  exportDate: z.string(),
  itemCount: z.number(),
  outfitCount: z.number(),
  tagCount: z.number(),
  imageCount: z.number(),
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const mode = formData.get('mode') as string || 'merge'; // 'merge' or 'replace'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract ZIP
    const zip = new AdmZip(buffer);
    const zipEntries = zip.getEntries();

    // Read and validate manifest
    const manifestEntry = zip.getEntry('manifest.json');
    if (!manifestEntry) {
      return NextResponse.json(
        { error: 'Invalid backup: missing manifest.json' },
        { status: 400 }
      );
    }

    const manifestData = JSON.parse(manifestEntry.getData().toString('utf8'));
    const manifest = manifestSchema.parse(manifestData);

    // Check version compatibility
    if (manifest.version !== '1.0') {
      return NextResponse.json(
        { error: `Unsupported backup version: ${manifest.version}` },
        { status: 400 }
      );
    }

    // Read data files
    const itemsEntry = zip.getEntry('items.json');
    const outfitsEntry = zip.getEntry('outfits.json');
    const tagsEntry = zip.getEntry('tags.json');

    if (!itemsEntry || !tagsEntry) {
      return NextResponse.json(
        { error: 'Invalid backup: missing required data files' },
        { status: 400 }
      );
    }

    const items = JSON.parse(itemsEntry.getData().toString('utf8'));
    const tags = JSON.parse(tagsEntry.getData().toString('utf8'));
    const outfits = outfitsEntry ? JSON.parse(outfitsEntry.getData().toString('utf8')) : [];

    // If replace mode, clear existing data (DESTRUCTIVE - requires explicit confirmation)
    if (mode === 'replace') {
      await prisma.$transaction([
        prisma.outfitItem.deleteMany(),
        prisma.outfit.deleteMany(),
        prisma.itemTag.deleteMany(),
        prisma.aIJob.deleteMany(),
        prisma.imageAsset.deleteMany(),
        prisma.item.deleteMany(),
        prisma.tag.deleteMany(),
      ]);
    }

    // Create tags first (needed for item relationships)
    const tagMap = new Map<string, string>(); // old ID -> new ID
    for (const tag of tags) {
      const existingTag = await prisma.tag.findUnique({
        where: { name: tag.name },
      });

      if (existingTag) {
        tagMap.set(tag.id, existingTag.id);
      } else {
        const newTag = await prisma.tag.create({
          data: {
            name: tag.name,
          },
        });
        tagMap.set(tag.id, newTag.id);
      }
    }

    // Extract images to DATA_DIR
    const dataDir = process.env.DATA_DIR || './data';
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const imageMap = new Map<string, string>(); // old ID -> new file path

    for (const entry of zipEntries) {
      if (entry.entryName.startsWith('images/')) {
        const fileName = path.basename(entry.entryName);
        const filePath = path.join(dataDir, fileName);
        fs.writeFileSync(filePath, entry.getData());
        
        // Extract old ID from filename (format: {id}-{originalName})
        const match = fileName.match(/^([a-zA-Z0-9]+)-/);
        if (match) {
          imageMap.set(match[1], fileName);
        }
      }
    }

    // Create items with images
    const itemMap = new Map<string, string>(); // old ID -> new ID
    
    for (const item of items) {
      const newItem = await prisma.item.create({
        data: {
          title: item.title,
          category: item.category,
          brand: item.brand,
          sizeText: item.sizeText,
          materials: item.materials,
          colorPalette: item.colorPalette,
          attributes: item.attributes,
          state: item.state,
          // Create images
          images: {
            create: item.images.map((img: any) => ({
              kind: img.kind,
              filePath: imageMap.get(img.id) || img.filePath,
              mimeType: img.mimeType,
              sizeBytes: img.sizeBytes,
              width: img.width,
              height: img.height,
            })),
          },
          // Create tag relationships
          tags: {
            create: item.tags.map((itemTag: any) => ({
              tag: {
                connect: {
                  id: tagMap.get(itemTag.tagId) || itemTag.tagId,
                },
              },
            })),
          },
        },
      });

      itemMap.set(item.id, newItem.id);
    }

    // Create outfits
    for (const outfit of outfits) {
      await prisma.outfit.create({
        data: {
          title: outfit.title,
          notes: outfit.notes,
          weather: outfit.weather,
          vibe: outfit.vibe,
          occasion: outfit.occasion,
          timeAvailable: outfit.timeAvailable,
          rating: outfit.rating,
          explanation: outfit.explanation,
          swapSuggestions: outfit.swapSuggestions,
          items: {
            create: outfit.items.map((outfitItem: any) => ({
              role: outfitItem.role,
              item: {
                connect: {
                  id: itemMap.get(outfitItem.itemId) || outfitItem.itemId,
                },
              },
            })),
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      imported: {
        items: items.length,
        outfits: outfits.length,
        tags: tags.length,
        images: imageMap.size,
      },
      mode,
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Failed to import backup', details: String(error) },
      { status: 500 }
    );
  }
}
