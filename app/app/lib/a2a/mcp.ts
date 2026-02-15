/**
 * MCP (Model Context Protocol) Integration
 * 
 * This module provides MCP integration for Twin Style A2A agents,
 * allowing agents to connect to external data sources.
 */

import { prisma } from '@/app/lib/prisma';

/**
 * MCP Resource definition
 */
export interface MCPResource {
  uri: string;
  name: string;
  description: string;
  mimeType?: string;
}

/**
 * MCP Tool definition
 */
export interface MCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

/**
 * MCP Data Source Interface
 */
export interface MCPDataSource {
  name: string;
  listResources(): Promise<MCPResource[]>;
  readResource(uri: string): Promise<unknown>;
  listTools(): Promise<MCPTool[]>;
  callTool(name: string, args: unknown): Promise<unknown>;
}

/**
 * Wardrobe Database MCP Data Source
 * 
 * Provides access to the wardrobe database via MCP protocol.
 */
export class WardrobeDataSource implements MCPDataSource {
  name = 'wardrobe-database';

  async listResources(): Promise<MCPResource[]> {
    const items = await prisma.item.findMany({
      select: { id: true, name: true, category: true },
      take: 100,
    });

    return items.map(item => ({
      uri: `wardrobe://items/${item.id}`,
      name: item.name || `Item ${item.id}`,
      description: `Wardrobe item in category: ${item.category || 'uncategorized'}`,
      mimeType: 'application/json',
    }));
  }

  async readResource(uri: string): Promise<unknown> {
    // Parse URI: wardrobe://items/{id}
    const match = uri.match(/wardrobe:\/\/items\/(.+)/);
    if (!match) {
      throw new Error(`Invalid resource URI: ${uri}`);
    }

    const itemId = match[1];
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: {
        images: true,
        tags: true,
      },
    });

    if (!item) {
      throw new Error(`Item not found: ${itemId}`);
    }

    return {
      id: item.id,
      name: item.name,
      category: item.category,
      colors: item.colors,
      pattern: item.pattern,
      style: item.style,
      occasion: item.occasion,
      season: item.season,
      brand: item.brand,
      images: item.images.map(img => ({
        kind: img.kind,
        filePath: img.filePath,
      })),
      tags: item.tags.map(tag => tag.name),
    };
  }

  async listTools(): Promise<MCPTool[]> {
    return [
      {
        name: 'search_items',
        description: 'Search wardrobe items by category, color, style, or occasion',
        inputSchema: {
          type: 'object',
          properties: {
            category: { type: 'string' },
            colors: { type: 'array', items: { type: 'string' } },
            style: { type: 'array', items: { type: 'string' } },
            occasion: { type: 'array', items: { type: 'string' } },
            season: { type: 'string' },
          },
        },
      },
      {
        name: 'get_item_by_id',
        description: 'Get a specific item by its ID',
        inputSchema: {
          type: 'object',
          properties: {
            itemId: { type: 'string', description: 'The item ID' },
          },
          required: ['itemId'],
        },
      },
      {
        name: 'get_available_items',
        description: 'Get all available items in the wardrobe',
        inputSchema: {
          type: 'object',
          properties: {
            limit: { type: 'number', description: 'Maximum number of items to return' },
          },
        },
      },
    ];
  }

  async callTool(name: string, args: unknown): Promise<unknown> {
    switch (name) {
      case 'search_items':
        return await this.searchItems(args);
      
      case 'get_item_by_id':
        return await this.getItemById(args.itemId);
      
      case 'get_available_items':
        return await this.getAvailableItems(args.limit || 50);
      
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  private async searchItems(filters: Record<string, unknown>): Promise<Array<Record<string, unknown>>> {
    const where: Record<string, unknown> = {};

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.colors && Array.isArray(filters.colors)) {
      where.colors = {
        hasSome: filters.colors,
      };
    }

    if (filters.style && Array.isArray(filters.style)) {
      where.style = {
        hasSome: filters.style,
      };
    }

    if (filters.occasion && Array.isArray(filters.occasion)) {
      where.occasion = {
        hasSome: filters.occasion,
      };
    }

    if (filters.season) {
      where.season = filters.season;
    }

    const items = await prisma.item.findMany({
      where,
      include: {
        images: {
          where: { kind: 'catalog_main' },
          take: 1,
        },
      },
      take: 20,
    });

    return items.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      colors: item.colors,
      style: item.style,
      occasion: item.occasion,
      season: item.season,
      imageUrl: item.images[0]?.filePath,
    }));
  }

  private async getItemById(itemId: string): Promise<unknown> {
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: {
        images: true,
        tags: true,
      },
    });

    if (!item) {
      throw new Error(`Item not found: ${itemId}`);
    }

    return {
      id: item.id,
      name: item.name,
      category: item.category,
      colors: item.colors,
      pattern: item.pattern,
      style: item.style,
      occasion: item.occasion,
      season: item.season,
      brand: item.brand,
      images: item.images,
      tags: item.tags,
    };
  }

  private async getAvailableItems(limit: number): Promise<Array<Record<string, unknown>>> {
    const items = await prisma.item.findMany({
      include: {
        images: {
          where: { kind: 'catalog_main' },
          take: 1,
        },
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return items.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      colors: item.colors,
      style: item.style,
      occasion: item.occasion,
      season: item.season,
      imageUrl: item.images[0]?.filePath,
    }));
  }
}

/**
 * MCP Server that exposes data sources to A2A agents
 */
export class MCPServer {
  private dataSources: Map<string, MCPDataSource> = new Map();

  registerDataSource(dataSource: MCPDataSource) {
    this.dataSources.set(dataSource.name, dataSource);
    console.log(`Registered MCP data source: ${dataSource.name}`);
  }

  async listResources(dataSourceName: string): Promise<MCPResource[]> {
    const dataSource = this.dataSources.get(dataSourceName);
    if (!dataSource) {
      throw new Error(`Data source not found: ${dataSourceName}`);
    }
    return await dataSource.listResources();
  }

  async readResource(dataSourceName: string, uri: string): Promise<unknown> {
    const dataSource = this.dataSources.get(dataSourceName);
    if (!dataSource) {
      throw new Error(`Data source not found: ${dataSourceName}`);
    }
    return await dataSource.readResource(uri);
  }

  async listTools(dataSourceName: string): Promise<MCPTool[]> {
    const dataSource = this.dataSources.get(dataSourceName);
    if (!dataSource) {
      throw new Error(`Data source not found: ${dataSourceName}`);
    }
    return await dataSource.listTools();
  }

  async callTool(dataSourceName: string, toolName: string, args: unknown): Promise<unknown> {
    const dataSource = this.dataSources.get(dataSourceName);
    if (!dataSource) {
      throw new Error(`Data source not found: ${dataSourceName}`);
    }
    return await dataSource.callTool(toolName, args);
  }
}

// Initialize MCP server with wardrobe data source
export const mcpServer = new MCPServer();
mcpServer.registerDataSource(new WardrobeDataSource());
