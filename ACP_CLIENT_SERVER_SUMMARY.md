# Twin Style as ACP Client + Server

## Overview

Twin Style is now a **full bidirectional ACP (Agent Client Protocol) participant**, functioning as both a **server** (controlled by others) and a **client** (controlling others). This enables rich multi-agent workflows and ecosystem integration.

## Architecture

```
┌──────────────────────────────────────────────────────┐
│              Twin Style (Port 3000)                  │
│                                                      │
│  🎭 ACP SERVER Role:                                 │
│     Controlled by: OpenClaw, Zed, JetBrains, etc.   │
│     ├─ Read: search, get details, stats             │
│     ├─ Write: add, update, delete items             │
│     ├─ Control: trigger AI, batch operations        │
│     ├─ Client: manage agent connections             │
│     └─ Notify: push events to subscribers           │
│                                                      │
│  🔌 ACP CLIENT Role:                                 │
│     Controls: Weather, Calendar, AI, IoT agents     │
│     ├─ Discover: fetch capabilities                 │
│     ├─ Execute: call external tools                 │
│     ├─ Subscribe: listen to external events         │
│     └─ Monitor: health check connections            │
└──────────────────────────────────────────────────────┘
         │ Controls              ▲ Controlled by
         ▼                       │
┌─────────────────┐      ┌─────────────────┐
│ External Agents │      │ External Clients│
│ - Weather       │      │ - OpenClaw      │
│ - Calendar      │      │ - Editors       │
│ - Fashion AI    │      │ - Automation    │
│ - Smart Home    │      │ - Custom Apps   │
└─────────────────┘      └─────────────────┘
```

## Tool Categories

### Total: 21 ACP Tools

**Read Tools (4)**
- `search_wardrobe` - Search items by query/category
- `get_item_details` - Get detailed item info
- `list_wardrobe_stats` - Wardrobe statistics
- `generate_outfit_suggestions` - AI outfit recommendations

**Write Tools (7)**
- `add_item` - Create new items programmatically
- `update_item` - Modify item metadata
- `delete_item` - Remove items
- `trigger_ai_job` - Start AI processing
- `batch_operations` - Execute multiple operations
- `import_items_bulk` - Bulk import from JSON
- `export_wardrobe` - Export all data

**Client Management Tools (9)**
- `connect_agent` - Register external ACP server
- `disconnect_agent` - Unregister server
- `list_connected_agents` - List all connections
- `get_agent_capabilities` - Fetch server tools
- `call_agent_tool` - Execute external tool
- `subscribe_agent_events` - Listen to external events
- `list_all_agent_tools` - Show all available tools
- `connect_predefined_agent` - Use templates
- `health_check_agent` - Check server health

**Notification Tool (1)**
- `subscribe_events` - Subscribe to real-time updates

## Use Case 1: OpenClaw Controlling Twin Style

OpenClaw acts as ACP client, Twin Style as ACP server.

### Morning Outfit Automation

```javascript
// OpenClaw skill configuration
{
  "name": "morning_outfit",
  "trigger": "cron:0 7 * * *",  // Every day at 7 AM
  "steps": [
    // 1. Check calendar
    {
      "agent": "calendar-agent",
      "tool": "get_today_events"
    },
    
    // 2. Get weather
    {
      "agent": "weather-agent",
      "tool": "get_forecast",
      "args": { "location": "auto", "days": 1 }
    },
    
    // 3. Generate outfit via Twin Style
    {
      "agent": "twin-style",
      "tool": "generate_outfit_suggestions",
      "args": {
        "weather": "{{weather.condition}}",
        "occasion": "{{events[0].type}}",
        "maxItems": 3
      }
    },
    
    // 4. Send notification
    {
      "notify": {
        "channels": ["whatsapp"],
        "message": "Good morning! Here are your outfits: {{outfits}}"
      }
    }
  ]
}
```

### Automated Wardrobe Management

