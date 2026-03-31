/**
 * ACP Capabilities Endpoint
 * 
 * GET /api/acp/capabilities
 * 
 * Returns the ACP server capabilities and available tools
 */

import { NextResponse } from 'next/server';
import { acpServerConfig } from '@/app/lib/acp/server';

export async function GET() {
  return NextResponse.json({
    serverInfo: {
      name: acpServerConfig.name,
      version: acpServerConfig.version,
    },
    capabilities: acpServerConfig.capabilities,
    tools: acpServerConfig.tools,
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
