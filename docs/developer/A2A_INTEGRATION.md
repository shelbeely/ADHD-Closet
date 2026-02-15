# A2A (Agent-to-Agent) Protocol Implementation

## Overview

Twin Style now exposes its AI agents as A2A servers, making them discoverable and interoperable with other agent frameworks (Google ADK, LangGraph, Microsoft Copilot Studio, etc.). This implementation includes:

1. **A2A Server**: Exposes Twin Style agents as HTTP endpoints
2. **Agent Card**: Discoverable metadata at `/.well-known/agent-card.json`
3. **Sequential Chaining**: ADK orchestrator for chaining agents
4. **MCP Integration**: Connects agents to external data sources via Model Context Protocol

## Architecture

```
┌─────────────────────────────────────────────────────┐
│           A2A Protocol Layer                        │
│                                                     │
│  ┌─────────────┐        ┌──────────────────┐      │
│  │ Agent Card  │        │  Execute Endpoint │      │
│  │ (Discovery) │        │  (/api/a2a)      │      │
│  └─────────────┘        └──────────────────┘      │
│                                                     │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│           Twin Style Agents                         │
│                                                     │
│  • generate_catalog_image                           │
│  • infer_item_attributes                            │
│  • extract_label_info                               │
│  • generate_outfit                                  │
│                                                     │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│           MCP Data Sources                          │
│                                                     │
│  • Wardrobe Database (Prisma)                       │
│  • External APIs (extensible)                       │
│                                                     │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│           ADK Orchestrator                          │
│                                                     │
│  Sequential Chaining:                               │
│    Agent 1 → Agent 2 → Agent 3 → Result            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Agent Card

The agent card is exposed at:

```
GET /.well-known/agent-card.json
```

This provides metadata about available skills, input/output schemas, and endpoints.

Example:
```json
{
  "name": "twin-style-wardrobe",
  "version": "1.0.0",
  "description": "AI-powered wardrobe organizer with ADHD-optimized workflows",
  "skills": [
    {
      "name": "generate_catalog_image",
      "description": "Generates clean catalog images from clothing photos",
      "inputSchema": { ... },
      "outputSchema": { ... }
    },
    ...
  ],
  "endpoints": {
    "a2a": "http://localhost:3000/api/a2a"
  }
}
```

## Available Skills

### 1. generate_catalog_image

Generates a clean, professional catalog image from a clothing photo.

**Input:**
```json
{
  "imageBase64": "base64-encoded image"
}
```

**Output:**
```json
{
  "generatedImageUrl": "url or base64",
  "confidence": 0.9
}
```

### 2. infer_item_attributes

Analyzes clothing and infers category, colors, pattern, style, and occasion.

**Input:**
```json
{
  "imageBase64": "base64-encoded image",
  "userPrompt": "optional description"
}
```

**Output:**
```json
{
  "category": "tops",
  "colors": ["blue", "white"],
  "pattern": "striped",
  "style": ["casual"],
  "occasion": ["weekend"],
  "confidence": { "category": 0.95, ... }
}
```

### 3. extract_label_info

Extracts brand and care instructions from label photos using OCR.

**Input:**
```json
{
  "imageBase64": "base64-encoded label image"
}
```

**Output:**
```json
{
  "brand": "Brand Name",
  "careInstructions": "Machine wash cold...",
  "confidence": 0.85
}
```

### 4. generate_outfit

Generates outfit suggestions based on constraints and available items.

**Input:**
```json
{
  "constraints": {
    "weather": "warm",
    "occasion": "work",
    "mood": "confident",
    "colors": ["blue", "gray"]
  },
  "availableItems": [
    { "id": "item1", "category": "tops", "colors": ["blue"], ... },
    ...
  ]
}
```

**Output:**
```json
{
  "outfits": [
    {
      "items": ["item1", "item2", "item3"],
      "reasoning": "Professional and weather-appropriate...",
      "confidence": 0.9
    }
  ]
}
```

## Using A2A Protocol

### Execute a Skill

```bash
POST /api/a2a/execute
Content-Type: application/json

