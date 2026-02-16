/**
 * ACP Client+Server Examples
 * 
 * Demonstrates Twin Style as both ACP client and server
 * 
 * IMPORTANT PROTOCOL CLARIFICATION:
 * ================================
 * The examples below are CONCEPTUAL and show the ACP client architecture.
 * 
 * However, after user feedback, we've clarified that:
 * - Weather APIs = DATA SOURCES → Use MCP (not ACP)
 * - Calendar APIs = DATA SOURCES → Use MCP (not ACP)
 * - Editors/Agents = AGENTS → Use ACP ✓
 * 
 * For production implementations:
 * - Use MCP for weather/calendar data (see app/lib/a2a/mcp.ts)
 * - Use ACP only for actual agents (editors, automation tools with agency)
 * 
 * These examples remain for educational purposes to show the ACP client
 * architecture, but real weather/calendar integration should use MCP.
 */

import { acpClient } from './app/lib/acp/client';

console.log('🔄 Twin Style as ACP Client + Server\n');
console.log('='.repeat(60));

async function demonstrateClientServerArchitecture() {
  console.log('\n📐 Architecture Overview:\n');
  
  console.log(`
┌─────────────────────────────────────────────────┐
│            Twin Style (Port 3000)               │
│                                                 │
│  🎭 ACP SERVER Role:                            │
│  ├─ Exposes wardrobe tools to editors/agents   │
│  ├─ Sends notifications to subscribers          │
│  └─ Controlled by: Zed, JetBrains, OpenClaw    │
│                                                 │
│  🔌 ACP CLIENT Role:                            │
│  ├─ Connects to external ACP agents             │
│  ├─ Executes their tools                        │
│  └─ Subscribes to their events                  │
└─────────────────────────────────────────────────┘
           │                          │
           │ Controls                 │ Controlled by
           ▼                          ▼
  ┌──────────────────┐      ┌──────────────────┐
  │  Weather Agent   │      │  Editor (Zed)    │
  │  Calendar Agent  │      │  Automation      │
  │  Fashion AI      │      │  OpenClaw        │
  │  Smart Home      │      │  Mobile App      │
  └──────────────────┘      └──────────────────┘
  `);
}

async function exampleConnectToWeatherAgent() {
  console.log('\n📡 Example 1: Connect to Weather Agent\n');
  
  console.log('Twin Style (as client) → Weather Agent (as server):\n');
  
  console.log('Step 1: Register weather agent');
  console.log(`
await acpClient.registerServer({
  id: 'weather-agent',
  name: 'Weather Agent',
  url: 'http://localhost:3002/api/acp',
  eventsUrl: 'http://localhost:3002/api/acp/events',
  enabled: true,
});
  `);

  console.log('Step 2: Fetch capabilities');
  console.log(`
const capabilities = await acpClient.fetchCapabilities('weather-agent');
// Returns: { tools: ['get_forecast', 'get_current_weather', ...] }
  `);

  console.log('Step 3: Execute weather tool');
  console.log(`
const forecast = await acpClient.executeToolOnServer(
  'weather-agent',
  'get_forecast',
  { location: 'San Francisco', days: 7 }
);
// Returns: { temperature: 65, condition: 'sunny', ... }
  `);

  console.log('Step 4: Use weather data for outfit suggestion');
  console.log(`
if (forecast.temperature < 60) {
  suggestOutfit({ weather: 'cold', layers: true });
} else {
  suggestOutfit({ weather: 'warm', layers: false });
}
  `);
}

async function exampleOpenClawControllingTwinStyle() {
  console.log('\n🤖 Example 2: OpenClaw Controls Twin Style\n');
  
  console.log('OpenClaw (as client) → Twin Style (as server):\n');

  console.log('Step 1: OpenClaw discovers Twin Style');
  console.log(`
GET http://localhost:3000/api/acp/capabilities
// Returns: { tools: ['search_wardrobe', 'add_item', ...] }
  `);

  console.log('Step 2: OpenClaw adds item programmatically');
  console.log(`
POST http://localhost:3000/api/acp/tools
{
  "name": "add_item",
  "arguments": {
    "title": "Blue Denim Jacket",
    "category": "outerwear",
    "brand": "Levi's",
    "imageBase64": "...",
    "autoProcess": true
  }
}
// Returns: { success: true, itemId: "item-123" }
  `);

  console.log('Step 3: OpenClaw subscribes to notifications');
  console.log(`
GET http://localhost:3000/api/acp/events?types=job/completed
// Receives: { type: 'job/completed', data: { itemId, imageUrl } }
  `);

  console.log('Step 4: OpenClaw automates daily outfit');
  console.log(`
POST http://localhost:3000/api/acp/tools
{
  "name": "generate_outfit_suggestions",
  "arguments": {
    "weather": "cool",
    "occasion": "work",
    "maxItems": 3
  }
}
// Returns: { outfits: [...] }
  `);
}

