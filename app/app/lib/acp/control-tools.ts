/**
 * ACP Control Tools
 * 
 * Write/control operations for external agents like OpenClaw
 * to automate and control Twin Style wardrobe
 */

import { prisma } from '@/app/lib/prisma';
import { twinStyleAgent } from '@/app/lib/a2a/agent';
import { 
  notifyItemAdded, 
  notifyItemUpdated, 
  notifyItemDeleted,
  notifyJobCompleted,
  notifyStatsChanged 
} from './notifications';
import { z } from 'zod';

/**
 * Add Item Tool
 * 
 * Creates a new wardrobe item programmatically
 */
export const AddItemSchema = z.object({
  title: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  sizeText: z.string().optional(),
  materials: z.string().optional(),
  imageBase64: z.string().optional(),
  autoProcess: z.boolean().optional().default(true),
});

export async function addItem(args: z.infer<typeof AddItemSchema>) {
  const { imageBase64, autoProcess, ...itemData } = args;

  // Create the item
  const item = await prisma.item.create({
    data: {
      title: itemData.title,
      category: itemData.category as any,
      brand: itemData.brand,
      sizeText: itemData.sizeText,
      materials: itemData.materials,
    },
  });

  // If image provided and autoProcess is true, trigger AI processing
  if (imageBase64 && autoProcess) {
    try {
      // Run catalog generation
      const catalogResult = await twinStyleAgent.executeSkill('generate_catalog_image', {
        imageBase64,
      });

      // Run inference if no category provided
      if (!itemData.category) {
        const inferenceResult = await twinStyleAgent.executeSkill('infer_item_attributes', {
          imageBase64,
          userPrompt: itemData.title,
        }) as any;

        // Update item with inferred data
        await prisma.item.update({
          where: { id: item.id },
          data: {
            category: inferenceResult.category,
            title: inferenceResult.title || itemData.title,
          },
        });
      }
    } catch (error) {
      console.error('AI processing failed:', error);
    }
  }

  // Notify subscribers
  notifyItemAdded(item.id, item.title || undefined, item.category || undefined);
  
  // Update stats
  const totalItems = await prisma.item.count();
  notifyStatsChanged(totalItems, 'added');

  return {
    success: true,
    itemId: item.id,
    message: 'Item created successfully',
  };
}

/**
 * Update Item Tool
 * 
 * Updates existing item metadata
 */
export const UpdateItemSchema = z.object({
  itemId: z.string(),
  title: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  sizeText: z.string().optional(),
  materials: z.string().optional(),
  state: z.enum(['available', 'worn', 'dirty', 'broken', 'donated', 'archived']).optional(),
});

export async function updateItem(args: z.infer<typeof UpdateItemSchema>) {
  const { itemId, ...updates } = args;

  const item = await prisma.item.update({
    where: { id: itemId },
    data: updates as any,
  });

  notifyItemUpdated(item.id, item.title || undefined, item.category || undefined);

  return {
    success: true,
    itemId: item.id,
    message: 'Item updated successfully',
  };
}

/**
 * Delete Item Tool
 * 
 * Removes an item from wardrobe
 */
export const DeleteItemSchema = z.object({
  itemId: z.string(),
});

export async function deleteItem(args: z.infer<typeof DeleteItemSchema>) {
  const { itemId } = args;

  await prisma.item.delete({
    where: { id: itemId },
  });

  notifyItemDeleted(itemId);
  
  const totalItems = await prisma.item.count();
  notifyStatsChanged(totalItems, 'removed');

  return {
    success: true,
    itemId,
    message: 'Item deleted successfully',
  };
}

/**
 * Trigger AI Job Tool
 * 
 * Manually trigger AI processing for an item
 */
export const TriggerAIJobSchema = z.object({
  itemId: z.string(),
  jobType: z.enum(['catalog', 'inference', 'ocr', 'outfit']),
  imageBase64: z.string().optional(),
});

