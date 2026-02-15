/**
 * ACP (Agent Client Protocol) Type Definitions
 * 
 * TypeScript types for the Agent Client Protocol integration.
 */

/**
 * ACP Tool Definition
 */
export interface ACPTool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, unknown>;
    required?: string[];
  };
}

/**
 * ACP Capability
 */
export interface ACPCapability {
  tools?: boolean;
  prompts?: boolean;
  resources?: boolean;
  sampling?: boolean;
}

/**
 * ACP Server Configuration
 */
export interface ACPServerConfig {
  name: string;
  version: string;
  capabilities: ACPCapability;
  tools: ACPTool[];
}

/**
 * ACP Tool Call Request
 */
export interface ACPToolCallRequest {
  name: string;
  arguments: Record<string, unknown>;
}

/**
 * ACP Tool Call Response
 */
export interface ACPToolCallResponse {
  content: Array<{
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: string;
    mimeType?: string;
  }>;
  isError?: boolean;
}

/**
 * ACP Resource
 */
export interface ACPResource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

/**
 * ACP Prompt
 */
export interface ACPPrompt {
  name: string;
  description: string;
  arguments: Array<{
    name: string;
    description: string;
    required: boolean;
  }>;
}
