# Twin Style as ACP Client: Complete Guide

## Overview

This guide explains how Twin Style functions as an **ACP client**, what it means to "control" other agents, and the practical benefits this provides.

## Table of Contents

1. [Understanding Client vs Server Roles](#understanding-client-vs-server-roles)
2. [What "Control" Actually Means](#what-control-actually-means)
3. [How Twin Style Controls Other Agents](#how-twin-style-controls-other-agents)
4. [Real-World Benefits](#real-world-benefits)
5. [8 Practical Workflows](#8-practical-workflows)
6. [Implementation Guide](#implementation-guide)
7. [Multi-Agent Orchestration](#multi-agent-orchestration)

---

## Understanding Client vs Server Roles

### Twin Style's Dual Role

```
┌─────────────────────────────────────────────────┐
│            Twin Style (Port 3000)               │
│                                                 │
│  Role 1: ACP SERVER                             │
│  ├─ Receives requests from editors/agents      │
│  ├─ Executes wardrobe operations               │
│  ├─ Sends notifications to subscribers          │
│  └─ CONTROLLED BY: Zed, OpenClaw, etc.        │
│                                                 │
│  Role 2: ACP CLIENT                             │
│  ├─ Connects to external ACP agents            │
│  ├─ Requests services from other agents        │
│  ├─ Subscribes to external events              │
│  └─ CONTROLS: Weather, Calendar, AI agents     │
└─────────────────────────────────────────────────┘
```

### As ACP Server (Being Controlled)

**Who controls Twin Style:**
- Code editors (Zed, JetBrains)
- Automation tools (OpenClaw, n8n)
- Mobile apps
- Custom scripts

**What they can do:**
- Search wardrobe
- Add/update/delete items
- Generate outfits
- Trigger AI processing
- Get statistics

### As ACP Client (Controlling Others)

**Who Twin Style controls:**
- Weather agents (get forecast data)
- Calendar agents (check schedule)
- AI assistants (get styling advice)
- Smart home agents (control lighting)
- Shopping agents (find matching items)

**What Twin Style can do:**
- Request external data
- Execute external tools
- Subscribe to external events
- Orchestrate multi-agent workflows

---

## What "Control" Actually Means

### Not Command & Control

❌ **What it's NOT:**
- Authoritative control
- Forcing other agents to do things
- Top-down hierarchy

✅ **What it IS:**
- **Discovery**: Finding what agents can do
- **Request**: Asking agents for services
- **Integration**: Combining external data
- **Orchestration**: Coordinating workflows
- **Reaction**: Responding to external events

### The Orchestration Model

Think of Twin Style as a **conductor** in an orchestra:

```
Conductor (Twin Style Client)
    ↓
    ├─ Violin section (Weather Agent) → Provides forecast
    ├─ Brass section (Calendar Agent) → Provides schedule
    ├─ Woodwinds (Fashion AI) → Provides styling
    └─ Percussion (Smart Home) → Provides environment
    
Result: Beautiful symphony (Context-aware outfit suggestion)
```

---

## How Twin Style Controls Other Agents

### Step-by-Step Process

#### 1. Discovery Phase

**Twin Style discovers what agents exist and what they can do:**

```typescript
// Register an external agent
await acpClient.registerServer({
  id: 'weather-agent',
  name: 'Weather Service',
  url: 'http://localhost:3002/api/acp',
  eventsUrl: 'http://localhost:3002/api/acp/events',
  enabled: true
});

// Fetch its capabilities
const capabilities = await acpClient.fetchCapabilities('weather-agent');
console.log(capabilities);
// Output:
// {
//   name: "Weather Service",
//   version: "1.0.0",
//   tools: [
//     { name: "get_forecast", description: "Get weather forecast" },
//     { name: "get_current_weather", ... },
//     { name: "get_alerts", ... }
//   ]
// }
```

#### 2. Request Phase

**Twin Style requests services from external agents:**

```typescript
// Execute a tool on the weather agent
const forecast = await acpClient.executeToolOnServer(
  'weather-agent',
  'get_forecast',
  {
    location: 'San Francisco',
    days: 7
  }
);

console.log(forecast);
// Output:
// {
//   location: "San Francisco",
//   days: [
//     { date: "2026-02-15", temp: 65, condition: "sunny", ... },
//     { date: "2026-02-16", temp: 58, condition: "cloudy", ... },
//     ...
//   ]
// }
```

#### 3. Integration Phase

**Twin Style uses external data to make better decisions:**

```typescript
async function generateWeatherAwareOutfit() {
  // Get external data
  const weather = await acpClient.executeToolOnServer(
    'weather-agent',
    'get_forecast',
    { location: 'SF', days: 1 }
  );
  
  // Use it to inform wardrobe decisions
  const constraints = {
    temperature: weather.days[0].temp,
    conditions: weather.days[0].condition,
    needsLayers: weather.days[0].temp < 60,
    needsRainGear: weather.days[0].precipitation > 50
  };
  
  // Generate smart outfit
  return await generateOutfitSuggestions(constraints);
}
```

#### 4. Orchestration Phase

**Twin Style coordinates multiple agents:**

```typescript
async function generateCompleteOutfitPlan() {
  // Parallel requests to multiple agents
  const [weather, events, fashionAdvice] = await Promise.all([
    acpClient.executeToolOnServer('weather-agent', 'get_forecast', {...}),
    acpClient.executeToolOnServer('calendar-agent', 'get_today_events', {}),
    acpClient.executeToolOnServer('fashion-ai', 'get_style_tips', {...})
  ]);
  
  // Combine all inputs
  const outfit = analyzeAndGenerateOutfit({
    weather: weather.days[0],
    events: events.items,
    styleAdvice: fashionAdvice.tips,
    wardrobe: await searchWardrobe({...})
  });
  
  return outfit;
}
```

#### 5. Reaction Phase

**Twin Style subscribes to events and reacts:**

```typescript
// Subscribe to weather alerts
await acpClient.subscribeToServerEvents(
  'weather-agent',
  ['weather/alert', 'weather/severe']
);

// When alert received, notify user
acpClient.on('notification', (event) => {
  if (event.type === 'weather/alert') {
    notifyUser({
      title: 'Weather Alert',
      message: `${event.data.severity}: ${event.data.description}`,
      suggestion: suggestOutfitChange(event.data.conditions)
    });
  }
});
```

---

## Real-World Benefits

### 1. Context-Aware Intelligence

**Without ACP Client:**
```
User asks: "What should I wear today?"
Twin Style: Shows random outfit suggestions
```

**With ACP Client:**
```
User asks: "What should I wear today?"

Twin Style:
1. Checks weather → 45°F, rainy
2. Checks calendar → Important client meeting at 2pm
3. Checks fashion AI → Business formal + weather protection
4. Generates outfit → Navy suit + raincoat + closed shoes

Result: Context-aware, intelligent suggestion
```

### 2. Automation

**Manual Process (15 minutes):**
1. Check weather app (2 min)
2. Check calendar (2 min)
3. Think about outfit (5 min)
4. Search wardrobe (3 min)
5. Make final decision (3 min)

**Automated with ACP Client (2 seconds):**
```typescript
const outfit = await generateSmartOutfit();
// Done! All context gathered and analyzed automatically
```

**Time saved: 60+ hours per year**

### 3. Integration

Connect Twin Style with your entire digital ecosystem:

```
Smart Home ←→ Twin Style ←→ Weather
    ↕            ↕            ↕
Calendar ←→ Twin Style ←→ Fashion AI
    ↕            ↕            ↕
Shopping ←→ Twin Style ←→ Social Media
```

### 4. Extensibility

Add new capabilities without modifying Twin Style:

- New weather service? Connect it.
- New AI stylist? Connect it.
- New smart mirror? Connect it.
- New shopping API? Connect it.

---

## 8 Practical Workflows

### 1. Morning Outfit Automation

**Scenario:** Automate your entire morning outfit decision

**Flow:**
```
7:00 AM Timer Trigger
    ↓
Twin Style (client) → Calendar Agent
    "What's my schedule today?"
    ← "Team presentation at 2pm, gym at 6pm"
    ↓
Twin Style (client) → Weather Agent
    "What's the forecast?"
    ← "65°F, sunny, no rain"
    ↓
Twin Style (server logic)
    Analyze requirements:
    - Professional attire for presentation
    - Athletic wear for gym
    - Comfortable for all-day wear
    - Weather-appropriate
    ↓
Twin Style → Wardrobe Database
    Search matching items
    ← Found: blazer, shirt, chinos, gym outfit
    ↓
Twin Style (client) → Fashion AI
    "Refine this outfit combination"
    ← Styling recommendations
    ↓
Twin Style → User
    Push notification with complete outfit plan
```

**Implementation:**
```typescript
async function morningOutfitAutomation() {
  // Get today's context
  const [schedule, weather] = await Promise.all([
    acpClient.executeToolOnServer('calendar-agent', 'get_today_events', {}),
    acpClient.executeToolOnServer('weather-agent', 'get_forecast', {
      location: 'SF',
      days: 1
    })
  ]);
  
  // Analyze requirements
  const requirements = {
    formality: schedule.events.some(e => e.type === 'meeting') ? 'high' : 'medium',
    activities: schedule.events.map(e => e.type),
    weather: weather.days[0].condition,
    temperature: weather.days[0].temp
  };
  
  // Generate outfits for each activity
  const outfits = await generateMultiActivityOutfits(requirements);
  
  // Get AI refinement
  const refinedOutfits = await acpClient.executeToolOnServer(
    'fashion-ai',
    'refine_outfits',
    { outfits, preferences: getUserPreferences() }
  );
  
  // Send notification
  await notifyUser({
    title: 'Your outfits for today',
    outfits: refinedOutfits,
    schedule: schedule.events
  });
  
  return refinedOutfits;
}

// Schedule to run every morning at 7 AM
scheduleDaily('07:00', morningOutfitAutomation);
```

**Benefits:**
- Saves 15 minutes every morning
- Never forget important events
- Always weather-appropriate
- Professionally curated outfits

---

### 2. Event-Based Wardrobe Planning

**Scenario:** Automatically plan outfits when calendar events are added

**Flow:**
```
Calendar Event Added
    ↓
Calendar Agent → Twin Style (notification)
    "New event: Wedding on Saturday at 4pm"
    ↓
Twin Style analyzes event
    Type: Wedding (formal)
    Time: 4pm (afternoon/evening)
    Date: Saturday (5 days away)
    ↓
Twin Style (client) → Weather Agent
    "Forecast for Saturday?"
    ← "72°F, clear skies"
    ↓
Twin Style → Wardrobe Search
    Filter: Formal, weather-appropriate
    ← Found: 2 suits, 3 dresses
    ↓
Twin Style (client) → Fashion AI
    "Best outfit for outdoor summer wedding?"
    ← Recommendations with styling tips
    ↓
Twin Style → User
    "Outfit ready for Saturday's wedding!"
```

**Implementation:**
```typescript
// Subscribe to calendar events
await acpClient.subscribeToServerEvents(
  'calendar-agent',
  ['calendar/event_created', 'calendar/event_updated']
);

// Handle event notifications
acpClient.on('notification', async (event) => {
  if (event.type === 'calendar/event_created') {
    const calendarEvent = event.data;
    
    // Get event details
    const eventType = classifyEventType(calendarEvent.title, calendarEvent.description);
    const formalityLevel = determineFormalityLevel(eventType);
    
    // Get weather for event date
    const weather = await acpClient.executeToolOnServer(
      'weather-agent',
      'get_forecast',
      {
        location: calendarEvent.location || 'SF',
        date: calendarEvent.date
      }
    );
    
    // Search wardrobe
    const items = await searchWardrobe({
      formality: formalityLevel,
      weatherTemp: weather.temperature,
      weatherCondition: weather.condition
    });
    
    // Get AI styling
    const outfitSuggestions = await acpClient.executeToolOnServer(
      'fashion-ai',
      'create_event_outfit',
      {
        eventType,
        weather,
        availableItems: items,
        preferences: getUserPreferences()
      }
    );
    
    // Save and notify
    await saveOutfitPlan(calendarEvent.id, outfitSuggestions);
    await notifyUser({
      title: `Outfit ready for ${calendarEvent.title}`,
      date: calendarEvent.date,
      outfits: outfitSuggestions
    });
  }
});
```

---

### 3. Weather-Responsive Wardrobe

**Scenario:** Adjust outfit recommendations in real-time based on weather changes

**Flow:**
```
Weather Changes
    ↓
Weather Agent → Twin Style (notification)
    "Weather alert: Temperature dropping 15°F"
    ↓
Twin Style checks current outfit plan
    Planned: Light shirt + shorts
    New condition: 55°F + windy
    ↓
Twin Style re-analyzes
    Need: Layers + wind protection
    ↓
Twin Style → Wardrobe Search
    Find: Jackets, long pants, closed shoes
    ↓
Twin Style → User
    "Weather changed! Updated outfit suggestion"
```

**Implementation:**
```typescript
// Subscribe to weather alerts
await acpClient.subscribeToServerEvents(
  'weather-agent',
  ['weather/alert', 'weather/forecast_change']
);

acpClient.on('notification', async (event) => {
  if (event.type === 'weather/forecast_change') {
    const oldWeather = event.data.previous;
    const newWeather = event.data.current;
    
    // Significant change?
    const tempDiff = Math.abs(newWeather.temp - oldWeather.temp);
    const conditionChange = newWeather.condition !== oldWeather.condition;
    
    if (tempDiff > 10 || conditionChange) {
      // Get current outfit plan
      const currentPlan = await getTodayOutfitPlan();
      
      // Check if still appropriate
      const isAppropriate = checkWeatherAppropriateness(
        currentPlan,
        newWeather
      );
      
      if (!isAppropriate) {
        // Generate new outfit
        const newOutfit = await generateOutfitSuggestions({
          weather: newWeather,
          occasion: currentPlan.occasion,
          preferences: getUserPreferences()
        });
        
        // Notify user
        await notifyUser({
          type: 'weather_change',
          title: 'Weather changed - outfit updated',
          oldWeather,
          newWeather,
          oldOutfit: currentPlan,
          newOutfit
        });
      }
    }
  }
});
```

---

### 4. Fashion AI Consultation

**Scenario:** Get expert styling advice from AI assistant

**Flow:**
```
User: "I need an outfit for a date night"
    ↓
Twin Style → Wardrobe Search
    Find: All appropriate items
    ↓
Twin Style (client) → Fashion AI Agent
    "Create date night outfits from these items"
    Context: User's style preferences, body type, colors
    Items: [shirt1, pants1, shoes1, ...]
    ↓
Fashion AI analyzes and returns
    ← 3 complete outfits with styling tips
    ↓
Twin Style (client) → Weather Agent
    "Verify weather appropriateness"
    ← Temperature and conditions check
    ↓
Twin Style → User
    Present 3 curated outfits with:
    - Styling tips
    - Weather considerations
    - Accessory suggestions
```

**Implementation:**
```typescript
async function getFashionConsultation(occasion: string) {
  // Search wardrobe for suitable items
  const wardrobeItems = await searchWardrobe({
    categories: ['tops', 'bottoms', 'shoes', 'accessories'],
    condition: 'good',
    clean: true
  });
  
  // Get user context
  const userContext = {
    stylePreferences: getUserStylePreferences(),
    bodyType: getUserBodyType(),
    colorPreferences: getUserColorPreferences(),
    occasion
  };
  
  // Request AI consultation
  const aiAdvice = await acpClient.executeToolOnServer(
    'fashion-ai',
    'create_styled_outfits',
    {
      availableItems: wardrobeItems,
      context: userContext,
      numOutfits: 3
    }
  );
  
  // Verify weather appropriateness
  const weather = await acpClient.executeToolOnServer(
    'weather-agent',
    'get_current_weather',
    {}
  );
  
  // Filter outfits by weather
  const weatherAppropriate = aiAdvice.outfits.map(outfit => ({
    ...outfit,
    weatherRating: rateWeatherAppropriateness(outfit, weather),
    modifications: suggestWeatherModifications(outfit, weather)
  }));
  
  return {
    outfits: weatherAppropriate,
    stylingTips: aiAdvice.tips,
    weather: weather
  };
}
```

---

### 5. Smart Closet Lighting

**Scenario:** Automatically adjust closet lighting based on outfit being worn

**Flow:**
```
User selects outfit in Twin Style
    ↓
Twin Style identifies colors
    Primary: Navy blue
    Secondary: White
    Accent: Brown
    ↓
Twin Style (client) → Smart Home Agent
    "Set closet lighting for color accuracy"
    Colors: [navy, white, brown]
    ↓
Smart Home Agent
    Adjusts color temperature: 5000K (daylight)
    Adjusts brightness: 80%
    Turns on closet lights
    ← Lights configured
    ↓
User sees clothes in true colors
```

**Implementation:**
```typescript
async function setOptimalClosetLighting(outfit: Outfit) {
  // Analyze outfit colors
  const colors = extractOutfitColors(outfit);
  const colorTemp = determineOptimalColorTemp(colors);
  const brightness = determineOptimalBrightness(colors);
  
  // Control smart home
  const result = await acpClient.executeToolOnServer(
    'smart-home-agent',
    'set_lighting',
    {
      room: 'closet',
      colorTemperature: colorTemp,
      brightness: brightness,
      transitionTime: 2 // seconds
    }
  );
  
  return result;
}

// Auto-trigger when user selects outfit
onOutfitSelected(async (outfit) => {
  await setOptimalClosetLighting(outfit);
});
```

---

### 6. Travel Wardrobe Planning

**Scenario:** Plan complete wardrobe for a trip

**Flow:**
```
User: "Plan wardrobe for NYC trip, Nov 15-20"
    ↓
Twin Style (client) → Calendar Agent
    "Get events for Nov 15-20 in NYC"
    ← Business meetings, dinner, museum visit
    ↓
Twin Style (client) → Weather Agent
    "NYC forecast for Nov 15-20"
    ← 45-55°F, mix of sun and rain
    ↓
Twin Style analyzes requirements
    - 5 business outfits (meetings)
    - 2 smart-casual (dinners)
    - 1 comfortable (museum)
    - Weather: Layers + rain gear
    ↓
Twin Style → Wardrobe Search
    Build capsule wardrobe that mixes/matches
    ← 8 items that create 15 outfits
    ↓
Twin Style (client) → Fashion AI
    "Optimize packing list"
    ← Refined list with mix-and-match guide
    ↓
Twin Style → User
    Complete packing list with daily outfits
```

**Implementation:**
```typescript
async function planTravelWardrobe(
  destination: string,
  startDate: string,
  endDate: string
) {
  // Get trip context
  const [events, weather] = await Promise.all([
    acpClient.executeToolOnServer('calendar-agent', 'get_events_range', {
      location: destination,
      startDate,
      endDate
    }),
    acpClient.executeToolOnServer('weather-agent', 'get_extended_forecast', {
      location: destination,
      startDate,
      endDate
    })
  ]);
  
  // Analyze requirements
  const requirements = analyzeTrip Requirements({
    events: events.items,
    weather: weather.days,
    tripLength: calculateDays(startDate, endDate)
  });
  
  // Build capsule wardrobe
  const capsule = await buildCapsuleWardrobe(requirements);
  
  // Optimize with AI
  const optimized = await acpClient.executeToolOnServer(
    'fashion-ai',
    'optimize_travel_wardrobe',
    {
      items: capsule,
      tripContext: requirements,
      maxItems: requirements.tripLength * 1.5 // Pack light
    }
  );
  
  // Create daily outfit plan
  const dailyOutfits = createDailyOutfitPlan({
    items: optimized.items,
    events: events.items,
    weather: weather.days
  });
  
  return {
    packingList: optimized.items,
    dailyOutfits,
    mixAndMatchGuide: optimized.combinations,
    weatherTips: weather.tips
  };
}
```

---

### 7. Shopping Assistant Integration

**Scenario:** Find items that match your wardrobe

**Flow:**
```
User: "I need a blazer that matches my wardrobe"
    ↓
Twin Style analyzes wardrobe
    Most common colors: Navy, white, gray
    Most common style: Business casual
    Gaps: Need versatile blazer
    ↓
Twin Style (client) → Fashion AI
    "What blazer would complete this wardrobe?"
    ← Recommendations: Navy or charcoal, slim fit
    ↓
Twin Style (client) → Shopping Agent
    "Find blazers matching these criteria"
    ← 15 options from various retailers
    ↓
Twin Style (client) → Fashion AI
    "Rank these options by fit to wardrobe"
    ← Ranked list with compatibility scores
    ↓
Twin Style → User
    Top 5 blazer options with:
    - Compatibility score
    - Outfit combinations
    - Price comparison
```

**Implementation:**
```typescript
async function findMatchingItems(itemType: string) {
  // Analyze current wardrobe
  const analysis = await analyzeWardrobeGaps();
  
  // Get AI recommendations
  const criteria = await acpClient.executeToolOnServer(
    'fashion-ai',
    'recommend_purchase',
    {
      wardrobeAnalysis: analysis,
      itemType,
      userPreferences: getUserPreferences()
    }
  );
  
  // Search shopping platforms
  const options = await acpClient.executeToolOnServer(
    'shopping-agent',
    'search_items',
    {
      type: itemType,
      criteria: criteria.specifications,
      maxResults: 20
    }
  );
  
  // Rank by wardrobe compatibility
  const ranked = await acpClient.executeToolOnServer(
    'fashion-ai',
    'rank_purchase_options',
    {
      options: options.items,
      wardrobe: analysis.currentItems,
      preferences: getUserPreferences()
    }
  );
  
  // Generate outfit previews
  const withOutfits = await Promise.all(
    ranked.topOptions.map(async (option) => {
      const outfits = await generateOutfitsWith(option);
      return {
        ...option,
        compatibilityScore: option.score,
        possibleOutfits: outfits
      };
    })
  );
  
  return withOutfits;
}
```

---

### 8. Social Media Integration

**Scenario:** Automatically share outfits on social media

**Flow:**
```
User wears outfit and marks as "favorite"
    ↓
Twin Style captures outfit photo
    ↓
Twin Style (client) → Fashion AI
    "Generate caption for this outfit"
    ← "Casual Friday vibes with navy blazer and chinos"
    ↓
Twin Style (client) → Weather Agent
    "Get current weather for context"
    ← "Perfect 70°F sunny day"
    ↓
Twin Style adds context to caption
    Final: "Casual Friday vibes... Perfect for this 70° sunny day!"
    ↓
Twin Style (client) → Social Media Agent
    "Post to Instagram"
    Image: outfit photo
    Caption: generated caption
    Tags: #ootd #casualfriday #wardroberorganizer
    ↓
Posted successfully!
```

**Implementation:**
```typescript
async function shareOutfitOnSocial(outfit: Outfit, photo: string) {
  // Generate AI caption
  const caption = await acpClient.executeToolOnServer(
    'fashion-ai',
    'generate_outfit_caption',
    {
      outfit: outfit.items,
      style: outfit.style,
      occasion: outfit.occasion
    }
  );
  
  // Add weather context
  const weather = await acpClient.executeToolOnServer(
    'weather-agent',
    'get_current_weather',
    {}
  );
  
  const fullCaption = `${caption.text} Perfect for this ${weather.temp}° ${weather.condition} day! ${caption.hashtags}`;
  
  // Post to social media
  const result = await acpClient.executeToolOnServer(
    'social-media-agent',
    'create_post',
    {
      platform: 'instagram',
      type: 'photo',
      image: photo,
      caption: fullCaption,
      tags: caption.hashtags.split(' ')
    }
  );
  
  return result;
}

// Auto-post when user marks outfit as favorite
onOutfitFavorited(async (outfit) => {
  const photo = await captureOutfitPhoto(outfit);
  const consent = await askUserConsent('Share this outfit on social media?');
  
  if (consent) {
    await shareOutfitOnSocial(outfit, photo);
  }
});
```

---

## Implementation Guide

### Setting Up Twin Style as ACP Client

#### 1. Install Dependencies

Already included in Twin Style! No additional installation needed.

#### 2. Import the Client

```typescript
import { acpClient } from './lib/acp/client';
```

#### 3. Register External Agents

```typescript
// Register weather agent
await acpClient.registerServer({
  id: 'weather-agent',
  name: 'Weather Service',
  url: 'http://localhost:3002/api/acp',
  eventsUrl: 'http://localhost:3002/api/acp/events',
  description: 'Provides weather forecasts and alerts',
  enabled: true
});

// Register calendar agent
await acpClient.registerServer({
  id: 'calendar-agent',
  name: 'Calendar Service',
  url: 'http://localhost:3003/api/acp',
  eventsUrl: 'http://localhost:3003/api/acp/events',
  description: 'Manages calendar events and schedules',
  enabled: true
});
```

#### 4. Use Predefined Templates

```typescript
// Quick setup with templates
await connectPredefinedAgent({
  template: 'weather',
  url: 'http://weather-service.local/api/acp'
});

await connectPredefinedAgent({
  template: 'calendar',
  url: 'http://calendar-service.local/api/acp'
});
```

#### 5. Discover Capabilities

```typescript
// See what an agent can do
const capabilities = await acpClient.fetchCapabilities('weather-agent');
console.log('Available tools:', capabilities.tools);
```

#### 6. Execute Tools

```typescript
// Call external agent tools
const weather = await acpClient.executeToolOnServer(
  'weather-agent',
  'get_forecast',
  { location: 'SF', days: 7 }
);

const events = await acpClient.executeToolOnServer(
  'calendar-agent',
  'get_today_events',
  {}
);
```

#### 7. Subscribe to Events

```typescript
// Listen to external agent notifications
await acpClient.subscribeToServerEvents(
  'weather-agent',
  ['weather/alert', 'weather/forecast_change']
);

acpClient.on('notification', (event) => {
  console.log('Received:', event.type, event.data);
});
```

---

## Multi-Agent Orchestration

### Orchestration Patterns

#### Pattern 1: Sequential Chain

**One agent's output feeds into the next:**

```typescript
async function sequentialChain() {
  // Step 1: Get calendar
  const events = await acpClient.executeToolOnServer(
    'calendar-agent',
    'get_today_events',
    {}
  );
  
  // Step 2: Get weather (uses event location)
  const weather = await acpClient.executeToolOnServer(
    'weather-agent',
    'get_forecast',
    { location: events[0]?.location || 'SF' }
  );
  
  // Step 3: Generate outfit (uses both)
  const outfit = await generateOutfitSuggestions({
    occasion: events[0]?.type,
    weather: weather.condition
  });
  
  return outfit;
}
```

#### Pattern 2: Parallel Aggregation

**Multiple agents execute simultaneously:**

```typescript
async function parallelAggregation() {
  // Execute all at once
  const [weather, events, fashionTrends] = await Promise.all([
    acpClient.executeToolOnServer('weather-agent', 'get_forecast', {...}),
    acpClient.executeToolOnServer('calendar-agent', 'get_today_events', {}),
    acpClient.executeToolOnServer('fashion-ai', 'get_current_trends', {})
  ]);
  
  // Combine results
  return analyzeAll(weather, events, fashionTrends);
}
```

#### Pattern 3: Event-Driven Reaction

**Agents notify Twin Style of changes:**

```typescript
// Setup: Subscribe to multiple agents
await Promise.all([
  acpClient.subscribeToServerEvents('weather-agent', ['weather/alert']),
  acpClient.subscribeToServerEvents('calendar-agent', ['calendar/event_soon']),
]);

// React to events
acpClient.on('notification', async (event) => {
  switch (event.type) {
    case 'weather/alert':
      await handleWeatherChange(event.data);
      break;
    case 'calendar/event_soon':
      await prepareOutfit(event.data);
      break;
  }
});
```

#### Pattern 4: Feedback Loop

**Iterative refinement across agents:**

```typescript
async function feedbackLoop() {
  let outfit = await generateInitialOutfit();
  
  // Iterate until satisfied
  for (let i = 0; i < 3; i++) {
    // Get AI feedback
    const feedback = await acpClient.executeToolOnServer(
      'fashion-ai',
      'critique_outfit',
      { outfit }
    );
    
    if (feedback.score > 0.9) break;
    
    // Refine based on feedback
    outfit = await refineOutfit(outfit, feedback.suggestions);
  }
  
  return outfit;
}
```

---

## Summary

### Key Takeaways

1. **Dual Role**: Twin Style is both an ACP server (controlled by editors) and client (controls other agents)

2. **Control = Orchestration**: Not authoritative command, but intelligent coordination

3. **Real Benefits**:
   - Context-aware decisions
   - Automation of complex workflows
   - Integration with digital ecosystem
   - Time savings (60+ hours/year)

4. **Practical Value**:
   - Morning outfit automation
   - Event-based planning
   - Weather responsiveness
   - AI-powered styling
   - Smart home integration
   - Travel planning
   - Shopping assistance
   - Social media sharing

5. **Network Effect**: Each new agent connection multiplies the value

### The Big Picture

Twin Style as an ACP client transforms it from a **simple wardrobe database** into a **fashion intelligence platform** that:

- Makes context-aware decisions
- Automates tedious tasks
- Integrates with your life
- Learns and improves
- Saves you time
- Reduces decision fatigue

**It's not about controlling agents - it's about orchestrating intelligence.**

---

## Next Steps

1. **Try the Examples**: Run the provided workflow examples
2. **Connect an Agent**: Start with a weather or calendar agent
3. **Build a Workflow**: Create your own automation
4. **Expand the Network**: Add more agents over time
5. **Share Your Patterns**: Contribute workflow templates

---

*For technical implementation details, see the [ACP Integration Guide](./ACP_INTEGRATION.md).*
