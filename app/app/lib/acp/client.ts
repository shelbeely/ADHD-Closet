/**
 * ACP Client Implementation
 * 
 * Enables Twin Style to connect to and control other ACP servers/agents
 * Making it a full bidirectional ACP participant
 */

import { z } from 'zod';

/**
 * External ACP Server Configuration
 */
export interface ACPServerConfig {
  id: string;
  name: string;
  url: string;
  eventsUrl?: string;
  apiKey?: string;
  enabled: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Tool Definition from External Server
 */
export interface ExternalTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

/**
 * Server Capabilities
 */
export interface ServerCapabilities {
  serverInfo: {
    name: string;
    version: string;
  };
  capabilities: {
    tools?: boolean;
    resources?: boolean;
    prompts?: boolean;
    sampling?: boolean;
  };
  tools: ExternalTool[];
}

/**
 * ACP Client
 * 
 * Manages connections to external ACP servers
 */
export class ACPClient {
  private servers: Map<string, ACPServerConfig> = new Map();
  private capabilities: Map<string, ServerCapabilities> = new Map();
  private eventSources: Map<string, EventSource> = new Map();

  /**
   * Register an external ACP server
   */
  async registerServer(config: ACPServerConfig): Promise<void> {
    this.servers.set(config.id, config);
    
    // Fetch capabilities
    if (config.enabled) {
      await this.fetchCapabilities(config.id);
    }
    
    console.log(`ACP Client: Registered server ${config.name} (${config.id})`);
  }

  /**
   * Unregister a server
   */
  unregisterServer(serverId: string): void {
    this.servers.delete(serverId);
    this.capabilities.delete(serverId);
    
    // Close event source if exists
    const eventSource = this.eventSources.get(serverId);
    if (eventSource) {
      eventSource.close();
      this.eventSources.delete(serverId);
    }
    
    console.log(`ACP Client: Unregistered server ${serverId}`);
  }

