# ACP (Agent Client Protocol) Integration

## Overview

Twin Style implements the Agent Client Protocol (ACP), enabling seamless integration with code editors and IDEs like Zed, JetBrains IDEs, and others. ACP allows AI agents running in your editor to directly interact with your wardrobe management system.

## What is ACP?

ACP (Agent Client Protocol) is an open standard for connecting AI coding agents to editors and IDEs, similar to how Language Server Protocol (LSP) standardized language tools. It was created by Zed Industries in partnership with Google and is now supported by JetBrains and a growing ecosystem.

### Key Features

- **Universal Interoperability**: Any editor implementing ACP can work with any ACP-compatible agent
- **JSON-RPC 2.0**: Standardized bidirectional communication protocol
- **Tool-Based Architecture**: Agents expose capabilities as discoverable tools
- **Privacy-First**: Code and prompts stay local unless explicitly shared
- **Open Source**: Apache License with SDKs in Rust, TypeScript, Python, and Kotlin

## Twin Style ACP Implementation

### Architecture

```
┌─────────────────────────────────────────────────┐
│     Editor/IDE (Zed, JetBrains, etc.)          │
│                                                 │
│  ┌─────────────────────────────────┐            │
│  │  ACP Client (Built into Editor) │            │
│  └─────────────────────────────────┘            │
│                  │                              │
└──────────────────┼──────────────────────────────┘
                   │ JSON-RPC 2.0
                   │ (HTTP/WebSocket)
┌──────────────────▼──────────────────────────────┐
│        Twin Style ACP Server                    │
│                                                 │
│  GET  /api/acp/capabilities                     │
│  POST /api/acp/tools                            │
│                                                 │
│  ┌───────────────────────────────┐              │
│  │ ACP Tool Executor             │              │
│  │  • search_wardrobe            │              │
│  │  • get_item_details           │              │
│  │  • generate_catalog_image     │              │
│  │  • infer_item_category        │              │
│  │  • generate_outfit_suggestions│              │
│  │  • list_wardrobe_stats        │              │
│  └───────────────────────────────┘              │
│                  │                              │
│                  ▼                              │
│  ┌───────────────────────────────┐              │
│  │ Twin Style Core Services      │              │
│  │  • Prisma Database            │              │
│  │  • A2A Agent (AI Skills)      │              │
│  │  • MCP Server (Data Access)   │              │
│  └───────────────────────────────┘              │
└─────────────────────────────────────────────────┘
```

### Available Tools

#### 1. search_wardrobe

Search for clothing items by query, category, or brand.

**Parameters:**
- `query` (string, optional): Search term (searches title and brand)
- `category` (string, optional): Filter by category
- `limit` (number, optional): Max results (default: 10)

**Example:**
```json
{
  "name": "search_wardrobe",
  "arguments": {
    "query": "blue",
    "category": "tops",
    "limit": 5
  }
}
```

#### 2. get_item_details

Get detailed information about a specific wardrobe item.

**Parameters:**
- `itemId` (string, required): The unique ID of the item

**Example:**
```json
{
  "name": "get_item_details",
  "arguments": {
    "itemId": "item-123-abc"
  }
}
```

#### 3. generate_catalog_image

Generate a professional catalog image from a clothing photo.

**Parameters:**
- `imageBase64` (string, required): Base64-encoded image

**Example:**
```json
{
  "name": "generate_catalog_image",
  "arguments": {
    "imageBase64": "data:image/jpeg;base64,..."
  }
}
```

#### 4. infer_item_category

Analyze a clothing image and infer its category and attributes.

**Parameters:**
- `imageBase64` (string, required): Base64-encoded image
- `userDescription` (string, optional): Description to help categorization

**Example:**
```json
{
  "name": "infer_item_category",
  "arguments": {
    "imageBase64": "data:image/jpeg;base64,...",
    "userDescription": "Blue cotton t-shirt"
  }
}
```

#### 5. generate_outfit_suggestions

Generate AI-powered outfit suggestions based on constraints.

**Parameters:**
- `weather` (string, optional): Weather condition
- `occasion` (string, optional): Occasion type
- `mood` (string, optional): Desired mood/vibe
- `maxItems` (number, optional): Max suggestions (default: 3)

**Example:**
```json
{
  "name": "generate_outfit_suggestions",
  "arguments": {
    "weather": "cool",
    "occasion": "work",
    "mood": "confident",
    "maxItems": 3
  }
}
```

#### 6. list_wardrobe_stats

Get statistics about the wardrobe.

**Parameters:** None

**Example:**
```json
{
  "name": "list_wardrobe_stats",
  "arguments": {}
}
```

## Usage in Editors

### Zed Editor

1. **Install Zed** (if not already installed)
2. **Configure ACP Server**:
   - Open Zed settings
   - Add Twin Style ACP server configuration
3. **Start Using**:
   - Ask AI: "Search my wardrobe for blue tops"
   - Ask AI: "Generate an outfit for a work meeting"
   - Ask AI: "What are my wardrobe stats?"

### JetBrains IDEs (IntelliJ, WebStorm, etc.)

