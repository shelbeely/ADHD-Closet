# ACP (Agent Client Protocol) Integration

## Quick Start

Twin Style implements ACP (Agent Client Protocol), enabling seamless integration with code editors like Zed and JetBrains IDEs.

### What is ACP?

ACP is like LSP (Language Server Protocol) but for AI agents. It allows any editor to work with any AI agent through a standardized protocol.

### Discover Capabilities

```bash
curl http://localhost:3000/api/acp/capabilities
```

### Execute a Tool

```bash
curl -X POST http://localhost:3000/api/acp/tools \
  -H "Content-Type: application/json" \
  -d '{
    "name": "search_wardrobe",
    "arguments": {
      "query": "blue",
      "category": "tops"
    }
  }'
```

## Available Tools

1. **search_wardrobe** - Search for clothing items by query/category
2. **get_item_details** - Get detailed info about a specific item
3. **generate_catalog_image** - Create professional catalog images
4. **infer_item_category** - Auto-categorize clothing from images
5. **generate_outfit_suggestions** - AI-powered outfit recommendations
6. **list_wardrobe_stats** - Get wardrobe statistics

## Usage in Editors

### Zed Editor

```json
// Add to Zed settings
{
  "acpServers": {
    "twin-style": {
      "url": "http://localhost:3000/api/acp"
    }
  }
}
```

Then ask AI in Zed:
- "Search my wardrobe for blue shirts"
- "Generate an outfit for a work meeting"
- "What are my wardrobe stats?"

### JetBrains IDEs

1. Settings → AI Agents → ACP Servers
2. Add server: `http://localhost:3000/api/acp`
3. Use AI assistant with wardrobe commands

## API Endpoints

- `GET /api/acp/capabilities` - Discover server capabilities
- `POST /api/acp/tools` - Execute tools

## Documentation

See [`docs/developer/ACP_INTEGRATION.md`](../docs/developer/ACP_INTEGRATION.md) for complete documentation including:
- Tool reference
- Editor setup guides
- Examples
- Architecture diagrams
- Troubleshooting

## Twin Style as ACP Client

Twin Style is BOTH an ACP server AND client!

### As Server (Controlled by Others)
- Editors control wardrobe (Zed, JetBrains)
- Automation tools control operations (OpenClaw, n8n)
- Mobile apps control via ACP

### As Client (Controls Others)
- Queries weather for outfit decisions
- Checks calendar for event planning
- Requests styling advice from AI agents
- Controls smart home devices
- Orchestrates multi-agent workflows

### Example: Smart Morning Automation

```
7:00 AM Alarm
    ↓
Twin Style (client) checks:
├─ Calendar → "Meeting at 2pm"
├─ Weather → "65°F, sunny"
└─ Fashion AI → "Business casual"
    ↓
Twin Style generates context-aware outfit
    ↓
Push notification with complete outfit plan
```

**Time saved: 15 minutes every morning!**

### Connecting External Agents

```typescript
import { acpClient } from './lib/acp/client';

// Connect to weather service
await acpClient.registerServer({
  id: 'weather-agent',
  url: 'http://localhost:3002/api/acp',
  enabled: true
});

// Use it in outfit generation
const weather = await acpClient.executeToolOnServer(
  'weather-agent',
  'get_forecast',
  { location: 'SF', days: 1 }
);

const outfit = generateWeatherAwareOutfit(weather);
```

See [ACP Client Guide](../docs/developer/ACP_CLIENT_GUIDE.md) for complete examples and workflows.

## Differences from A2A/MCP

- **ACP**: Editor ↔ Agent (IDE integration) + Agent ↔ Agent (orchestration)
- **A2A**: Agent ↔ Agent (interoperability framework)
- **MCP**: Agent ↔ Data Source (data access protocol)

All three protocols are complementary and work together in Twin Style.

## Requirements

- Next.js server running (`npm run dev`)
- Editor with ACP support (Zed, JetBrains, etc.) OR external ACP agents
- No additional configuration needed

## Example Workflows

### 1. Editor Integration (Twin Style as Server)

1. Open Zed editor with Twin Style ACP server configured
2. Ask AI: "Search my wardrobe for work-appropriate tops"
3. AI uses `search_wardrobe` tool to find items
4. Ask AI: "Generate an outfit for today's meeting"
5. AI uses `generate_outfit_suggestions` with weather/occasion
6. Get instant outfit recommendations in your editor!

### 2. Multi-Agent Automation (Twin Style as Client)

1. Twin Style connects to Weather Agent + Calendar Agent
2. User asks: "What should I wear today?"
3. Twin Style orchestrates:
   - Gets today's schedule from Calendar Agent
   - Gets weather from Weather Agent
   - Analyzes requirements (formal meeting + rain)
   - Generates perfect outfit automatically
4. Complete context-aware outfit in 2 seconds!