{
  "taskId": "task-123",
  "skillName": "infer_item_attributes",
  "input": {
    "imageBase64": "..."
  },
  "context": {
    "userId": "user1"
  }
}
```

**Response:**
```json
{
  "taskId": "task-123",
  "status": "completed",
  "output": {
    "category": "tops",
    "colors": ["blue"],
    ...
  }
}
```

## Sequential Chaining with ADK

The orchestrator allows you to chain agents sequentially, where the output of one agent feeds into the next.

### Example: Upload → Process → Categorize → Generate Outfit

```typescript
import { orchestrator } from '@/app/lib/a2a/orchestrator';
import { uploadToOutfitWorkflow } from '@/app/lib/a2a/workflows';

const result = await orchestrator.executeWorkflow({
  ...uploadToOutfitWorkflow,
  initialContext: {
    originalImageBase64: imageBase64,
    userPrompt: "Blue button-up shirt",
    constraints: {
      weather: "cold",
      occasion: "work"
    },
    availableItems: await fetchAvailableItems()
  }
});

console.log(result.finalOutput); // Outfit suggestions
```

### Custom Workflow

```typescript
import { SequentialWorkflow } from '@/app/lib/a2a/orchestrator';

const customWorkflow: SequentialWorkflow = {
  name: 'my-workflow',
  description: 'Custom processing pipeline',
  steps: [
    {
      agentUrl: 'http://localhost:3000/api/a2a',
      skillName: 'generate_catalog_image',
      mapInput: (previousOutput, context) => ({
        imageBase64: context.originalImage
      })
    },
    {
      agentUrl: 'http://localhost:3000/api/a2a',
      skillName: 'infer_item_attributes',
      mapInput: (previousOutput, context) => ({
        imageBase64: previousOutput.generatedImageUrl
      })
    }
  ],
  initialContext: { originalImage: '...' }
};

const result = await orchestrator.executeWorkflow(customWorkflow);
```

## MCP (Model Context Protocol) Integration

MCP allows agents to access external data sources like databases and APIs.

### Available Data Sources

#### wardrobe-database

Access to Twin Style's wardrobe database via Prisma.

**Available Tools:**
- `search_items`: Search wardrobe items by filters
- `get_item_by_id`: Get specific item details
- `get_available_items`: List all available items

### List MCP Resources

```bash
GET /api/a2a/mcp/resources?dataSource=wardrobe-database
```

**Response:**
```json
{
  "resources": [
    {
      "uri": "wardrobe://items/item-123",
      "name": "Blue Shirt",
      "description": "Wardrobe item in category: tops",
      "mimeType": "application/json"
    },
    ...
  ]
}
```

### Read MCP Resource

```bash
GET /api/a2a/mcp/resources?dataSource=wardrobe-database&uri=wardrobe://items/item-123
```

**Response:**
```json
{
  "id": "item-123",
  "name": "Blue Shirt",
  "category": "tops",
  "colors": ["blue"],
  "images": [...],
  "tags": [...]
}
```

### List MCP Tools

```bash
GET /api/a2a/mcp/tools?dataSource=wardrobe-database
```

**Response:**
```json
{
  "tools": [
    {
      "name": "search_items",
      "description": "Search wardrobe items by category, color, style, or occasion",
      "inputSchema": { ... }
    },
    ...
  ]
}
```

### Execute MCP Tool

```bash
POST /api/a2a/mcp/tools
Content-Type: application/json

{
  "dataSource": "wardrobe-database",
  "toolName": "search_items",
  "args": {
    "category": "tops",
    "colors": ["blue"],
    "style": ["casual"]
  }
}
```

**Response:**
```json
{
  "result": [
    {
      "id": "item-123",
      "name": "Blue Casual Shirt",
      "category": "tops",
      "colors": ["blue"],
      "style": ["casual"],
      "imageUrl": "..."
    },
    ...
  ]
}
```

## Agent Integration with MCP

Agents can use MCP to access data sources:

```typescript
import { mcpServer } from '@/app/lib/a2a/mcp';

