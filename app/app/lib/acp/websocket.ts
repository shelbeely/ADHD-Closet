/**
 * ACP WebSocket Manager
 * 
 * Manages WebSocket connections for bidirectional ACP communication
 */

import { WebSocket } from 'ws';
import { notificationManager, EventSubscriptionSchema, ACPNotification } from './notifications';
import { acpToolExecutor } from './server';
import { z } from 'zod';

/**
 * JSON-RPC 2.0 Request Schema
 */
const JSONRPCRequestSchema = z.object({
  jsonrpc: z.literal('2.0'),
  id: z.union([z.string(), z.number()]).optional(),
  method: z.string(),
  params: z.record(z.unknown()).optional(),
});

type JSONRPCRequest = z.infer<typeof JSONRPCRequestSchema>;

/**
 * JSON-RPC 2.0 Response
 */
interface JSONRPCResponse {
  jsonrpc: '2.0';
  id?: string | number;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

/**
 * WebSocket Connection Manager
 */
export class ACPWebSocketManager {
  private connections: Map<string, WebSocket> = new Map();
  private connectionCounter = 0;

  /**
   * Handle new WebSocket connection
   */
  handleConnection(ws: WebSocket): string {
    const connectionId = `acp-ws-${++this.connectionCounter}`;
    this.connections.set(connectionId, ws);

    console.log(`ACP WebSocket: Client ${connectionId} connected`);

    // Set up message handler
    ws.on('message', async (data: Buffer) => {
      await this.handleMessage(connectionId, data.toString());
    });

    // Set up close handler
    ws.on('close', () => {
      this.handleDisconnect(connectionId);
    });

    // Set up error handler
    ws.on('error', (error) => {
      console.error(`ACP WebSocket: Error on ${connectionId}:`, error);
    });

    // Send welcome message
    this.sendNotification(connectionId, {
      jsonrpc: '2.0',
      method: 'notification',
      params: {
        type: 'connection/established',
        data: { connectionId },
        timestamp: new Date().toISOString(),
      },
    } as ACPNotification);

    return connectionId;
  }

  /**
   * Handle incoming WebSocket message
   */
  private async handleMessage(connectionId: string, message: string): Promise<void> {
    try {
      const data = JSON.parse(message);
      const request = JSONRPCRequestSchema.parse(data);

      console.log(`ACP WebSocket: Received ${request.method} from ${connectionId}`);

      // Handle different methods
      switch (request.method) {
        case 'subscribe':
          await this.handleSubscribe(connectionId, request);
          break;
        
        case 'unsubscribe':
          await this.handleUnsubscribe(connectionId, request);
          break;
        
        case 'tool/execute':
          await this.handleToolExecute(connectionId, request);
          break;
        
        default:
          this.sendError(connectionId, request.id, -32601, `Method not found: ${request.method}`);
      }
    } catch (error) {
      console.error(`ACP WebSocket: Error handling message from ${connectionId}:`, error);
      
      if (error instanceof z.ZodError) {
        this.sendError(connectionId, undefined, -32600, 'Invalid Request', error.errors);
      } else {
        this.sendError(connectionId, undefined, -32603, 'Internal error');
      }
    }
  }

  /**
   * Handle subscribe request
   */
  private async handleSubscribe(connectionId: string, request: JSONRPCRequest): Promise<void> {
    try {
      const subscription = EventSubscriptionSchema.parse(request.params || {});
      
      // Register the listener with notification manager
      notificationManager.subscribe(connectionId, subscription, (notification) => {
        this.sendNotification(connectionId, notification);
      });

      this.sendResponse(connectionId, request.id, {
        success: true,
        message: 'Subscribed to events',
        subscription,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.sendError(connectionId, request.id, -32602, `Invalid params: ${errorMessage}`);
    }
  }

  /**
   * Handle unsubscribe request
   */
  private async handleUnsubscribe(connectionId: string, request: JSONRPCRequest): Promise<void> {
    notificationManager.unsubscribe(connectionId);
    this.sendResponse(connectionId, request.id, {
      success: true,
      message: 'Unsubscribed from events',
    });
  }

  /**
   * Handle tool execution request (same as HTTP endpoint)
   */
  private async handleToolExecute(connectionId: string, request: JSONRPCRequest): Promise<void> {
    try {
      const { name, arguments: args } = request.params as { name: string; arguments: Record<string, unknown> };
      
      const response = await acpToolExecutor.executeTool({
        name,
        arguments: args,
      });

      this.sendResponse(connectionId, request.id, response);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.sendError(connectionId, request.id, -32603, errorMessage);
    }
  }

  /**
   * Handle disconnection
   */
  private handleDisconnect(connectionId: string): void {
    console.log(`ACP WebSocket: Client ${connectionId} disconnected`);
    this.connections.delete(connectionId);
    notificationManager.unsubscribe(connectionId);
  }

  /**
   * Send JSON-RPC response
   */
  private sendResponse(connectionId: string, id: string | number | undefined, result: unknown): void {
    const ws = this.connections.get(connectionId);
    if (!ws) return;

    const response: JSONRPCResponse = {
      jsonrpc: '2.0',
      id,
      result,
    };

    ws.send(JSON.stringify(response));
  }

  /**
   * Send JSON-RPC error
   */
  private sendError(
    connectionId: string,
    id: string | number | undefined,
    code: number,
    message: string,
    data?: unknown
  ): void {
    const ws = this.connections.get(connectionId);
    if (!ws) return;

    const response: JSONRPCResponse = {
      jsonrpc: '2.0',
      id,
      error: {
        code,
        message,
        data,
      },
    };

    ws.send(JSON.stringify(response));
  }

  /**
   * Send notification to a specific connection
   */
  private sendNotification(connectionId: string, notification: ACPNotification): void {
    const ws = this.connections.get(connectionId);
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      return;
    }

    ws.send(JSON.stringify(notification));
  }

  /**
   * Get number of active connections
   */
  getConnectionCount(): number {
    return this.connections.size;
  }

  /**
   * Close all connections
   */
  closeAll(): void {
    this.connections.forEach((ws, connectionId) => {
      console.log(`ACP WebSocket: Closing connection ${connectionId}`);
      ws.close();
    });
    this.connections.clear();
  }
}

// Global WebSocket manager instance
export const acpWebSocketManager = new ACPWebSocketManager();
