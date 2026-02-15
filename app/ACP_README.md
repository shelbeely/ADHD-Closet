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

## Differences from A2A/MCP

- **ACP**: Editor ↔ Agent (IDE integration)
- **A2A**: Agent ↔ Agent (interoperability)
- **MCP**: Agent ↔ Data Source (data access)

All three protocols are complementary and work together in Twin Style.

## Requirements

- Next.js server running (`npm run dev`)
- Editor with ACP support (Zed, JetBrains, etc.)
- No additional configuration needed

## Example Workflow

1. Open Zed editor with Twin Style ACP server configured
2. Ask AI: "Search my wardrobe for work-appropriate tops"
3. AI uses `search_wardrobe` tool to find items
4. Ask AI: "Generate an outfit for today's meeting"
5. AI uses `generate_outfit_suggestions` with weather/occasion
6. Get instant outfit recommendations in your editor!