```javascript
// OpenClaw monitors photo folder
{
  "name": "auto_add_items",
  "trigger": "folder_watch:/Photos/Wardrobe",
  "on_new_file": {
    "agent": "twin-style",
    "tool": "add_item",
    "args": {
      "imageBase64": "{{file_base64}}",
      "autoProcess": true  // Auto-categorize and catalog
    }
  }
}
```

## Use Case 2: Twin Style Connecting to External Agents

Twin Style acts as ACP client, external agents as ACP servers.

### Weather Integration

```typescript
// Register weather agent
await acpClient.registerServer({
  id: 'weather-agent',
  name: 'Weather Agent',
  url: 'http://localhost:3002/api/acp',
  eventsUrl: 'http://localhost:3002/api/acp/events',
  enabled: true,
});

// Execute weather tool
const forecast = await acpClient.executeToolOnServer(
  'weather-agent',
  'get_forecast',
  { location: 'San Francisco', days: 7 }
);

// Use in outfit generation
if (forecast.temperature < 60) {
  generateOutfit({ weather: 'cold', layers: true });
}
```

### Calendar Integration

```typescript
// Connect to calendar agent
await acpClient.registerServer({
  id: 'calendar-agent',
  name: 'Calendar Agent',
  url: 'http://localhost:3003/api/acp',
  enabled: true,
});

// Get today's events
const events = await acpClient.executeToolOnServer(
  'calendar-agent',
  'get_today_events',
  {}
);

// Suggest appropriate outfits
if (events.some(e => e.type === 'meeting')) {
  generateOutfit({ occasion: 'business' });
}
```

### Smart Home Integration

```typescript
// Connect to smart home
await acpClient.registerServer({
  id: 'smart-home',
  name: 'Smart Home Agent',
  url: 'http://localhost:3005/api/acp',
  enabled: true,
});

// Control closet lighting for try-on
await acpClient.executeToolOnServer(
  'smart-home',
  'set_lighting',
  { room: 'closet', brightness: 100, color: 'natural' }
);
```

## Use Case 3: Multi-Agent Workflow

Complex workflow involving multiple agents:

```
┌─────────────────────────────────────────────────┐
│                Daily Outfit Workflow            │
└─────────────────────────────────────────────────┘

1. Calendar Agent → Twin Style
   Query: "What events do I have today?"
   Response: "Board meeting at 10 AM"

2. Weather Agent → Twin Style
   Query: "What's the weather forecast?"
   Response: "Cool, 58°F, cloudy"

3. Twin Style → (Internal Processing)
   Input: Events + Weather
   Output: Business casual with jacket

4. Twin Style → Smart Home Agent
   Command: "Set closet lighting to natural"
   Response: "Lighting set"

5. Twin Style → User (via OpenClaw)
   Notification: "Outfit ready for board meeting"
```

## Predefined Agent Templates

Four built-in templates for common integrations:

### Weather Agent
```typescript
await connectPredefinedAgent({
  template: 'weather',
  url: 'http://localhost:3002/api/acp',
  apiKey: 'optional-api-key'
});
```

### Calendar Agent
```typescript
await connectPredefinedAgent({
  template: 'calendar',
  url: 'http://localhost:3003/api/acp'
});
```

### Fashion AI Assistant
```typescript
await connectPredefinedAgent({
  template: 'fashion_ai',
  url: 'http://localhost:3004/api/acp'
});
```

### Smart Home Agent
```typescript
await connectPredefinedAgent({
  template: 'smart_home',
  url: 'http://localhost:3005/api/acp'
});
```

## Bidirectional Notifications

Notifications flow both ways:

### Twin Style → Subscribers (as Server)

```typescript
// When item added
notifyItemAdded('item-123', 'Blue Shirt', 'tops');
// OpenClaw, Zed, JetBrains all receive notification
```

### External Agent → Twin Style (as Client)

