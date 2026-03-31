# A2A (Agent-to-Agent) Integration

## Quick Start

Twin Style now exposes its AI agents via the A2A protocol, making them discoverable and interoperable with other agent frameworks.

### Agent Discovery

```bash
curl http://localhost:3000/.well-known/agent-card.json
```

### Execute a Skill

```bash
curl -X POST http://localhost:3000/api/a2a/execute \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "test-123",
    "skillName": "infer_item_attributes",
    "input": {
      "imageBase64": "...",
      "userPrompt": "blue shirt"
    }
  }'
```

### Use MCP Data Sources

```bash
# List available items
curl -X POST http://localhost:3000/api/a2a/mcp/tools \
  -H "Content-Type: application/json" \
  -d '{
    "dataSource": "wardrobe-database",
    "toolName": "get_available_items",
    "args": { "limit": 10 }
  }'
```

## Available Skills

1. **generate_catalog_image** - Generates clean catalog images from photos
2. **infer_item_attributes** - Categorizes clothing using vision AI
3. **extract_label_info** - Extracts brand/care info via OCR
4. **generate_outfit** - Creates outfit suggestions based on constraints

## Sequential Chaining

Chain agents together where output feeds into the next agent:

```typescript
import { orchestrator, uploadToOutfitWorkflow } from '@/app/lib/a2a';

const result = await orchestrator.executeWorkflow({
  ...uploadToOutfitWorkflow,
  initialContext: {
    originalImageBase64: imageData,
    constraints: { weather: 'cool', occasion: 'work' }
  }
});
```

## MCP Integration

Access external data sources via Model Context Protocol:

```typescript
import { mcpServer } from '@/app/lib/a2a/mcp';

const items = await mcpServer.callTool(
  'wardrobe-database',
  'search_items',
  { category: 'tops', colors: ['blue'] }
);
```

## Integration with Other Frameworks

### Google ADK

```typescript
import { RemoteA2aAgent } from '@google/adk';

const twinStyle = new RemoteA2aAgent({
  cardUrl: 'http://localhost:3000/.well-known/agent-card.json'
});

await twinStyle.executeSkill('generate_outfit', {...});
```

### LangGraph

```python
from langgraph import A2AAgent

twin_style = A2AAgent(
  card_url="http://localhost:3000/.well-known/agent-card.json"
)

result = twin_style.execute_skill("infer_item_attributes", {...})
```

### Microsoft Copilot Studio

1. Go to Agent Connections → Add Agent
2. Select Agent-to-Agent (A2A)
3. Enter URL: `http://localhost:3000`
4. Agent card will be auto-discovered

## Documentation

See [`docs/developer/A2A_INTEGRATION.md`](../../docs/developer/A2A_INTEGRATION.md) for complete documentation including:

- Architecture overview
- Skill definitions with schemas
- Sequential workflow examples
- MCP data source guide
- Testing instructions
- Security considerations

## Testing

Run the test suite:

```bash
cd app
npx tsx test-a2a.ts
```

Run examples:

```bash
npx tsx examples-a2a.ts
```

## Files

```
app/lib/a2a/
├── types.ts           # TypeScript interfaces
├── agent-card.ts      # Agent discovery metadata
├── agent.ts           # Agent implementation
├── orchestrator.ts    # Sequential chaining
├── workflows.ts       # Pre-defined workflows
├── mcp.ts            # MCP data source integration
└── index.ts          # Main exports

app/api/a2a/
├── execute/          # Skill execution endpoint
└── mcp/
    ├── resources/    # MCP resource access
    └── tools/        # MCP tool execution

app/api/.well-known/
└── agent-card.json/  # Agent discovery endpoint
```

## Requirements

- Next.js 16+ (MCP support built-in)
- Running database (Supabase)
- OpenRouter API key for AI skills
- Dependencies: `@a2a-js/sdk`, `@google/adk`, `zod`

## Environment Variables

No additional environment variables required. Uses existing configuration:

- `PUBLIC_BASE_URL` - Base URL for agent endpoints
- `DATABASE_URL` - Database for MCP data source
- `OPENROUTER_API_KEY` - AI provider for skills
