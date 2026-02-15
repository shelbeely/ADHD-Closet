/**
 * Example: Using A2A Agents
 * 
 * This file demonstrates how to use the A2A integration in various scenarios.
 */

import { orchestrator, uploadToOutfitWorkflow } from './app/lib/a2a';

/**
 * Example 1: Execute a single agent skill
 */
async function example1_ExecuteSingleSkill() {
  console.log('\n📌 Example 1: Execute a single agent skill\n');
  
  const taskId = `task-${Date.now()}`;
  const response = await fetch('http://localhost:3000/api/a2a/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      taskId,
      skillName: 'infer_item_attributes',
      input: {
        imageBase64: 'base64-encoded-image-here',
        userPrompt: 'Blue cotton t-shirt',
      },
    }),
  });
  
  const result = await response.json();
  console.log('Result:', JSON.stringify(result, null, 2));
}

/**
 * Example 2: Use MCP to fetch wardrobe items
 */
async function example2_UseMCPDataSource() {
  console.log('\n📌 Example 2: Use MCP to fetch wardrobe items\n');
  
  // List available tools
  const toolsResponse = await fetch(
    'http://localhost:3000/api/a2a/mcp/tools?dataSource=wardrobe-database'
  );
  const { tools } = await toolsResponse.json();
  console.log('Available tools:', tools.map(t => t.name));
  
  // Execute a tool
  const itemsResponse = await fetch('http://localhost:3000/api/a2a/mcp/tools', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      dataSource: 'wardrobe-database',
      toolName: 'search_items',
      args: {
        category: 'tops',
        colors: ['blue'],
        style: ['casual'],
      },
    }),
  });
  
  const { result } = await itemsResponse.json();
  console.log(`Found ${result.length} matching items:`, result);
}

/**
 * Example 3: Sequential workflow - Upload to Outfit
 */
async function example3_SequentialWorkflow() {
  console.log('\n📌 Example 3: Sequential workflow - Upload to Outfit\n');
  
  const result = await orchestrator.executeWorkflow({
    ...uploadToOutfitWorkflow,
    initialContext: {
      originalImageBase64: 'base64-encoded-image',
      userPrompt: 'Blue button-up shirt',
      constraints: {
        weather: 'cool',
        occasion: 'work',
        mood: 'professional',
      },
      availableItems: [], // Will be fetched from MCP if empty
    },
  });
  
  console.log('Workflow result:', JSON.stringify(result, null, 2));
}

/**
 * Example 4: Custom workflow
 */
async function example4_CustomWorkflow() {
  console.log('\n📌 Example 4: Custom workflow\n');
  
  const customWorkflow = {
    name: 'catalog-and-categorize',
    description: 'Generate catalog image and categorize item',
    steps: [
      {
        agentUrl: 'http://localhost:3000/api/a2a',
        skillName: 'generate_catalog_image',
        mapInput: (prev: unknown, ctx: Record<string, unknown>) => ({
          imageBase64: ctx.originalImage,
        }),
      },
      {
        agentUrl: 'http://localhost:3000/api/a2a',
        skillName: 'infer_item_attributes',
        mapInput: (prev: Record<string, unknown>, ctx: Record<string, unknown>) => ({
          imageBase64: ctx.originalImage, // Use original, not catalog
          userPrompt: ctx.userPrompt as string,
        }),
        validateOutput: (output: Record<string, unknown>) => {
          return output.category !== 'uncategorized';
        },
      },
    ],
    initialContext: {
      originalImage: 'base64-encoded-image',
      userPrompt: 'Red sweater',
    },
  };
  
  const result = await orchestrator.executeWorkflow(customWorkflow);
  console.log('Custom workflow result:', JSON.stringify(result, null, 2));
}

/**
 * Example 5: Discover agent capabilities
 */
async function example5_DiscoverAgentCapabilities() {
  console.log('\n📌 Example 5: Discover agent capabilities\n');
  
  // Fetch agent card
  const agentCard = await orchestrator.fetchAgentCard('http://localhost:3000');
  console.log('Agent Card:', JSON.stringify(agentCard, null, 2));
  
  // List all available skills
  console.log('\nAvailable Skills:');
  if (agentCard && typeof agentCard === 'object' && 'skills' in agentCard) {
    const skills = agentCard.skills as Array<{ name: string; description: string }>;
    skills.forEach(skill => {
      console.log(`  - ${skill.name}: ${skill.description}`);
    });
  }
}

/**
 * Example 6: Connect external agent (from another framework)
 */
async function example6_ConnectExternalAgent() {
  console.log('\n📌 Example 6: Connect external agent\n');
  
  // This demonstrates how to call Twin Style from another agent framework
  // (e.g., Google ADK, LangGraph, Microsoft Copilot Studio)
  
  console.log('From Google ADK:');
  console.log(`
    import { RemoteA2aAgent } from '@google/adk';
    
    const twinStyle = new RemoteA2aAgent({
      cardUrl: 'http://localhost:3000/.well-known/agent-card.json'
    });
    
    const result = await twinStyle.executeSkill('generate_outfit', {
      constraints: { weather: 'warm', occasion: 'casual' },
      availableItems: items
    });
  `);
  
  console.log('\nFrom Python/LangGraph:');
  console.log(`
    from langgraph import A2AAgent
    
    twin_style = A2AAgent(
      card_url="http://localhost:3000/.well-known/agent-card.json"
    )
    
    result = twin_style.execute_skill(
      skill_name="infer_item_attributes",
      input={"imageBase64": image_b64}
    )
  `);
}

// Run all examples
async function main() {
  console.log('🎯 A2A Integration Examples\n');
  console.log('These examples demonstrate how to use the A2A integration.\n');
  console.log('Note: Some examples require a running server and real data.\n');
  console.log('=' .repeat(60));
  
  try {
    // Uncomment to run specific examples:
    // await example1_ExecuteSingleSkill();
    // await example2_UseMCPDataSource();
    // await example3_SequentialWorkflow();
    // await example4_CustomWorkflow();
    await example5_DiscoverAgentCapabilities();
    await example6_ConnectExternalAgent();
    
  } catch (error) {
    console.error('Error running example:', error);
  }
}

if (require.main === module) {
  main();
}

export {
  example1_ExecuteSingleSkill,
  example2_UseMCPDataSource,
  example3_SequentialWorkflow,
  example4_CustomWorkflow,
  example5_DiscoverAgentCapabilities,
  example6_ConnectExternalAgent,
};
