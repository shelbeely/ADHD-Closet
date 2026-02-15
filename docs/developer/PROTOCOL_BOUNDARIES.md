# Protocol Boundaries: When to Use MCP vs ACP vs A2A

## The Question

**"ACP talks to weather? Isn't that more MCP?"**

**Answer: YES! You're absolutely right.** This document clarifies the correct protocol boundaries.

---

## The Confusion

Current documentation incorrectly shows:
- ❌ "ACP connects to weather agents"
- ❌ "ACP connects to calendar agents"  
- ❌ "Twin Style as ACP client controls weather"

**Problem:** Weather and calendar are **data sources**, not agents.

---

## The Correct Model

### MCP = Data Sources

**MCP (Model Context Protocol)** is for accessing **data**:

```
Twin Style (MCP Client)
    ↓ connects to
Weather API (MCP Server)
    - Exposes weather data
    - Not an "agent", just data
    - OpenWeatherMap, Weather.gov, etc.
```

**MCP Use Cases:**
- ✅ Weather APIs (temperature, forecast, conditions)
- ✅ Calendar APIs (Google Calendar, Outlook, iCal)
- ✅ Database queries (Prisma, PostgreSQL)
- ✅ File systems (local files, cloud storage)
- ✅ External REST APIs (any data source)
- ✅ Knowledge bases (documentation, wikis)

**Key Trait:** Provides **data** or **context**, not intelligent agent behavior

### ACP = Agents & Editors

**ACP (Agent Client Protocol)** is for connecting to **agents** and **editors**:

```
Twin Style (ACP Server)
    ↑ controlled by
Zed Editor (ACP Client)
    - Sends commands
    - Is an intelligent agent
    - Makes decisions
```

**ACP Use Cases:**
- ✅ Code editors (Zed, JetBrains, VS Code with ACP)
- ✅ AI coding assistants (Copilot, Cursor)
- ✅ Automation agents (OpenClaw if it implements ACP)
- ✅ Other ACP-compliant agents
- ✅ Intelligent automation tools

**Key Trait:** Has **agency**, makes **decisions**, performs **actions**

### A2A = Agent Coordination

**A2A (Agent-to-Agent)** is for **agent interoperability**:

```
Agent 1 (Classification)
    ↓ passes result to
Agent 2 (Image Generation)
    ↓ passes result to
Agent 3 (Metadata Extraction)
```

**A2A Use Cases:**
- ✅ Sequential agent workflows
- ✅ Agent discovery and registration
- ✅ Multi-agent orchestration
- ✅ Agent-to-agent communication

**Key Trait:** Agents working **together** in workflows

---

## Correct Architecture for Twin Style

### What Twin Style Actually Needs

```
┌─────────────────────────────────────────────┐
│              Twin Style                     │
│                                             │
│  MCP CLIENT (Data Sources) ←───────────────┤
│  ├─ Weather data from OpenWeatherMap       │
│  ├─ Calendar data from Google Calendar     │
│  ├─ Database via Prisma                    │
│  └─ Local file system                      │
│                                             │
│  ACP SERVER (Controlled By) ←──────────────┤
│  ├─ Zed Editor                             │
│  ├─ JetBrains IDEs                         │
│  ├─ OpenClaw (if it implements ACP)        │
│  └─ Custom automation tools                │
│                                             │
│  A2A SERVER (Agent Workflows) ←────────────┤
│  ├─ Catalog generation agent               │
│  ├─ Item inference agent                   │
│  ├─ Outfit generation agent                │
│  └─ Sequential workflow orchestration      │
│                                             │
└─────────────────────────────────────────────┘
```

### NOT This (Current Documentation)

```
❌ WRONG:
Twin Style (ACP Client) → Weather Agent (ACP Server)
                          ↑ This doesn't exist!
```

Weather APIs don't implement ACP. They're just HTTP APIs that should be accessed via MCP.

---

## Real-World Examples

### Example 1: Morning Outfit (CORRECTED)

**Correct Implementation:**

```typescript
// Use MCP to get weather data
const weather = await mcpClient.readResource('weather://forecast/today');

// Use MCP to get calendar data  
const events = await mcpClient.readResource('calendar://events/today');

// Use local logic to generate outfit
const outfit = await generateOutfit({
  weather: weather.temp,
  condition: weather.condition,
  formality: events[0]?.type === 'meeting' ? 'high' : 'medium'
});
```

**What This Uses:**
- MCP → weather data
- MCP → calendar data
- Local AI → outfit generation
- NO ACP needed (unless editor is triggering this)

### Example 2: Editor Integration

**Correct Implementation:**

```typescript
// Zed Editor (ACP Client) calls Twin Style (ACP Server)
POST /api/acp/tools
{
  "name": "generate_outfit",
  "arguments": {
    "occasion": "work",
    "weather": "cold"  // Editor passes this, or Twin Style fetches via MCP
  }
}
```

