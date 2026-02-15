/**
 * A2A (Agent-to-Agent) Protocol Types
 * 
 * These types define the A2A protocol interfaces for Twin Style agents.
 */

export interface AgentCard {
  name: string;
  version: string;
  description: string;
  skills: AgentSkill[];
  endpoints: {
    a2a: string;
  };
  metadata?: {
    framework?: string;
    tags?: string[];
  };
}

export interface AgentSkill {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>; // JSON Schema
  outputSchema: Record<string, unknown>; // JSON Schema
}

export interface A2ATaskRequest {
  taskId: string;
  skillName: string;
  input: unknown;
  context?: {
    userId?: string;
    sessionId?: string;
    [key: string]: unknown;
  };
}

export interface A2ATaskResponse {
  taskId: string;
  status: 'running' | 'completed' | 'failed';
  output?: unknown;
  error?: string;
  progress?: number;
}

export interface A2AAgent {
  card: AgentCard;
  executeSkill(skillName: string, input: unknown, context?: unknown): Promise<unknown>;
}