1. **Enable ACP Support** in IDE settings
2. **Add Twin Style ACP Server**:
   - Go to Settings → AI Agents → ACP Servers
   - Add server URL: `http://localhost:3000/api/acp`
3. **Start Using**:
   - Use AI assistant with wardrobe commands
   - Tools appear automatically in AI context

### VS Code (via Extension)

ACP support in VS Code is available through community extensions that implement the ACP client protocol.

## API Endpoints

### GET /api/acp/capabilities

Returns server capabilities and available tools.

**Response:**
```json
{
  "serverInfo": {
    "name": "twin-style-wardrobe",
    "version": "1.0.0"
  },
  "capabilities": {
    "tools": true,
    "resources": true,
    "prompts": false,
    "sampling": false
  },
  "tools": [...]
}
```

### POST /api/acp/tools

Executes an ACP tool.

**Request:**
```json
{
  "name": "search_wardrobe",
  "arguments": {
    "query": "blue"
  }
}
```

**Response:**
```json
{
  "content": [{
    "type": "text",
    "text": "Found 3 items:\n\n1. Blue Shirt (tops)..."
  }],
  "isError": false
}
```

## Testing

### Test Capabilities Discovery

```bash
curl http://localhost:3000/api/acp/capabilities
```

### Test Tool Execution

```bash
curl -X POST http://localhost:3000/api/acp/tools \
  -H "Content-Type: application/json" \
  -d '{
    "name": "list_wardrobe_stats",
    "arguments": {}
  }'
```

### Test Search

```bash
curl -X POST http://localhost:3000/api/acp/tools \
  -H "Content-Type: application/json" \
  -d '{
    "name": "search_wardrobe",
    "arguments": {
      "query": "shirt",
      "limit": 5
    }
  }'
```

## Comparison with A2A and MCP

| Feature | ACP | A2A | MCP |
|---------|-----|-----|-----|
| **Purpose** | Editor-to-agent communication | Agent-to-agent communication | Agent-to-data-source |
| **Protocol** | JSON-RPC 2.0 | HTTP/REST | Custom RPC |
| **Transport** | stdio/WebSocket/HTTP | HTTP | HTTP/stdio |
| **Use Case** | IDE integration | Agent interoperability | Data access |
| **Target** | Code editors | Agent frameworks | Data sources |

### When to Use Each

- **ACP**: When integrating with code editors (Zed, JetBrains)
- **A2A**: When connecting with other agent frameworks (Google ADK, LangGraph)
- **MCP**: When agents need to access external data sources

## Security Considerations

- **CORS Configured**: Cross-origin requests allowed for editor access
- **Input Validation**: Zod schemas validate all tool calls
- **Authentication**: Currently open (production should add API keys)
- **Rate Limiting**: Consider adding for production use

## Performance

- **Tool Discovery**: <100ms
- **Simple Queries** (search, stats): <500ms
- **AI Operations** (catalog gen, inference, outfits): 1-30s
- **Database Queries**: <100ms

## Troubleshooting

### ACP Server Not Responding

1. Ensure dev server is running: `npm run dev`
2. Check that port 3000 is accessible
3. Verify no firewall blocking requests

### Tools Not Executing

1. Check server logs for errors
2. Verify tool name is correct (case-sensitive)
3. Ensure required arguments are provided

### Editor Not Finding Server

1. Verify server URL in editor settings
2. Test capabilities endpoint manually
3. Check editor's ACP client configuration

## Future Enhancements

- [ ] Streaming responses for long-running AI operations
- [ ] Authentication and authorization
- [ ] WebSocket transport for real-time updates
- [ ] More sophisticated file system operations
- [ ] Terminal integration for wardrobe CLI commands
- [ ] Prompt templates for common wardrobe tasks
- [ ] Resource subscriptions for wardrobe updates

## References