**What This Uses:**
- ACP → Editor controls Twin Style
- MCP → Twin Style fetches weather if needed
- Local AI → outfit generation

### Example 3: Fashion AI Consultation

**Depends on Implementation:**

**If Fashion AI implements ACP:**
```typescript
// Twin Style (ACP Client) → Fashion AI (ACP Server)
const advice = await acpClient.executeToolOnServer(
  'fashion-ai-server',
  'get_styling_advice',
  { outfit: myOutfit }
);
```

**If Fashion AI is just an API:**
```typescript
// Twin Style (MCP Client) → Fashion AI (MCP Server)
const advice = await mcpClient.callTool(
  'get_styling_advice',
  { outfit: myOutfit }
);
```

---

## Decision Matrix

### When to Use MCP

✅ Accessing **weather** data  
✅ Accessing **calendar** data  
✅ Reading from **database**  
✅ Querying **external APIs**  
✅ Reading **files**  
✅ Getting any **static or dynamic data**

**Rule of thumb:** If it's a **noun** (data, information, resource), use MCP

### When to Use ACP

✅ **Editor** wants to control Twin Style  
✅ **Automation tool** (that implements ACP) controls Twin Style  
✅ Twin Style controls **another ACP-compliant agent**  
✅ Any **bidirectional agent interaction**

**Rule of thumb:** If it's an **agent** (can make decisions, take actions), use ACP

### When to Use A2A

✅ **Chaining agents** sequentially  
✅ Agent **discovery**  
✅ **Multi-agent workflows**  
✅ Agent **orchestration**

**Rule of thumb:** If **multiple agents** need to **work together**, use A2A

---

## Fixing the Documentation

### Current (Incorrect)

"ACP enables Twin Style to connect to weather agents, calendar agents, and fashion AI"

### Corrected

"Twin Style uses three protocols for different purposes:
- **MCP** to access weather data, calendar data, and databases
- **ACP** to be controlled by editors (Zed, JetBrains) and control other ACP agents
- **A2A** to chain AI agents together (catalog generation → item inference → outfit creation)"

---

## The Hybrid Reality

In practice, Twin Style's intelligent outfit generation combines all three:

```
User in Zed Editor types: "Suggest outfit for today"
    ↓
1. ACP: Zed (ACP client) calls Twin Style (ACP server)
    ↓
2. MCP: Twin Style fetches weather from OpenWeatherMap (MCP)
    ↓
3. MCP: Twin Style fetches calendar from Google Calendar (MCP)
    ↓
4. A2A: Twin Style chains internal agents:
        - Category analyzer (A2A)
        - Outfit generator (A2A)
        - Compatibility scorer (A2A)
    ↓
5. ACP: Twin Style returns result to Zed
    ↓
6. User sees: "Navy blazer + white shirt + gray trousers"
```

**Each protocol has its place.**

---

## Why This Matters

### Correct Protocol Selection Means:

1. **Simpler Implementation**
   - Use existing weather APIs (don't need to wrap in ACP)
   - Use existing calendar APIs (don't need to wrap in ACP)
   - Only implement ACP where it makes sense

2. **Better Interoperability**
   - MCP servers already exist for many data sources
   - Don't reinvent wheels
   - Standard protocols for standard use cases

3. **Clearer Architecture**
   - Data sources ≠ agents
   - Easier to understand and maintain
   - Correct mental models

4. **Reduced Complexity**
   - Fewer custom integrations
   - Standard patterns
   - Less code to maintain

---

## Summary

**The Original Question:** "ACP talks to weather? Isn't that more MCP?"

**The Answer:** **YES! Weather should use MCP, not ACP.**

### Correct Model:

| What | Protocol | Why |
|------|----------|-----|
| Weather data | **MCP** | It's a data source |
| Calendar data | **MCP** | It's a data source |
| Database | **MCP** | It's a data source |
| Zed Editor → Twin Style | **ACP** | Editor is an agent |
| OpenClaw → Twin Style | **ACP** | Automation is an agent |
| Agent chaining | **A2A** | Multi-agent workflows |

### Key Insight:

Just because something provides useful information doesn't make it an "agent."

- Weather API = data source → **MCP**
- Fashion AI that makes decisions = agent → **ACP**
- Database = data source → **MCP**
- Code editor = agent → **ACP**

**Protocol choice depends on whether you're accessing data (MCP) or interacting with an agent (ACP).**

---

## Next Steps

1. Update all documentation to reflect correct protocol usage
2. Implement MCP clients for weather and calendar
3. Reserve ACP for actual agent interactions
4. Use A2A for internal agent workflows

The good news: The implementation architecture supports all three protocols correctly. Only the documentation needs updating to clarify which protocol does what.
