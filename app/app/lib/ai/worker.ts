import { Worker, Job } from 'bullmq';
import { prisma } from '@/app/lib/prisma';
import { getOpenRouterClient } from '@/app/lib/ai/openrouter';
import { readFile } from 'fs/promises';
import { join } from 'path';
import Redis from 'ioredis';

const DATA_DIR = process.env.DATA_DIR || join(process.cwd(), 'data');

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

export interface AIJobData {
  jobId: string;
  type: 'generate_catalog_image' | 'infer_item' | 'extract_label' | 'generate_outfit';
  itemId?: string;
  outfitId?: string;
  inputRefs?: any;
}

// AI Job Worker
const aiWorker = new Worker<AIJobData>(
  'ai-jobs',
  async (job: Job<AIJobData>) => {
    const { jobId, type, itemId, outfitId, inputRefs } = job.data;

    console.log(`Processing AI job ${jobId} (${type})`);

    try {
      // Update job status to running
      await prisma.aIJob.update({
        where: { id: jobId },
        data: {
          status: 'running',
          attempts: { increment: 1 },
        },
      });

      const openrouter = getOpenRouterClient();
      let result: any = null;

      switch (type) {
        case 'generate_catalog_image':
          result = await processCatalogImageGeneration(itemId!, openrouter);
          break;

        case 'infer_item':
          result = await processItemInference(itemId!, openrouter, inputRefs);
          break;

        case 'extract_label':
          result = await processLabelExtraction(itemId!, openrouter);
          break;

        case 'generate_outfit':
          result = await processOutfitGeneration(outfitId!, openrouter, inputRefs);
          break;

        default:
          throw new Error(`Unknown job type: ${type}`);
      }

      // Update job with results
      await prisma.aIJob.update({
        where: { id: jobId },
        data: {
          status: 'succeeded',
          outputJson: result.output,
          confidenceJson: result.confidence,
          modelName: result.modelName,
          rawResponse: result.rawResponse ? JSON.stringify(result.rawResponse) : null,
          completedAt: new Date(),
        },
      });

      console.log(`AI job ${jobId} completed successfully`);
      return result;
    } catch (error: any) {
      console.error(`AI job ${jobId} failed:`, error);

      // Get current job to check attempts
      const currentJob = await prisma.aIJob.findUnique({
        where: { id: jobId },
      });

      const shouldRetry = currentJob && currentJob.attempts < currentJob.maxAttempts;

      await prisma.aIJob.update({
        where: { id: jobId },
        data: {
          status: shouldRetry ? 'queued' : 'failed',
          error: error.message,
          completedAt: shouldRetry ? null : new Date(),
        },
      });

      if (shouldRetry) {
        throw error; // BullMQ will retry
      }
    }
  },
  {
    connection,
    concurrency: 2, // Process 2 jobs at a time
  }
);

// Process catalog image generation
async function processCatalogImageGeneration(itemId: string, openrouter: any) {
  const item = await prisma.item.findUnique({
    where: { id: itemId },
    include: {
      images: {
        where: { kind: 'original_main' },
        take: 1,
      },
    },
  });

  if (!item || !item.images[0]) {
    throw new Error('Item or original image not found');
  }

  const imagePath = join(DATA_DIR, item.images[0].filePath);
  const imageBuffer = await readFile(imagePath);
  const imageBase64 = imageBuffer.toString('base64');

  const generatedImageUrl = await openrouter.generateCatalogImage(imageBase64);

  // TODO: Download and save the generated image
  // For now, store the URL in outputJson

  return {
    output: { generatedImageUrl },
    confidence: { overall: 0.9 },
    modelName: process.env.OPENROUTER_IMAGE_MODEL || 'black-forest-labs/flux-pro',
    rawResponse: { generatedImageUrl },
  };
}

// Process item inference
async function processItemInference(itemId: string, openrouter: any, inputRefs?: any) {
  const item = await prisma.item.findUnique({
    where: { id: itemId },
    include: {
      images: {
        where: {
          kind: {
            in: ['original_main', 'label_brand'],
          },
        },
      },
    },
  });

  if (!item) {
    throw new Error('Item not found');
  }

  const mainImage = item.images.find(img => img.kind === 'original_main');
  const labelImage = item.images.find(img => img.kind === 'label_brand');

  if (!mainImage) {
    throw new Error('Main image not found');
  }

  // Read images
  const mainImagePath = join(DATA_DIR, mainImage.filePath);
  const mainImageBuffer = await readFile(mainImagePath);
  const mainImageBase64 = mainImageBuffer.toString('base64');

  let labelImageBase64: string | undefined;
  if (labelImage) {
    const labelImagePath = join(DATA_DIR, labelImage.filePath);
    const labelImageBuffer = await readFile(labelImagePath);
    labelImageBase64 = labelImageBuffer.toString('base64');
  }

  const inferredData = await openrouter.inferItemDetails(mainImageBase64, labelImageBase64);

  // Update item with inferred data
  await prisma.item.update({
    where: { id: itemId },
    data: {
      category: inferredData.category || item.category,
      brand: inferredData.brand || item.brand,
      sizeText: inferredData.sizeText || item.sizeText,
      materials: inferredData.materials || item.materials,
      colorPalette: inferredData.colorPalette || item.colorPalette,
      attributes: inferredData.attributes || item.attributes,
    },
  });

  // Add tags if provided
  if (inferredData.tags && inferredData.tags.length > 0) {
    for (const tagName of inferredData.tags) {
      const tag = await prisma.tag.upsert({
        where: { name: tagName },
        update: {},
        create: { name: tagName },
      });

      await prisma.itemTag.upsert({
        where: {
          itemId_tagId: {
            itemId,
            tagId: tag.id,
          },
        },
        update: {},
        create: {
          itemId,
          tagId: tag.id,
        },
      });
    }
  }

  return {
    output: inferredData,
    confidence: inferredData.confidence || {},
    modelName: process.env.OPENROUTER_VISION_MODEL || 'anthropic/claude-3.5-sonnet',
    rawResponse: inferredData,
  };
}

// Process label extraction
async function processLabelExtraction(itemId: string, openrouter: any) {
  // Similar to inference but focuses on label images
  return processItemInference(itemId, openrouter);
}

// Process outfit generation
async function processOutfitGeneration(outfitId: string, openrouter: any, inputRefs?: any) {
  const outfit = await prisma.outfit.findUnique({
    where: { id: outfitId },
  });

  if (!outfit) {
    throw new Error('Outfit not found');
  }

  // Get available items
  const items = await prisma.item.findMany({
    where: {
      state: 'available',
    },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  const itemsForAI = items.map(item => ({
    id: item.id,
    category: item.category || 'unknown',
    tags: item.tags.map(t => t.tag.name),
    colors: item.colorPalette ? JSON.parse(item.colorPalette as string) : [],
  }));

  const constraints = inputRefs?.constraints || {};
  const generatedOutfits = await openrouter.generateOutfits(itemsForAI, constraints);

  return {
    output: generatedOutfits,
    confidence: { overall: 0.85 },
    modelName: process.env.OPENROUTER_TEXT_MODEL || 'anthropic/claude-3.5-sonnet',
    rawResponse: generatedOutfits,
  };
}

// Worker event handlers
aiWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

aiWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});

aiWorker.on('error', (err) => {
  console.error('Worker error:', err);
});

export default aiWorker;
