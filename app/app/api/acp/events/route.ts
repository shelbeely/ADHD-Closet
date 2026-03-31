/**
 * ACP Server-Sent Events (SSE) Endpoint
 * 
 * Provides server-to-client notifications using SSE as an alternative
 * to WebSockets for bidirectional communication.
 */

import { NextRequest } from 'next/server';
import { notificationManager, EventSubscriptionSchema } from '@/app/lib/acp/notifications';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Parse subscription params from URL
  const searchParams = request.nextUrl.searchParams;
  const typesParam = searchParams.get('types');
  const categoriesParam = searchParams.get('categories');
  const itemIdsParam = searchParams.get('itemIds');

  const subscription = EventSubscriptionSchema.parse({
    types: typesParam ? typesParam.split(',') : undefined,
    categories: categoriesParam ? categoriesParam.split(',') : undefined,
    itemIds: itemIdsParam ? itemIdsParam.split(',') : undefined,
  });

  // Create a TransformStream for SSE
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();

  // Generate unique connection ID
  const connectionId = `acp-sse-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Send initial connection message
  const sendSSE = async (data: string) => {
    try {
      await writer.write(encoder.encode(`data: ${data}\n\n`));
    } catch (error) {
      console.error('SSE write error:', error);
    }
  };

  // Register listener with notification manager
  notificationManager.subscribe(connectionId, subscription, async (notification) => {
    await sendSSE(JSON.stringify(notification));
  });

  // Send initial connection established message
  await sendSSE(JSON.stringify({
    jsonrpc: '2.0',
    method: 'notification',
    params: {
      type: 'connection/established',
      data: {
        connectionId,
        subscription,
      },
      timestamp: new Date().toISOString(),
    },
  }));

  // Send keep-alive pings every 30 seconds
  const keepAliveInterval = setInterval(async () => {
    await sendSSE(JSON.stringify({
      jsonrpc: '2.0',
      method: 'notification',
      params: {
        type: 'connection/ping',
        data: {},
        timestamp: new Date().toISOString(),
      },
    }));
  }, 30000);

  // Clean up on client disconnect
  request.signal.addEventListener('abort', () => {
    console.log(`ACP SSE: Client ${connectionId} disconnected`);
    clearInterval(keepAliveInterval);
    notificationManager.unsubscribe(connectionId);
    writer.close();
  });

  // Return SSE response
  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  });
}
