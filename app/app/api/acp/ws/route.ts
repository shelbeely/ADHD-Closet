/**
 * ACP WebSocket Endpoint
 * 
 * Note: This endpoint provides WebSocket upgrade instructions.
 * Actual WebSocket handling requires a custom server or edge runtime.
 * 
 * For development, use a separate WebSocket server or configure Next.js
 * with a custom server that handles WebSocket upgrades.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Check if client is requesting WebSocket upgrade
  const upgradeHeader = request.headers.get('upgrade');
  
  if (upgradeHeader === 'websocket') {
    return new NextResponse(
      JSON.stringify({
        error: 'WebSocket connections require a custom server setup',
        instructions: {
          message: 'To use bidirectional ACP communication:',
          steps: [
            '1. Start the WebSocket server separately (if available)',
            '2. Connect to ws://localhost:3001/acp (or configured port)',
            '3. Or use HTTP-based long polling as fallback',
          ],
          alternativeEndpoint: '/api/acp/events (Server-Sent Events)',
        },
      }),
      {
        status: 426,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

  // Regular HTTP GET - return info about WebSocket support
  return NextResponse.json({
    protocol: 'ACP WebSocket',
    version: '1.0.0',
    status: 'WebSocket support requires custom server setup',
    capabilities: {
      bidirectional: true,
      notifications: true,
      subscriptions: true,
    },
    documentation: '/docs/developer/ACP_INTEGRATION.md#websocket-support',
  });
}