  /**
   * Fetch capabilities from an external server
   */
  async fetchCapabilities(serverId: string): Promise<ServerCapabilities | null> {
    const server = this.servers.get(serverId);
    if (!server) {
      throw new Error(`Server not found: ${serverId}`);
    }

    try {
      const response = await fetch(`${server.url}/capabilities`, {
        headers: server.apiKey ? {
          'Authorization': `Bearer ${server.apiKey}`,
        } : {},
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const capabilities = await response.json() as ServerCapabilities;
      this.capabilities.set(serverId, capabilities);
      
      console.log(`ACP Client: Fetched capabilities from ${server.name}:`, capabilities.tools.length, 'tools');
      
      return capabilities;
    } catch (error) {
      console.error(`ACP Client: Failed to fetch capabilities from ${server.name}:`, error);
      return null;
    }
  }

  /**
   * Execute a tool on an external server
   */
  async executeToolOnServer(
    serverId: string,
    toolName: string,
    args: Record<string, unknown>
  ): Promise<unknown> {
    const server = this.servers.get(serverId);
    if (!server) {
      throw new Error(`Server not found: ${serverId}`);
    }

    if (!server.enabled) {
      throw new Error(`Server is disabled: ${serverId}`);
    }

    try {
      const response = await fetch(`${server.url}/tools`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(server.apiKey ? { 'Authorization': `Bearer ${server.apiKey}` } : {}),
        },
        body: JSON.stringify({
          name: toolName,
          arguments: args,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`ACP Client: Executed ${toolName} on ${server.name}`);
      
      return result;
    } catch (error) {
      console.error(`ACP Client: Failed to execute ${toolName} on ${server.name}:`, error);
      throw error;
    }
  }

  /**
   * Subscribe to events from an external server
   */
  subscribeToServerEvents(
    serverId: string,
    eventTypes?: string[],
    onNotification?: (notification: unknown) => void
  ): void {
    const server = this.servers.get(serverId);
    if (!server) {
      throw new Error(`Server not found: ${serverId}`);
    }

    if (!server.eventsUrl) {
      throw new Error(`Server ${serverId} does not support events`);
    }

    // Close existing connection if any
    const existing = this.eventSources.get(serverId);
    if (existing) {
      existing.close();
    }

    // Build URL with filters
    let url = server.eventsUrl;
    if (eventTypes && eventTypes.length > 0) {
      url += `?types=${eventTypes.join(',')}`;
    }

    // Create new EventSource
    const eventSource = new EventSource(url);
    
    eventSource.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data);
        console.log(`ACP Client: Received notification from ${server.name}:`, notification);
        
        if (onNotification) {
          onNotification(notification);
        }
      } catch (error) {
        console.error('Failed to parse notification:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error(`ACP Client: Event source error from ${server.name}:`, error);
    };

    this.eventSources.set(serverId, eventSource);
    console.log(`ACP Client: Subscribed to events from ${server.name}`);
  }

  /**
   * Unsubscribe from server events
   */
  unsubscribeFromServerEvents(serverId: string): void {
    const eventSource = this.eventSources.get(serverId);
    if (eventSource) {
      eventSource.close();
      this.eventSources.delete(serverId);
      console.log(`ACP Client: Unsubscribed from ${serverId}`);
    }
  }

  /**
   * Get all registered servers
   */
  getServers(): ACPServerConfig[] {
    return Array.from(this.servers.values());
  }

  /**
   * Get server by ID
   */
  getServer(serverId: string): ACPServerConfig | undefined {
    return this.servers.get(serverId);
  }

  /**
   * Get capabilities for a server
   */
  getServerCapabilities(serverId: string): ServerCapabilities | undefined {
    return this.capabilities.get(serverId);
  }

  /**
   * List all available tools across all servers
   */
  getAllTools(): Array<{ serverId: string; serverName: string; tool: ExternalTool }> {
    const allTools: Array<{ serverId: string; serverName: string; tool: ExternalTool }> = [];
    
    for (const [serverId, capabilities] of this.capabilities) {
      const server = this.servers.get(serverId);
      if (server && server.enabled) {
        for (const tool of capabilities.tools) {
          allTools.push({
            serverId,
            serverName: server.name,
            tool,
          });
        }
      }
    }
    
    return allTools;
  }

  /**
   * Health check for a server
   */
  async checkServerHealth(serverId: string): Promise<boolean> {
    const server = this.servers.get(serverId);
    if (!server) {
      return false;
    }

    try {
      const response = await fetch(`${server.url}/capabilities`, {
        method: 'GET',
        headers: server.apiKey ? {
          'Authorization': `Bearer ${server.apiKey}`,
        } : {},
      });
      
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Close all connections
   */
  closeAll(): void {
    this.eventSources.forEach((eventSource) => eventSource.close());
    this.eventSources.clear();
    console.log('ACP Client: All connections closed');
  }
}

// Global ACP client instance
export const acpClient = new ACPClient();

/**
 * Predefined Server Templates
 */
export const SERVER_TEMPLATES = {
  weather: {
    id: 'weather-agent',
    name: 'Weather Agent',
    url: 'http://localhost:3002/api/acp',
    eventsUrl: 'http://localhost:3002/api/acp/events',
    enabled: false,
    metadata: {
      category: 'utility',
      description: 'Provides weather forecasts for outfit recommendations',
    },
  },
  calendar: {
    id: 'calendar-agent',
    name: 'Calendar Agent',
    url: 'http://localhost:3003/api/acp',
    eventsUrl: 'http://localhost:3003/api/acp/events',
    enabled: false,
    metadata: {
      category: 'productivity',
      description: 'Integrates with calendar for daily outfit planning',
    },
  },
  fashion_ai: {
    id: 'fashion-ai',
    name: 'Fashion AI Assistant',
    url: 'http://localhost:3004/api/acp',
    eventsUrl: 'http://localhost:3004/api/acp/events',
    enabled: false,
    metadata: {
      category: 'ai',
      description: 'Advanced fashion and styling recommendations',
    },
  },
  smart_home: {
    id: 'smart-home',
    name: 'Smart Home Agent',
    url: 'http://localhost:3005/api/acp',
    eventsUrl: 'http://localhost:3005/api/acp/events',
    enabled: false,
    metadata: {
      category: 'iot',
      description: 'Controls lighting and environment for virtual try-on',
    },
  },
};
