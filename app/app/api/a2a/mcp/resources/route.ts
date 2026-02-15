/**
 * MCP Resources Endpoint
 * 
 * GET /api/a2a/mcp/resources?dataSource={name}
 * GET /api/a2a/mcp/resources?dataSource={name}&uri={uri}
 */

import { NextRequest, NextResponse } from 'next/server';
import { mcpServer } from '@/app/lib/a2a/mcp';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dataSource = searchParams.get('dataSource') || 'wardrobe-database';
    const uri = searchParams.get('uri');

    if (uri) {
      // Read specific resource
      const resource = await mcpServer.readResource(dataSource, uri);
      return NextResponse.json(resource);
    } else {
      // List all resources
      const resources = await mcpServer.listResources(dataSource);
      return NextResponse.json({ resources });
    }
  } catch (error) {
    console.error('MCP Resources Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
