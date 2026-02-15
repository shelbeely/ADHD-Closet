/**
 * A2A Protocol Endpoint - Agent Discovery
 * 
 * GET /.well-known/agent-card.json
 * 
 * This endpoint serves the agent card for discovery by other A2A clients.
 */

import { NextRequest, NextResponse } from 'next/server';
import { twinStyleAgentCard } from '@/app/lib/a2a/agent-card';

export async function GET() {
  return NextResponse.json(twinStyleAgentCard, {
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
