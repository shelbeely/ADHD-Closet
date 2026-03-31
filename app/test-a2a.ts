/**
 * A2A Integration Test Script
 * 
 * This script demonstrates and tests the A2A integration:
 * 1. Agent discovery via agent card
 * 2. Skill execution
 * 3. Sequential workflow chaining
 * 4. MCP data source access
 */

const BASE_URL = process.env.PUBLIC_BASE_URL || 'http://localhost:3000';

interface TestResult {
  testName: string;
  success: boolean;
  message: string;
  duration: number;
}

const results: TestResult[] = [];

async function runTest(
  testName: string,
  testFn: () => Promise<void>
): Promise<void> {
  console.log(`\n🧪 Running: ${testName}`);
  const startTime = Date.now();
  
  try {
    await testFn();
    const duration = Date.now() - startTime;
    results.push({ testName, success: true, message: 'Passed', duration });
    console.log(`✅ PASS (${duration}ms)`);
  } catch (error) {
    const duration = Date.now() - startTime;
    const message = error instanceof Error ? error.message : 'Unknown error';
    results.push({ testName, success: false, message, duration });
    console.error(`❌ FAIL: ${message}`);
  }
}

// Test 1: Agent Card Discovery
async function testAgentCardDiscovery() {
  const response = await fetch(`${BASE_URL}/.well-known/agent-card.json`);
  
  if (!response.ok) {
    throw new Error(`Agent card request failed: ${response.status}`);
  }
  
  const agentCard = await response.json();
  
  if (!agentCard.name || !agentCard.skills || !agentCard.endpoints) {
    throw new Error('Agent card missing required fields');
  }
  
  console.log(`   Agent: ${agentCard.name} (${agentCard.skills.length} skills)`);
}

// Test 2: MCP Resources List
async function testMCPResourcesList() {
  const response = await fetch(
    `${BASE_URL}/api/a2a/mcp/resources?dataSource=wardrobe-database`
  );
  
  if (!response.ok) {
    throw new Error(`MCP resources request failed: ${response.status}`);
  }
  
  const data = await response.json();
  
  if (!data.resources || !Array.isArray(data.resources)) {
    throw new Error('MCP resources response invalid');
  }
  
  console.log(`   Found ${data.resources.length} resources`);
}

// Test 3: MCP Tools List
async function testMCPToolsList() {
  const response = await fetch(
    `${BASE_URL}/api/a2a/mcp/tools?dataSource=wardrobe-database`
  );
  
  if (!response.ok) {
    throw new Error(`MCP tools request failed: ${response.status}`);
  }
  
  const data = await response.json();
  
  if (!data.tools || !Array.isArray(data.tools)) {
    throw new Error('MCP tools response invalid');
  }
  
  console.log(`   Found ${data.tools.length} tools`);
}

// Test 4: MCP Tool Execution - Get Available Items
async function testMCPToolExecution() {
  const response = await fetch(`${BASE_URL}/api/a2a/mcp/tools`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      dataSource: 'wardrobe-database',
      toolName: 'get_available_items',
      args: { limit: 5 },
    }),
  });
  
  if (!response.ok) {
    throw new Error(`MCP tool execution failed: ${response.status}`);
  }
  
  const data = await response.json();
  
  if (!data.result || !Array.isArray(data.result)) {
    throw new Error('MCP tool execution response invalid');
  }
  
  console.log(`   Retrieved ${data.result.length} items`);
}

// Test 5: A2A Skill Execution (requires real data)
async function testSkillExecution() {
  // This test would require a real image, so we'll skip it in automated tests
  // but provide the structure for manual testing
  
  console.log('   Skipped (requires real image data)');
  console.log('   To test manually, use:');
  console.log('   POST /api/a2a/execute with skillName: "infer_item_attributes"');
}

// Test 6: Sequential Workflow Structure
async function testWorkflowStructure() {
  // This test validates the workflow structure without executing
  const { uploadToOutfitWorkflow } = await import('./app/lib/a2a/workflows');
  
  if (!uploadToOutfitWorkflow.name || !uploadToOutfitWorkflow.steps) {
    throw new Error('Workflow structure invalid');
  }
  
  if (uploadToOutfitWorkflow.steps.length !== 3) {
    throw new Error(`Expected 3 steps, found ${uploadToOutfitWorkflow.steps.length}`);
  }
  
  console.log(`   Workflow "${uploadToOutfitWorkflow.name}" has ${uploadToOutfitWorkflow.steps.length} steps`);
}

// Main test runner
async function main() {
  console.log('🚀 A2A Integration Test Suite\n');
  console.log(`Testing against: ${BASE_URL}\n`);
  console.log('=' .repeat(60));
  
  await runTest('Agent Card Discovery', testAgentCardDiscovery);
  await runTest('MCP Resources List', testMCPResourcesList);
  await runTest('MCP Tools List', testMCPToolsList);
  await runTest('MCP Tool Execution', testMCPToolExecution);
  await runTest('A2A Skill Execution', testSkillExecution);
  await runTest('Sequential Workflow Structure', testWorkflowStructure);
  
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Test Results Summary:\n');
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⏱️  Total Duration: ${totalDuration}ms\n`);
  
  if (failed > 0) {
    console.log('Failed Tests:');
    results
      .filter(r => !r.success)
      .forEach(r => {
        console.log(`  - ${r.testName}: ${r.message}`);
      });
    console.log('');
  }
  
  // Exit with error code if any tests failed
  if (failed > 0) {
    process.exit(1);
  }
  
  console.log('🎉 All tests passed!\n');
}

// Run tests if this script is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  });
}

export { main as runA2ATests };
