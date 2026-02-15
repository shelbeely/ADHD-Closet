/**
 * ACP (Agent Client Protocol) Server Implementation
 * 
 * This module implements an ACP server that exposes Twin Style wardrobe
 * management capabilities to IDE agents (Zed, JetBrains, etc.)
 */

import { ACPServerConfig, ACPTool, ACPToolCallRequest, ACPToolCallResponse } from './types';
import { prisma } from '@/app/lib/prisma';
import { mcpServer } from '@/app/lib/a2a/mcp';
import { twinStyleAgent } from '@/app/lib/a2a/agent';

/**
 * Twin Style ACP Server Configuration
 */
export const acpServerConfig: ACPServerConfig = {
  name: 'twin-style-wardrobe',
  version: '1.0.0',
  capabilities: {
    tools: true,
    resources: true,
    prompts: false,
    sampling: false,
  },
  tools: [
    {
      name: 'search_wardrobe',
      description: 'Search for clothing items in the wardrobe by category, title, or brand. Returns matching items with their details.',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query (searches in title and brand fields)',
          },
          category: {
            type: 'string',
            description: 'Filter by category (tops, bottoms, dresses, outerwear, shoes, accessories, etc.)',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of results to return (default: 10)',
          },
        },
      },
    },
    {
      name: 'get_item_details',
      description: 'Get detailed information about a specific wardrobe item including all metadata, images, and tags.',
      inputSchema: {
        type: 'object',
        properties: {
          itemId: {
            type: 'string',
            description: 'The unique ID of the item to retrieve',
          },
        },
        required: ['itemId'],
      },
    },
    {
      name: 'generate_catalog_image',
      description: 'Generate a professional catalog image from a clothing photo. Removes background and creates a clean product-style image.',
      inputSchema: {
        type: 'object',
        properties: {
          imageBase64: {
            type: 'string',
            description: 'Base64-encoded image of the clothing item',
          },
        },
        required: ['imageBase64'],
      },
    },
    {
      name: 'infer_item_category',
      description: 'Analyze a clothing image and automatically infer its category, brand, and other attributes using AI vision.',
      inputSchema: {
        type: 'object',
        properties: {
          imageBase64: {
            type: 'string',
            description: 'Base64-encoded image of the clothing item',
          },
          userDescription: {
            type: 'string',
            description: 'Optional user description to help with categorization',
          },
        },
        required: ['imageBase64'],
      },
    },
    {
      name: 'generate_outfit_suggestions',
      description: 'Generate AI-powered outfit suggestions based on available wardrobe items and constraints like weather, mood, and occasion.',
      inputSchema: {
        type: 'object',
        properties: {
          weather: {
            type: 'string',
            description: 'Weather condition (warm, cool, cold, rainy)',
          },
          occasion: {
            type: 'string',
            description: 'Occasion type (work, casual, formal, weekend)',
          },
          mood: {
            type: 'string',
            description: 'Desired mood/vibe (confident, comfortable, bold)',
          },
          maxItems: {
            type: 'number',
            description: 'Maximum number of outfit suggestions (default: 3)',
          },
        },
      },
    },
    {
      name: 'list_wardrobe_stats',
      description: 'Get statistics about the wardrobe including total items, items by category, and recent additions.',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'subscribe_events',
      description: 'Subscribe to real-time wardrobe events and notifications via WebSocket. Enables bidirectional communication for instant updates.',
      inputSchema: {
        type: 'object',
        properties: {
          types: {
            type: 'array',
            items: { type: 'string' },
            description: 'Event types to subscribe to (item/added, item/updated, job/completed, etc.). Omit for all events.',
          },
          categories: {
            type: 'array',
            items: { type: 'string' },
            description: 'Filter events by item category (tops, bottoms, etc.)',
          },
          itemIds: {
            type: 'array',
            items: { type: 'string' },
            description: 'Filter events for specific item IDs',
          },
        },
      },
    },
  ],
};

/**
 * ACP Tool Executor
 * 
 * Executes ACP tool calls and returns responses
 */
