/**
 * ACP Tools Endpoint
 * 
 * POST /api/acp/tools
 * 
 * Executes ACP tool calls
 */

import { NextRequest, NextResponse } from 'next/server';
import { acpToolExecutor } from '@/app/lib/acp/server';
import { z } from 'zod';

const ACPToolCallSchema = z.object({
  name: z.string(),
  arguments: z.record(z.unknown()),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, arguments: args } = ACPToolCallSchema.parse(body);

    const response = await acpToolExecutor.executeTool({
      name,
      arguments: args,
    });

    return NextResponse.json(response, {
      status: response.isError ? 500 : 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('ACP Tool Error:', error);
    
    return NextResponse.json({
      content: [{
        type: 'text',
        text: `Error: ${errorMessage}`,
      }],
      isError: true,
    }, {
      status: 500,
    });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