// List available items using MCP
const items = await mcpServer.callTool(
  'wardrobe-database',
  'get_available_items',
  { limit: 50 }
);

// Use items in agent skill
const outfits = await twinStyleAgent.executeSkill('generate_outfit', {
  constraints: { weather: 'warm', occasion: 'casual' },
  availableItems: items
});
```

## Environment Variables

No additional environment variables are required. The A2A server uses the existing configuration:

- `PUBLIC_BASE_URL`: Base URL for agent endpoints (default: `http://localhost:3000`)
- `DATABASE_URL`: Database connection for MCP data source
- `OPENROUTER_API_KEY`: AI provider for agent skills

## Testing

### Test Agent Card Discovery

```bash
curl http://localhost:3000/.well-known/agent-card.json
```

### Test Skill Execution

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

### Test MCP Resources

```bash
curl http://localhost:3000/api/a2a/mcp/resources?dataSource=wardrobe-database
```

### Test MCP Tools

```bash
curl http://localhost:3000/api/a2a/mcp/tools?dataSource=wardrobe-database

curl -X POST http://localhost:3000/api/a2a/mcp/tools \
  -H "Content-Type: application/json" \
  -d '{
    "dataSource": "wardrobe-database",
    "toolName": "search_items",
    "args": {
      "category": "tops",
      "colors": ["blue"]
    }
  }'
```

## Integrating with Other Frameworks

### Google ADK

```typescript
import { RemoteA2aAgent } from '@google/adk';

const twinStyleAgent = new RemoteA2aAgent({
  cardUrl: 'http://localhost:3000/.well-known/agent-card.json'
});

await twinStyleAgent.executeSkill('infer_item_attributes', {
  imageBase64: '...'
});
```

### LangGraph

```python
from langgraph import A2AAgent

twin_style = A2AAgent(
    card_url="http://localhost:3000/.well-known/agent-card.json"
)

result = twin_style.execute_skill(
    skill_name="generate_outfit",
    input={
        "constraints": {"weather": "warm"},
        "availableItems": items
    }
)
```

### Microsoft Copilot Studio

1. Add Agent Connection → Agent-to-Agent (A2A)
2. Enter Agent URL: `http://localhost:3000`
3. Agent card will be auto-discovered
4. Select available skills to use in your copilot

## Security Considerations

- **CORS**: Configured to allow cross-origin requests for agent discovery
- **Authentication**: Currently open (production should add API key authentication)
- **Input Validation**: All inputs validated with Zod schemas
- **Rate Limiting**: Consider adding rate limits for production use

## Performance

- **Skill Execution**: 1-30 seconds depending on AI processing
- **MCP Queries**: <500ms for database operations
- **Agent Discovery**: <100ms for agent card retrieval
- **Sequential Chaining**: Sum of individual agent execution times + overhead (~100ms per step)

## Troubleshooting

### Agent Card Not Found

Ensure the dev server is running:
```bash
cd app && npm run dev
```

### Skill Execution Fails

Check that:
1. OpenRouter API key is configured
2. Database connection is available
3. Redis is running for job queue

### MCP Tools Return Empty

Ensure database is populated with items:
```bash
npm run prisma:seed
```

## Future Enhancements

- [ ] Authentication and authorization for A2A endpoints
- [ ] Agent metrics and monitoring
- [ ] Streaming responses for long-running tasks
- [ ] Agent discovery registry
- [ ] More MCP data sources (weather API, calendar, etc.)
- [ ] WebSocket support for real-time agent communication
- [ ] Agent-to-agent direct communication (bypassing orchestrator)

## References

- [A2A Protocol Specification](https://a2a-protocol.org/)
- [Google ADK Documentation](https://google.github.io/adk-docs/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Twin Style Architecture](/.github/memory/architecture.md)