```typescript
// Subscribe to weather changes
acpClient.subscribeToServerEvents(
  'weather-agent',
  ['weather/changed'],
  (notification) => {
    console.log('Weather changed:', notification);
    // Auto-suggest new outfit for weather
  }
);

// Subscribe to calendar events
acpClient.subscribeToServerEvents(
  'calendar-agent',
  ['event/upcoming'],
  (notification) => {
    console.log('Event in 1 hour:', notification);
    // Suggest appropriate outfit
  }
);
```

## API Endpoints

### As ACP Server

```bash
# Capabilities
GET /api/acp/capabilities

# Tool execution
POST /api/acp/tools
Body: { name: "add_item", arguments: {...} }

# Event subscription
GET /api/acp/events?types=item/added,job/completed
```

### As ACP Client (Programmatic)

```typescript
import { acpClient } from '@/app/lib/acp';

// Register server
await acpClient.registerServer(config);

// Execute tool
await acpClient.executeToolOnServer(serverId, toolName, args);

// Subscribe to events
acpClient.subscribeToServerEvents(serverId, eventTypes, callback);
```

## Real-World Integration Examples

### Example 1: Smart Morning Routine

```
7:00 AM - OpenClaw triggers workflow
  ├─ Check calendar (via Calendar Agent)
  ├─ Get weather (via Weather Agent)
  ├─ Generate outfit (via Twin Style)
  ├─ Set lighting (via Smart Home)
  └─ Send WhatsApp message
```

### Example 2: Photo Auto-Import

```
New photo in folder
  ├─ OpenClaw detects file
  ├─ Calls Twin Style add_item
  ├─ Twin Style processes image
  ├─ AI categorizes item
  ├─ Notification sent
  └─ OpenClaw archives photo
```

### Example 3: Event-Based Outfit Planning

```
Calendar event added
  ├─ Calendar Agent notifies Twin Style
  ├─ Twin Style gets weather
  ├─ Generates appropriate outfit
  ├─ Sends notification
  └─ Updates smart home lighting
```

## Benefits

✅ **Full Ecosystem Participation** - Both control and be controlled  
✅ **Multi-Agent Workflows** - Chain complex operations  
✅ **Template System** - Quick setup with predefined agents  
✅ **Bidirectional Notifications** - React to changes instantly  
✅ **Standards-Based** - Uses ACP protocol for compatibility  
✅ **Extensible** - Easy to add new agent integrations  
✅ **Health Monitoring** - Track agent availability  
✅ **Automation-Friendly** - Perfect for OpenClaw, n8n, Zapier

## Statistics

**Implementation:**
- Client code: ~370 lines
- Client tools: ~220 lines
- Control tools: ~300 lines
- Examples: ~400 lines
- Total: ~1,290 lines of new code

**Capabilities:**
- 21 ACP tools total
- 4 predefined templates
- 8 notification event types
- Unlimited external agent connections

## Testing

```bash
# Run comprehensive examples
cd app
npx tsx examples-acp-client-server.ts

# Demonstrates:
# - Architecture overview
# - Weather integration
# - OpenClaw automation
# - Chained workflows
# - Bidirectional notifications
# - Real-world automation
```

## Future Enhancements

- [ ] Agent marketplace UI
- [ ] Visual workflow builder
- [ ] More predefined templates
- [ ] Agent authentication/authorization
- [ ] Rate limiting per agent
- [ ] Agent analytics dashboard
- [ ] Integration testing suite
- [ ] Agent discovery protocol

## Conclusion

Twin Style is now a **full ACP ecosystem participant**:

- **As Server**: Controlled by OpenClaw, editors, automation tools
- **As Client**: Controls weather, calendar, AI, IoT agents
- **Bidirectional**: Notifications and events flow both ways
- **Ecosystem**: Part of broader multi-agent network

This enables rich automation workflows, smart integrations, and complex multi-agent collaborations that were previously impossible.

---

**Status**: ✅ Client + Server Fully Implemented  
**Protocol**: JSON-RPC 2.0 over HTTP/SSE  
**Compatibility**: Works with all ACP-compliant agents  
**Last Updated**: 2026-02-15