async function exampleChainedAgents() {
  console.log('\n🔗 Example 3: Chained Agent Workflow\n');
  
  console.log('Multi-agent collaboration:\n');

  console.log('Step 1: Twin Style → Calendar Agent');
  console.log(`
const events = await acpClient.executeToolOnServer(
  'calendar-agent',
  'get_today_events',
  {}
);
// Returns: [{ time: '9:00', title: 'Board Meeting' }, ...]
  `);

  console.log('Step 2: Twin Style → Weather Agent');
  console.log(`
const weather = await acpClient.executeToolOnServer(
  'weather-agent',
  'get_current_weather',
  { location: 'San Francisco' }
);
// Returns: { temperature: 58, condition: 'cloudy' }
  `);

  console.log('Step 3: Twin Style uses both to suggest outfit');
  console.log(`
const outfit = await generateSmartOutfit({
  events: events,  // Formal meeting → professional attire
  weather: weather, // Cool & cloudy → layers + jacket
});
// Returns: Business casual with jacket
  `);

  console.log('Step 4: Twin Style → Smart Home Agent');
  console.log(`
await acpClient.executeToolOnServer(
  'smart-home',
  'set_lighting',
  { room: 'closet', brightness: 100, color: 'natural' }
);
// Perfect lighting for virtual try-on!
  `);
}

async function exampleBidirectionalNotifications() {
  console.log('\n🔔 Example 4: Bidirectional Notifications\n');
  
  console.log('Twin Style sending AND receiving notifications:\n');

  console.log('Twin Style → Subscribers (as server):');
  console.log(`
// When item added via UI
notifyItemAdded('item-123', 'Red Sweater', 'tops');
// Zed, JetBrains, OpenClaw all receive notification
  `);

  console.log('\nWeather Agent → Twin Style (as client):');
  console.log(`
acpClient.subscribeToServerEvents('weather-agent', ['weather/changed'], 
  (notification) => {
    console.log('Weather changed:', notification);
    // Auto-suggest outfit for new weather
  }
);
  `);

  console.log('\nCalendar Agent → Twin Style (as client):');
  console.log(`
acpClient.subscribeToServerEvents('calendar-agent', ['event/upcoming'], 
  (notification) => {
    console.log('Event in 1 hour:', notification);
    // Suggest appropriate outfit for upcoming event
  }
);
  `);
}

async function exampleRealWorldAutomation() {
  console.log('\n🌟 Example 5: Real-World Automation with OpenClaw\n');
  
  console.log('OpenClaw Skill for "Morning Outfit Routine":\n');

  console.log(`
// OpenClaw skill configuration
{
  "name": "morning_outfit",
  "trigger": "cron:0 7 * * *",  // Every day at 7 AM
  "workflow": [
    {
      "agent": "calendar-agent",
      "tool": "get_today_events",
      "store": "events"
    },
    {
      "agent": "weather-agent",
      "tool": "get_forecast",
      "args": { "location": "auto", "days": 1 },
      "store": "weather"
    },
    {
      "agent": "twin-style",
      "tool": "generate_outfit_suggestions",
      "args": {
        "weather": "{{weather.condition}}",
        "occasion": "{{events[0].type}}",
        "maxItems": 3
      },
      "store": "outfits"
    },
    {
      "agent": "twin-style",
      "tool": "subscribe_events",
      "args": {
        "types": ["catalog/generated"]
      }
    },
    {
      "notify": {
        "channels": ["whatsapp", "telegram"],
        "message": "Good morning! Here are your outfit suggestions:\\n{{outfits}}"
      }
    }
  ]
}
  `);

  console.log('\nResult: Every morning at 7 AM:');
  console.log('  1. Check calendar for today\'s events');
  console.log('  2. Get weather forecast');
  console.log('  3. Generate outfit suggestions via Twin Style');
  console.log('  4. Send WhatsApp/Telegram message with outfits');
  console.log('  5. Subscribe to Twin Style updates');
}

async function demonstrateToolAvailability() {
  console.log('\n🛠️  Available Tools:\n');
  
  console.log('Twin Style ACP Server Tools (for others to call):');
  console.log('  Read Tools:');
  console.log('    - search_wardrobe');
  console.log('    - get_item_details');
  console.log('    - list_wardrobe_stats');
  console.log('    - generate_outfit_suggestions');
  console.log('\n  Write Tools (NEW):');
  console.log('    - add_item');
  console.log('    - update_item');
  console.log('    - delete_item');
  console.log('    - trigger_ai_job');
  console.log('    - batch_operations');
  console.log('    - import_items_bulk');
  console.log('    - export_wardrobe');
  console.log('\n  Client Tools (NEW):');
  console.log('    - connect_agent');
  console.log('    - disconnect_agent');
  console.log('    - list_connected_agents');
  console.log('    - call_agent_tool');
  console.log('    - subscribe_agent_events');
  console.log('\n  Notification:');
  console.log('    - subscribe_events');
}

async function main() {
  await demonstrateClientServerArchitecture();
  await demonstrateToolAvailability();
  await exampleConnectToWeatherAgent();
  await exampleOpenClawControllingTwinStyle();
  await exampleChainedAgents();
  await exampleBidirectionalNotifications();
  await exampleRealWorldAutomation();
  
  console.log('\n' + '='.repeat(60));
  console.log('\n✨ Twin Style is now a full ACP ecosystem participant!');
  console.log('   - Acts as SERVER: Others control Twin Style');
  console.log('   - Acts as CLIENT: Twin Style controls others');
  console.log('   - Bidirectional: Notifications flow both ways\n');
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Example failed:', error);
    process.exit(1);
  });
}

export { main as demonstrateACPClientServer };