export async function triggerAIJob(args: z.infer<typeof TriggerAIJobSchema>) {
  const { itemId, jobType, imageBase64 } = args;

  const item = await prisma.item.findUnique({
    where: { id: itemId },
    include: { images: true },
  });

  if (!item) {
    throw new Error(`Item not found: ${itemId}`);
  }

  let result: any;

  switch (jobType) {
    case 'catalog':
      if (!imageBase64) {
        throw new Error('imageBase64 required for catalog generation');
      }
      result = await twinStyleAgent.executeSkill('generate_catalog_image', { imageBase64 });
      break;

    case 'inference':
      if (!imageBase64) {
        throw new Error('imageBase64 required for inference');
      }
      result = await twinStyleAgent.executeSkill('infer_item_attributes', {
        imageBase64,
        userPrompt: item.title,
      });
      // Update item with inferred data
      await prisma.item.update({
        where: { id: itemId },
        data: {
          category: (result as any).category,
          title: (result as any).title || item.title,
        },
      });
      break;

    case 'outfit':
      // Generate outfit including this item
      result = await twinStyleAgent.executeSkill('generate_outfit', {
        constraints: {},
        availableItems: [{ id: itemId, category: item.category }],
      });
      break;

    default:
      throw new Error(`Unknown job type: ${jobType}`);
  }

  notifyJobCompleted(`job-${itemId}-${jobType}`, jobType, result as any);

  return {
    success: true,
    jobId: `job-${itemId}-${jobType}`,
    result,
  };
}

/**
 * Batch Operations Tool
 * 
 * Execute multiple operations atomically
 */
export const BatchOperationsSchema = z.object({
  operations: z.array(z.object({
    type: z.enum(['add', 'update', 'delete']),
    data: z.record(z.unknown()),
  })),
});

export async function batchOperations(args: z.infer<typeof BatchOperationsSchema>) {
  const { operations } = args;
  const results: any[] = [];

  // Execute in transaction for atomicity
  await prisma.$transaction(async (tx) => {
    for (const op of operations) {
      let result;
      
      switch (op.type) {
        case 'add':
          result = await addItem(AddItemSchema.parse(op.data));
          break;
        case 'update':
          result = await updateItem(UpdateItemSchema.parse(op.data));
          break;
        case 'delete':
          result = await deleteItem(DeleteItemSchema.parse(op.data));
          break;
      }
      
      results.push(result);
    }
  });

  return {
    success: true,
    operations: results.length,
    results,
  };
}

/**
 * Import Items Bulk Tool
 * 
 * Import multiple items from JSON array
 */
export const ImportItemsBulkSchema = z.object({
  items: z.array(z.object({
    title: z.string().optional(),
    category: z.string().optional(),
    brand: z.string().optional(),
    sizeText: z.string().optional(),
  })),
});

export async function importItemsBulk(args: z.infer<typeof ImportItemsBulkSchema>) {
  const { items } = args;

  const created = await prisma.item.createMany({
    data: items.map(item => ({
      title: item.title,
      category: item.category as any,
      brand: item.brand,
      sizeText: item.sizeText,
    })),
  });

  const totalItems = await prisma.item.count();
  notifyStatsChanged(totalItems, 'added');

  return {
    success: true,
    imported: created.count,
    message: `Successfully imported ${created.count} items`,
  };
}

/**
 * Export Wardrobe Tool
 * 
 * Export all wardrobe data as JSON
 */
export async function exportWardrobe() {
  const items = await prisma.item.findMany({
    include: {
      images: true,
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  return {
    success: true,
    exportDate: new Date().toISOString(),
    itemCount: items.length,
    items: items.map(item => ({
      id: item.id,
      title: item.title,
      category: item.category,
      brand: item.brand,
      sizeText: item.sizeText,
      materials: item.materials,
      state: item.state,
      images: item.images.map(img => ({
        kind: img.kind,
        filePath: img.filePath,
      })),
      tags: item.tags.map(t => t.tag.name),
    })),
  };
}
