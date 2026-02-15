/**
 * MCP Tools Endpoint
 * 
 * GET /api/a2a/mcp/tools?dataSource={name} - List available tools
 * POST /api/a2a/mcp/tools - Execute a tool
 */

import { NextRequest, NextResponse } from 'next/server';
import { mcpServer } from '@/app/lib/a2a/mcp';
import { z } from 'zod';

const ToolCallSchema = z.object({
  dataSource: z.string().default('wardrobe-database'),
  toolName: z.string(),
  args: z.any(),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dataSource = searchParams.get('dataSource') || 'wardrobe-database';

    const tools = await mcpServer.listTools(dataSource);
    return NextResponse.json({ tools });
  } catch (error) {
    console.error('MCP Tools List Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dataSource, toolName, args } = ToolCallSchema.parse(body);

    const result = await mcpServer.callTool(dataSource, toolName, args);
    return NextResponse.json({ result });
  } catch (error) {
    console.error('MCP Tool Call Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: errorMessage.includes('not found') ? 404 : 500 }
    );
  }
}
