/**
 * ADK Orchestrator - Sequential Agent Chaining
 * 
 * This orchestrator uses Google's ADK to chain Twin Style agents sequentially,
 * where the output of one agent feeds into the next agent's input.
 */

/**
 * Agent step definition for sequential chaining
 */
export interface AgentStep {
  /** Name of the agent to call */
  agentUrl: string;
  /** Skill to execute on the agent */
  skillName: string;
  /** Function to map previous output to this step's input */
  mapInput: (previousOutput: unknown, context: unknown) => unknown;
  /** Optional validation for the output */
  validateOutput?: (output: unknown) => boolean;
}

/**
 * Sequential workflow definition
 */
export interface SequentialWorkflow {
  name: string;
  description: string;
  steps: AgentStep[];
  initialContext?: Record<string, unknown>;
}

/**
 * Result of a workflow execution
 */
export interface WorkflowResult {
  workflowName: string;
  success: boolean;
  steps: Array<{
    agentUrl: string;
    skillName: string;
    input: unknown;
    output: unknown;
    error?: string;
  }>;
  finalOutput: unknown;
  error?: string;
}

/**
 * Orchestrator for sequential agent chaining
 */
export class A2AOrchestrator {
  /**
   * Execute a sequential workflow
   */
  async executeWorkflow(workflow: SequentialWorkflow): Promise<WorkflowResult> {
    console.log(`Starting workflow: ${workflow.name}`);
    
    const result: WorkflowResult = {
      workflowName: workflow.name,
      success: false,
      steps: [],
      finalOutput: null,
    };

    let previousOutput: unknown = null;
    const context = workflow.initialContext || {};

    try {
      for (const step of workflow.steps) {
        console.log(`Executing step: ${step.agentUrl} - ${step.skillName}`);

        // Map previous output to current input
        const input = step.mapInput(previousOutput, context);

        // Execute the agent skill
        const stepResult = await this.executeAgentSkill(
          step.agentUrl,
          step.skillName,
          input
        );

        // Validate output if validator provided
        if (step.validateOutput && !step.validateOutput(stepResult.output)) {
          throw new Error(`Output validation failed for step: ${step.skillName}`);
        }

        // Record the step result
        result.steps.push({
          agentUrl: step.agentUrl,
          skillName: step.skillName,
          input,
          output: stepResult.output,
        });

        previousOutput = stepResult.output;
      }

      result.success = true;
      result.finalOutput = previousOutput;
      console.log(`Workflow ${workflow.name} completed successfully`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Workflow ${workflow.name} failed:`, error);
      result.error = errorMessage;
      result.finalOutput = previousOutput;
    }

    return result;
  }

  /**
   * Execute a skill on an A2A agent
   */
  private async executeAgentSkill(
    agentUrl: string,
    skillName: string,
    input: unknown
  ): Promise<{ output: unknown }> {
    const taskId = `task-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    try {
      const response = await fetch(`${agentUrl}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Task-Id': taskId,
        },
        body: JSON.stringify({
          taskId,
          skillName,
          input,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Agent request failed (${response.status}): ${error}`);
      }

      const result = await response.json();

      if (result.status === 'failed') {
        throw new Error(`Agent task failed: ${result.error}`);
      }

      return { output: result.output };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Failed to execute agent skill: ${agentUrl} - ${skillName}`, error);
      throw new Error(errorMessage);
    }
  }

  /**
   * Fetch an agent card for discovery
   */
  async fetchAgentCard(agentBaseUrl: string): Promise<unknown> {
    try {
      const response = await fetch(`${agentBaseUrl}/.well-known/agent-card.json`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch agent card: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Failed to fetch agent card from ${agentBaseUrl}:`, error);
      throw new Error(errorMessage);
    }
  }
}

// Export singleton instance
export const orchestrator = new A2AOrchestrator();
