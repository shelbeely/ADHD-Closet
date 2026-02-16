/**
 * ACP Client Management Tools
 * 
 * Tools to manage Twin Style's connections to external ACP servers
 */

import { acpClient, SERVER_TEMPLATES } from './client';
import { z } from 'zod';

/**
 * Connect to External Agent Tool
 */
export const ConnectAgentSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
  eventsUrl: z.string().optional(),
  apiKey: z.string().optional(),
  autoFetchCapabilities: z.boolean().optional().default(true),
});

export async function connectAgent(args: z.infer<typeof ConnectAgentSchema>) {
  const { autoFetchCapabilities, ...config } = args;
  
  await acpClient.registerServer({
    ...config,
    enabled: true,
    metadata: {},
  });

  let capabilities = null;
  if (autoFetchCapabilities) {
    capabilities = await acpClient.fetchCapabilities(config.id);
  }

  return {
    success: true,
    serverId: config.id,
    message: `Connected to ${config.name}`,
    capabilities: capabilities ? {
      toolCount: capabilities.tools.length,
      tools: capabilities.tools.map(t => t.name),
    } : null,
  };
}

/**
 * Disconnect from External Agent Tool
 */
export const DisconnectAgentSchema = z.object({
  serverId: z.string(),
});

export async function disconnectAgent(args: z.infer<typeof DisconnectAgentSchema>) {
  const { serverId } = args;
  
  const server = acpClient.getServer(serverId);
  if (!server) {
    throw new Error(`Server not found: ${serverId}`);
  }

  acpClient.unregisterServer(serverId);

  return {
    success: true,
    serverId,
    message: `Disconnected from ${server.name}`,
  };
}

/**
 * List Connected Agents Tool
 */
export async function listConnectedAgents() {
  const servers = acpClient.getServers();
  
  const serverList = servers.map(server => ({
    id: server.id,
    name: server.name,
    url: server.url,
    enabled: server.enabled,
    hasEvents: !!server.eventsUrl,
    metadata: server.metadata,
  }));

  return {
    success: true,
    count: serverList.length,
    servers: serverList,
  };
}

/**
 * Get Agent Capabilities Tool
 */
export const GetAgentCapabilitiesSchema = z.object({
  serverId: z.string(),
  refresh: z.boolean().optional().default(false),
});

export async function getAgentCapabilities(args: z.infer<typeof GetAgentCapabilitiesSchema>) {
  const { serverId, refresh } = args;
  
  let capabilities = acpClient.getServerCapabilities(serverId);
  
  if (!capabilities || refresh) {
    capabilities = await acpClient.fetchCapabilities(serverId);
    if (!capabilities) {
      throw new Error(`Failed to fetch capabilities from ${serverId}`);
    }
  }

  return {
    success: true,
    serverId,
    serverInfo: capabilities.serverInfo,
    capabilities: capabilities.capabilities,
    tools: capabilities.tools,
  };
}

/**
 * Call Agent Tool
 */
export const CallAgentToolSchema = z.object({
  serverId: z.string(),
  toolName: z.string(),
  arguments: z.record(z.unknown()),
});

export async function callAgentTool(args: z.infer<typeof CallAgentToolSchema>) {
  const { serverId, toolName, arguments: toolArgs } = args;
  
  const result = await acpClient.executeToolOnServer(serverId, toolName, toolArgs);

  return {
    success: true,
    serverId,
    toolName,
    result,
  };
}

/**
 * Subscribe to Agent Events Tool
 */
export const SubscribeAgentEventsSchema = z.object({
  serverId: z.string(),
  eventTypes: z.array(z.string()).optional(),
});

export async function subscribeAgentEvents(args: z.infer<typeof SubscribeAgentEventsSchema>) {
  const { serverId, eventTypes } = args;
  
  const server = acpClient.getServer(serverId);
  if (!server) {
    throw new Error(`Server not found: ${serverId}`);
  }

  acpClient.subscribeToServerEvents(serverId, eventTypes, (notification) => {
    console.log(`Received notification from ${server.name}:`, notification);
    // Could forward to Twin Style's own notification system
  });

  return {
    success: true,
    serverId,
    message: `Subscribed to events from ${server.name}`,
    eventTypes: eventTypes || ['all'],
  };
}

/**
 * List All Available Tools
 */
export async function listAllAgentTools() {
  const allTools = acpClient.getAllTools();
  
  const grouped = allTools.reduce((acc, { serverId, serverName, tool }) => {
    if (!acc[serverId]) {
      acc[serverId] = {
        serverName,
        tools: [],
      };
    }
    acc[serverId].tools.push({
      name: tool.name,
      description: tool.description,
    });
    return acc;
  }, {} as Record<string, { serverName: string; tools: Array<{ name: string; description: string }> }>);

  return {
    success: true,
    totalTools: allTools.length,
    servers: grouped,
  };
}

/**
 * Connect Predefined Agent Template
 * 
 * Note: This is for ACP AGENTS only.
 * For data sources (weather, calendar), use MCP integration instead.
 */
export const ConnectPredefinedAgentSchema = z.object({
  template: z.enum(['fashion_ai', 'automation_agent']),
  url: z.string().optional(),
  apiKey: z.string().optional(),
});

export async function connectPredefinedAgent(args: z.infer<typeof ConnectPredefinedAgentSchema>) {
  const { template, url, apiKey } = args;
  
  const templateConfig = SERVER_TEMPLATES[template];
  
  const config = {
    ...templateConfig,
    url: url || templateConfig.url,
    apiKey,
    enabled: true,
  };

  await acpClient.registerServer(config);
  const capabilities = await acpClient.fetchCapabilities(config.id);

  return {
    success: true,
    serverId: config.id,
    name: config.name,
    message: `Connected to ${config.name} using template`,
    capabilities: capabilities ? {
      toolCount: capabilities.tools.length,
      tools: capabilities.tools.map(t => t.name),
    } : null,
  };
}

/**
 * Health Check Agent
 */
export const HealthCheckAgentSchema = z.object({
  serverId: z.string(),
});

export async function healthCheckAgent(args: z.infer<typeof HealthCheckAgentSchema>) {
  const { serverId } = args;
  
  const server = acpClient.getServer(serverId);
  if (!server) {
    throw new Error(`Server not found: ${serverId}`);
  }

  const isHealthy = await acpClient.checkServerHealth(serverId);

  return {
    success: true,
    serverId,
    serverName: server.name,
    healthy: isHealthy,
    message: isHealthy ? 'Server is responding' : 'Server is not responding',
  };
}