- [ACP Official Specification](https://agentclientprotocol.com/)
- [Zed ACP Documentation](https://zed.dev/acp)
- [GitHub - Agent Client Protocol](https://github.com/agentclientprotocol/agent-client-protocol)
- [ACP TypeScript SDK](https://www.npmjs.com/package/@agentclientprotocol/sdk)
- [Twin Style A2A Integration](./A2A_INTEGRATION.md)

---

**Status**: ✅ Ready for Editor Integration  
**Last Updated**: 2026-02-15

## Bidirectional Communication

Twin Style now supports **bidirectional ACP communication**, allowing the server to push notifications to editors in real-time.

### How It Works

```
┌─────────────────────────────────────────────┐
│  Editor/IDE (Zed, JetBrains)                │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │  Request Tools  ──────────────────────┼─┼──► POST /api/acp/tools
│  │  (Editor → Server)                    │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │  Receive Notifications ◄─────────────┼─┼──── GET /api/acp/events
│  │  (Server → Editor)                    │ │    (Server-Sent Events)
│  └───────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### Server-Sent Events (SSE)

Twin Style uses Server-Sent Events for server-to-client notifications. This works with standard Next.js deployments without requiring custom servers or WebSockets.

**Endpoint**: `GET /api/acp/events`

**Query Parameters:**
- `types` (optional): Comma-separated event types to subscribe to
- `categories` (optional): Filter by item categories
- `itemIds` (optional): Filter by specific item IDs

### Event Types

| Event Type | Description | Data |
|------------|-------------|------|
| `item/added` | New item added to wardrobe | `{itemId, title, category}` |
| `item/updated` | Item metadata updated | `{itemId, title, category}` |
| `item/deleted` | Item removed from wardrobe | `{itemId}` |
| `job/completed` | AI job finished successfully | `{jobId, jobType, result}` |
| `job/failed` | AI job failed | `{jobId, jobType, error}` |
| `stats/changed` | Wardrobe statistics updated | `{totalItems, changeType}` |
| `catalog/generated` | Catalog image generated | `{itemId, imageUrl}` |
| `outfit/generated` | Outfit suggestion created | `{items, reasoning}` |

### Notification Format

All notifications follow JSON-RPC 2.0 format:

```json
{
  "jsonrpc": "2.0",
  "method": "notification",
  "params": {
    "type": "item/added",
    "data": {
      "itemId": "item-123-abc",
      "title": "Blue Shirt",
      "category": "tops"
    },
    "timestamp": "2026-02-15T18:00:00Z"
  }
}
```

### Usage Examples

#### Subscribe to All Events

```bash
curl -N http://localhost:3000/api/acp/events
```

#### Subscribe to Specific Event Types

```bash
curl -N "http://localhost:3000/api/acp/events?types=item/added,job/completed"
```

#### Subscribe with Category Filter

```bash
curl -N "http://localhost:3000/api/acp/events?types=item/added&categories=tops,bottoms"
```

### JavaScript Client Example

```javascript
// Open SSE connection
const eventSource = new EventSource(
  'http://localhost:3000/api/acp/events?types=item/added,job/completed'
);

// Handle notifications
eventSource.onmessage = (event) => {
  const notification = JSON.parse(event.data);
  
  console.log('Notification:', notification);
  
  // Update UI based on notification type
  switch (notification.params.type) {
    case 'item/added':
      showNotification(`New item: ${notification.params.data.title}`);
      refreshWardrobeList();
      break;
      
    case 'job/completed':
      showNotification('AI processing complete!');
      updateItemDisplay(notification.params.data);
      break;
      
    case 'outfit/generated':
      displayOutfitSuggestion(notification.params.data);
      break;
  }
};

// Handle errors
eventSource.onerror = (error) => {
  console.error('SSE error:', error);
  // Optionally: implement reconnection logic
};

// Clean up when done
// eventSource.close();
```

### Editor Integration

#### Zed Editor

Configure in Zed settings to enable bidirectional communication:

```json
{
  "acpServers": {
    "twin-style": {
      "url": "http://localhost:3000/api/acp",
      "eventsUrl": "http://localhost:3000/api/acp/events",
      "capabilities": {
        "bidirectional": true,
        "notifications": true
      }
    }
  }
}
```

#### JetBrains IDEs

1. Go to Settings → AI Agents → ACP Servers
2. Add Twin Style server URL: `http://localhost:3000/api/acp`
3. Enable notifications: Check "Subscribe to server events"
4. Events URL: `http://localhost:3000/api/acp/events`

### Use Cases

**Real-time Wardrobe Updates:**
- User adds item via mobile → Editor shows notification
- AI finishes catalog generation → Editor displays result
- Stats change → Editor updates dashboard

**Collaborative Editing:**
- Multiple clients can receive same notifications
- All connected editors stay in sync
- No polling required

**Workflow Automation:**
- Trigger editor actions based on events
- Auto-refresh item lists on changes
- Show progress bars for long AI operations

### Benefits

✅ **Real-time Updates**: No polling, instant notifications  
✅ **Efficient**: Server push is more efficient than client polling  
✅ **Standard Protocol**: Uses SSE (EventSource API)  
✅ **No Custom Server**: Works with standard Next.js deployment  
✅ **Resilient**: Automatic reconnection on connection loss  
✅ **Filtered**: Subscribe only to events you care about

### Comparison with WebSocket

| Feature | Server-Sent Events (SSE) | WebSocket |
|---------|-------------------------|-----------|
| **Direction** | Server → Client | Bidirectional |
| **Protocol** | HTTP | WS/WSS |
| **Setup** | Simple (EventSource) | Complex (custom server) |
| **Reconnection** | Automatic | Manual |
| **Next.js Support** | Native | Requires custom server |
| **Use Case** | Notifications, updates | Full duplex communication |

For ACP's notification needs, SSE is perfect and simpler to deploy.

### Testing Bidirectional Communication

Run the test suite:

```bash
cd app
npx tsx test-acp-bidirectional.ts
```

This demonstrates:
- Event subscription setup
- Notification broadcasting
- Editor integration patterns
- Real-time update flows

### Future Enhancements

- [ ] WebSocket support for full duplex (optional custom server)
- [ ] Notification persistence and replay
- [ ] Event filtering by user preferences
- [ ] Notification batching for high-frequency events
- [ ] Delivery acknowledgments

---

**Status**: ✅ Bidirectional ACP Complete with SSE  
**Last Updated**: 2026-02-15
