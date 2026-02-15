/**
 * Twin Style A2A Agent Card
 * 
 * This file defines the agent card that describes the capabilities
 * of Twin Style agents for discovery and interoperability.
 */

import { AgentCard } from './types';

export const twinStyleAgentCard: AgentCard = {
  name: 'twin-style-wardrobe',
  version: '1.0.0',
  description: 'AI-powered wardrobe organizer with ADHD-optimized workflows. Provides intelligent item categorization, catalog image generation, and outfit suggestions.',
  skills: [
    {
      name: 'generate_catalog_image',
      description: 'Generates a clean, professional catalog image from a clothing photo. Removes background, standardizes lighting, and creates a product-style image suitable for wardrobe management.',
      inputSchema: {
        type: 'object',
        properties: {
          imageBase64: {
            type: 'string',
            description: 'Base64-encoded original clothing image',
          },
        },
        required: ['imageBase64'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          generatedImageUrl: {
            type: 'string',
            description: 'URL or base64 of the generated catalog image',
          },
          confidence: {
            type: 'number',
            description: 'Confidence score (0-1) of the generation quality',
          },
        },
      },
    },
    {
      name: 'infer_item_attributes',
      description: 'Analyzes a clothing item image and infers attributes like category, colors, pattern, style, and occasion. Uses advanced vision AI to understand clothing characteristics.',
      inputSchema: {
        type: 'object',
        properties: {
          imageBase64: {
            type: 'string',
            description: 'Base64-encoded clothing image',
          },
          userPrompt: {
            type: 'string',
            description: 'Optional user description or context',
          },
        },
        required: ['imageBase64'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            description: 'Clothing category (e.g., "tops", "bottoms", "dresses")',
          },
          colors: {
            type: 'array',
            items: { type: 'string' },
            description: 'Dominant colors in the item',
          },
          pattern: {
            type: 'string',
            description: 'Pattern type (e.g., "solid", "striped", "floral")',
          },
          style: {
            type: 'array',
            items: { type: 'string' },
            description: 'Style tags (e.g., ["casual", "business"])',
          },
          occasion: {
            type: 'array',
            items: { type: 'string' },
            description: 'Suitable occasions (e.g., ["work", "weekend"])',
          },
          confidence: {
            type: 'object',
            description: 'Confidence scores for each attribute',
          },
        },
      },
    },
    {
      name: 'extract_label_info',
      description: 'Extracts brand and care instruction information from clothing label photos using OCR and vision AI.',
      inputSchema: {
        type: 'object',
        properties: {
          imageBase64: {
            type: 'string',
            description: 'Base64-encoded label image',
          },
        },
        required: ['imageBase64'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          brand: {
            type: 'string',
            description: 'Detected brand name',
          },
          careInstructions: {
            type: 'string',
            description: 'Care instructions text',
          },
          confidence: {
            type: 'number',
            description: 'Confidence score (0-1)',
          },
        },
      },
    },
    {
      name: 'generate_outfit',
      description: 'Generates outfit suggestions based on available wardrobe items and constraints like weather, mood, and occasion. Returns 1-5 outfit combinations optimized for decision-making.',
      inputSchema: {
        type: 'object',
        properties: {
          constraints: {
            type: 'object',
            properties: {
              weather: {
                type: 'string',
                description: 'Weather condition (e.g., "warm", "cold", "rainy")',
              },
              occasion: {
                type: 'string',
                description: 'Occasion type (e.g., "work", "casual", "formal")',
              },
              mood: {
                type: 'string',
                description: 'Desired mood/vibe (e.g., "confident", "comfortable", "bold")',
              },
              colors: {
                type: 'array',
                items: { type: 'string' },
                description: 'Preferred color palette',
              },
            },
          },
          availableItems: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                category: { type: 'string' },
                colors: { type: 'array', items: { type: 'string' } },
                style: { type: 'array', items: { type: 'string' } },
              },
            },
            description: 'Available wardrobe items to choose from',
          },
        },
        required: ['constraints', 'availableItems'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          outfits: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                items: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Item IDs in the outfit',
                },
                reasoning: {
                  type: 'string',
                  description: 'Why this outfit works',
                },
                confidence: {
                  type: 'number',
                  description: 'Confidence score (0-1)',
                },
              },
            },
          },
        },
      },
    },
  ],
  endpoints: {
    a2a: `${process.env.PUBLIC_BASE_URL || 'http://localhost:3000'}/api/a2a`,
  },
  metadata: {
    framework: 'Next.js 16 + Gemini 3',
    tags: ['wardrobe', 'fashion', 'ai', 'adhd-friendly', 'vision', 'image-generation'],
  },
};