export class ACPToolExecutor {
  async executeTool(request: ACPToolCallRequest): Promise<ACPToolCallResponse> {
    console.log(`Executing ACP tool: ${request.name}`, request.arguments);

    try {
      switch (request.name) {
        case 'search_wardrobe':
          return await this.searchWardrobe(request.arguments);
        
        case 'get_item_details':
          return await this.getItemDetails(request.arguments);
        
        case 'generate_catalog_image':
          return await this.generateCatalogImage(request.arguments);
        
        case 'infer_item_category':
          return await this.inferItemCategory(request.arguments);
        
        case 'generate_outfit_suggestions':
          return await this.generateOutfitSuggestions(request.arguments);
        
        case 'list_wardrobe_stats':
          return await this.listWardrobeStats();
        
        default:
          return {
            content: [{
              type: 'text',
              text: `Unknown tool: ${request.name}`,
            }],
            isError: true,
          };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error executing ACP tool ${request.name}:`, error);
      
      return {
        content: [{
          type: 'text',
          text: `Error: ${errorMessage}`,
        }],
        isError: true,
      };
    }
  }

  private async searchWardrobe(args: Record<string, unknown>): Promise<ACPToolCallResponse> {
    const query = args.query as string | undefined;
    const category = args.category as string | undefined;
    const limit = (args.limit as number) || 10;

    const where: Record<string, unknown> = {};
    
    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { brand: { contains: query, mode: 'insensitive' } },
      ];
    }
    
    if (category) {
      where.category = category;
    }

    const items = await prisma.item.findMany({
      where,
      take: limit,
      select: {
        id: true,
        title: true,
        category: true,
        brand: true,
        state: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const resultText = items.length > 0
      ? `Found ${items.length} item(s):\n\n${items.map((item, idx) => 
          `${idx + 1}. ${item.title || 'Untitled'} (${item.category || 'uncategorized'})\n   ID: ${item.id}\n   Brand: ${item.brand || 'Unknown'}\n   State: ${item.state}`
        ).join('\n\n')}`
      : 'No items found matching the criteria.';

    return {
      content: [{
        type: 'text',
        text: resultText,
      }],
    };
  }

  private async getItemDetails(args: Record<string, unknown>): Promise<ACPToolCallResponse> {
    const itemId = args.itemId as string;

    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: {
        images: true,
        tags: true,
      },
    });

    if (!item) {
      return {
        content: [{
          type: 'text',
          text: `Item not found: ${itemId}`,
        }],
        isError: true,
      };
    }

    const details = `Item Details:
ID: ${item.id}
Title: ${item.title || 'Untitled'}
Category: ${item.category || 'uncategorized'}
Brand: ${item.brand || 'Unknown'}
State: ${item.state}
Size: ${item.sizeText || 'N/A'}
Materials: ${item.materials || 'N/A'}
Storage: ${item.storageType || 'N/A'}
Location: ${item.locationInCloset || 'N/A'}
Clean Status: ${item.cleanStatus}
Current Wears: ${item.currentWears}/${item.wearsBeforeWash}
Last Worn: ${item.lastWornDate ? new Date(item.lastWornDate).toLocaleDateString() : 'Never'}
Images: ${item.images.length}
Tags: ${item.tags.map(t => t.tagId).join(', ') || 'None'}`;

    return {
      content: [{
        type: 'text',
        text: details,
      }],
    };
  }

  private async generateCatalogImage(args: Record<string, unknown>): Promise<ACPToolCallResponse> {
    const imageBase64 = args.imageBase64 as string;

    const result = await twinStyleAgent.executeSkill('generate_catalog_image', { imageBase64 }) as Record<string, unknown>;

    return {
      content: [{
        type: 'text',
        text: `Catalog image generated successfully.\nImage URL: ${result.generatedImageUrl}\nConfidence: ${result.confidence}`,
      }],
    };
  }

  private async inferItemCategory(args: Record<string, unknown>): Promise<ACPToolCallResponse> {
    const imageBase64 = args.imageBase64 as string;
    const userDescription = args.userDescription as string | undefined;

    const result = await twinStyleAgent.executeSkill('infer_item_attributes', {
      imageBase64,
      userPrompt: userDescription,
    }) as Record<string, unknown>;

    const resultText = `Item Attributes Inferred:
Category: ${result.category}
Brand: ${result.brand || 'Unknown'}
Title: ${result.title || 'N/A'}`;

    return {
      content: [{
        type: 'text',
        text: resultText,
      }],
    };
  }

  private async generateOutfitSuggestions(args: Record<string, unknown>): Promise<ACPToolCallResponse> {
    const constraints = {
      weather: args.weather as string | undefined,
      occasion: args.occasion as string | undefined,
      mood: args.mood as string | undefined,
    };

    // Fetch available items
    const availableItems = await mcpServer.callTool(
      'wardrobe-database',
      'get_available_items',
      { limit: 50 }
    ) as Array<Record<string, unknown>>;

    const result = await twinStyleAgent.executeSkill('generate_outfit', {
      constraints,
      availableItems,
    }) as Record<string, unknown>;

    const outfits = result.outfits as Array<Record<string, unknown>>;
    const maxItems = (args.maxItems as number) || 3;
    const limitedOutfits = outfits.slice(0, maxItems);

    const resultText = `Generated ${limitedOutfits.length} outfit suggestion(s):\n\n${limitedOutfits.map((outfit, idx) => {
      const items = outfit.items as string[];
      return `${idx + 1}. Outfit:\n   Items: ${items.join(', ')}\n   Reasoning: ${outfit.reasoning}\n   Confidence: ${outfit.confidence}`;
    }).join('\n\n')}`;

    return {
      content: [{
        type: 'text',
        text: resultText,
      }],
    };
  }

  private async listWardrobeStats(): Promise<ACPToolCallResponse> {
    const [totalCount, categoryStats, recentItems] = await Promise.all([
      prisma.item.count(),
      prisma.item.groupBy({
        by: ['category'],
        _count: true,
      }),
      prisma.item.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          title: true,
          category: true,
          createdAt: true,
        },
      }),
    ]);

    const stats = `Wardrobe Statistics:

Total Items: ${totalCount}

Items by Category:
${categoryStats.map(stat => `  ${stat.category || 'uncategorized'}: ${stat._count}`).join('\n')}

Recent Additions:
${recentItems.map((item, idx) => 
  `${idx + 1}. ${item.title || 'Untitled'} (${item.category || 'uncategorized'}) - ${new Date(item.createdAt).toLocaleDateString()}`
).join('\n')}`;

    return {
      content: [{
        type: 'text',
        text: stats,
      }],
    };
  }
}

// Export singleton instance
export const acpToolExecutor = new ACPToolExecutor();

  private async subscribeEvents(args: Record<string, unknown>): Promise<ACPToolCallResponse> {
    return {
      content: [{
        type: 'text',
        text: 'To subscribe to events, connect to GET /api/acp/events with query parameters: types, categories, itemIds',
      }],
    };
  }

  // CONTROL TOOLS FOR EXTERNAL AGENTS

  private async addItemTool(args: Record<string, unknown>): Promise<ACPToolCallResponse> {
    const { addItem, AddItemSchema } = await import('./control-tools');
    try {
      const validated = AddItemSchema.parse(args);
      const result = await addItem(validated);
      
      return {
        content: [{
          type: 'text',
          text: `Item added successfully!\nItem ID: ${result.itemId}\n${result.message}`,
        }],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        content: [{
          type: 'text',
          text: `Failed to add item: ${errorMessage}`,
        }],
        isError: true,
      };
    }
  }

  private async updateItemTool(args: Record<string, unknown>): Promise<ACPToolCallResponse> {
    const { updateItem, UpdateItemSchema } = await import('./control-tools');
    try {
      const validated = UpdateItemSchema.parse(args);
      const result = await updateItem(validated);
      
      return {
        content: [{
          type: 'text',
          text: `Item updated successfully!\nItem ID: ${result.itemId}`,
        }],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        content: [{
          type: 'text',
          text: `Failed to update item: ${errorMessage}`,
        }],
        isError: true,
      };
    }
  }

  private async deleteItemTool(args: Record<string, unknown>): Promise<ACPToolCallResponse> {
    const { deleteItem, DeleteItemSchema } = await import('./control-tools');
    try {
      const validated = DeleteItemSchema.parse(args);
      const result = await deleteItem(validated);
      
      return {
        content: [{
          type: 'text',
          text: `Item deleted successfully!\nItem ID: ${result.itemId}`,
        }],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        content: [{
          type: 'text',
          text: `Failed to delete item: ${errorMessage}`,
        }],
        isError: true,
      };
    }
  }

  private async triggerAIJobTool(args: Record<string, unknown>): Promise<ACPToolCallResponse> {
    const { triggerAIJob, TriggerAIJobSchema } = await import('./control-tools');
    try {
      const validated = TriggerAIJobSchema.parse(args);
      const result = await triggerAIJob(validated);
      
      return {
        content: [{
          type: 'text',
          text: `AI job triggered successfully!\nJob ID: ${result.jobId}\nResult: ${JSON.stringify(result.result, null, 2)}`,
        }],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        content: [{
          type: 'text',
          text: `Failed to trigger AI job: ${errorMessage}`,
        }],
        isError: true,
      };
    }
  }

  private async batchOperationsTool(args: Record<string, unknown>): Promise<ACPToolCallResponse> {
    const { batchOperations, BatchOperationsSchema } = await import('./control-tools');
    try {
      const validated = BatchOperationsSchema.parse(args);
      const result = await batchOperations(validated);
      
      return {
        content: [{
          type: 'text',
          text: `Batch operations completed!\nOperations: ${result.operations}\nResults: ${JSON.stringify(result.results, null, 2)}`,
        }],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        content: [{
          type: 'text',
          text: `Failed to execute batch operations: ${errorMessage}`,
        }],
        isError: true,
      };
    }
  }

  private async importItemsBulkTool(args: Record<string, unknown>): Promise<ACPToolCallResponse> {
    const { importItemsBulk, ImportItemsBulkSchema } = await import('./control-tools');
    try {
      const validated = ImportItemsBulkSchema.parse(args);
      const result = await importItemsBulk(validated);
      
      return {
        content: [{
          type: 'text',
          text: `Bulk import completed!\nImported: ${result.imported} items`,
        }],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        content: [{
          type: 'text',
          text: `Failed to import items: ${errorMessage}`,
        }],
        isError: true,
      };
    }
  }

  private async exportWardrobeTool(): Promise<ACPToolCallResponse> {
    const { exportWardrobe } = await import('./control-tools');
    try {
      const result = await exportWardrobe();
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result, null, 2),
        }],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        content: [{
          type: 'text',
          text: `Failed to export wardrobe: ${errorMessage}`,
        }],
        isError: true,
      };
    }
  }
}

// Export singleton instance
export const acpToolExecutor = new ACPToolExecutor();
