# Twin Style Data Model Visualization

**Purpose**: Visual reference showing available data points for analytics

---

## Data Collection Layers

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER WARDROBE DATA                            │
│                     (Single User, Self-Hosted)                       │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
         ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
         │    ITEMS     │  │   OUTFITS    │  │  BEHAVIOR    │
         │     (157)    │  │     (23)     │  │   (Events)   │
         └──────────────┘  └──────────────┘  └──────────────┘
                 │                 │                 │
                 ▼                 ▼                 ▼
```

---

## Item Data Structure (Per Clothing Item)

```
┌─────────────────────────────────────────────────────────────────┐
│ ITEM #1: "Black Band Tee"                                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ BASIC INFO                     VISUAL ATTRIBUTES                │
│ ├─ Category: tops              ├─ Colors: [#000000, #FF0000]   │
│ ├─ Brand: Hot Topic            ├─ Pattern: graphic              │
│ ├─ Size: M                     ├─ Neckline: crew                │
│ └─ Materials: 100% cotton      └─ Fit: regular                  │
│                                                                  │
│ FRANCHISE TRACKING             USAGE PATTERNS                   │
│ ├─ Licensed: Yes               ├─ Last Worn: 2026-01-28         │
│ ├─ Franchise: Taylor Swift     ├─ Wears: 3/5 (before wash)     │
│ └─ Type: band                  ├─ Last Washed: 2026-01-15       │
│                                └─ State: available              │
│                                                                  │
│ STORAGE                        AI DATA                          │
│ ├─ Type: folded                ├─ Catalog Image: ✓              │
│ ├─ Location: "Top drawer"      ├─ Confidence: 92%               │
│ └─ Sort Order: 12              └─ AI Jobs: 2 (success)          │
│                                                                  │
│ IMAGES (4)                     TAGS (3)                          │
│ ├─ Original (main)             ├─ concert                        │
│ ├─ Original (back)             ├─ comfy                          │
│ ├─ AI Catalog                  └─ favorite                       │
│ └─ Thumbnail                                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Outfit Data Structure

```
┌─────────────────────────────────────────────────────────────────┐
│ OUTFIT #1: "Casual Saturday"                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ COMPOSITION                    CONTEXT                          │
│ ├─ Top: Black Band Tee        ├─ Weather: warm                 │
│ ├─ Bottom: Blue Jeans          ├─ Vibe: dopamine                │
│ ├─ Shoes: White Sneakers       ├─ Occasion: errands             │
│ └─ Accessory: Crossbody Bag    └─ Time: quick                   │
│                                                                  │
│ USER FEEDBACK                  AI EXPLANATION                   │
│ ├─ Rating: up (👍)            "Casual and comfortable outfit    │
│ └─ Notes: "Loved this!"         with balanced proportions..."   │
│                                                                  │
│ SWAP SUGGESTIONS               METADATA                         │
│ "Try with gray jeans for       ├─ Created: 2026-01-27           │
│  a softer look"                ├─ AI Job: succeeded              │
│                                └─ Images: 1 (outfit board)       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Behavioral Event Stream

```
Timeline of User Actions (Last 7 Days)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

2026-01-28 09:15  📸  Added new item (Red Sweater)
                       → AI catalog generation: queued

2026-01-28 09:17  🤖  AI job completed: catalog generated
                       Confidence: 94%

2026-01-28 09:20  ✏️   Edited item: changed category tops→outerwear

2026-01-28 14:30  🎲  Panic Pick used
                       Context: weather=cold, vibe=confidence_boost
                       Result: Outfit #23 (rated: up)

2026-01-27 08:45  👔  Generated outfit
                       Time to decide: 47 seconds
                       AI suggestions: 5, User picked: #2

2026-01-26 19:30  🏷️   Added tags to 3 items (winter, office, formal)

2026-01-26 12:00  🔍  Searched for "blue"
                       Results: 12 items

2026-01-25 16:20  📲  NFC scan: Item removed (Black Blazer)

2026-01-25 21:45  📲  NFC scan: Item returned (Black Blazer)
```

---

## Analytics Aggregation Levels

```
                    INDIVIDUAL LEVEL
                    (User's Device Only)
                           │
                           │ IF opt-in enabled
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                    ANONYMIZED AGGREGATION                         │
│                   (Hypothetical Multi-User)                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  USER COHORTS                    TREND AGGREGATES                │
│  ├─ Wardrobe Size: small         ├─ Top Colors: #000, #FFF      │
│  ├─ Style: minimalist            ├─ Popular Categories: tops     │
│  ├─ Wash Frequency: moderate     ├─ Brand Loyalty: high          │
│  └─ Panic Pick Usage: high       └─ Outfit Complexity: simple    │
│                                                                   │
│  STATISTICAL AGGREGATES          PRIVACY PROTECTIONS             │
│  ├─ Avg Items: 142 ± 67         ├─ K-Anonymity: k=5             │
│  ├─ Avg Wears/Item: 2.3         ├─ Differential Privacy: ε=1.0  │
│  ├─ Avg Item Lifespan: 2.1yr    ├─ No Individual Data           │
│  └─ Donation Rate: 18%           └─ No PII                       │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: From Photo to Insights

```
Step 1: USER CAPTURES ITEM
        📸 Takes photo of clothing item
        │
        ▼
Step 2: AI PROCESSING
        🤖 Gemini 3 Vision analyzes image
        ├─ Generates catalog image
        ├─ Extracts colors: [#000000, #FFFFFF]
        ├─ Detects attributes: {"neckline": "crew", ...}
        └─ Suggests category: "tops"
        │
        ▼
Step 3: LOCAL STORAGE
        💾 Stores in PostgreSQL (user's device)
        ├─ Item record created
        ├─ Images saved locally
        ├─ AI job logged
        └─ Metadata indexed
        │
        ▼
Step 4: USAGE TRACKING
        👤 User interacts with item
        ├─ Worn 3 times
        ├─ Washed once
        ├─ Tagged "favorite"
        ├─ Used in 5 outfits
        └─ Rated outfits: 4 up, 1 neutral
        │
        ▼
Step 5: INSIGHTS (Personal)
        📊 User sees their own analytics
        ├─ "You wear black 45% of the time"
        ├─ "This item worn 2x more than average"
        ├─ "Sustainability score: 8.2/10"
        └─ "12 items unworn in 90+ days"
        │
        ▼
Step 6: AGGREGATION (Hypothetical)
        🌐 IF multi-user + opt-in
        ├─ Anonymize data locally
        ├─ Add differential privacy noise
        ├─ Send aggregated metrics only
        └─ Never share individual data
        │
        ▼
Step 7: TREND INSIGHTS (B2B)
        📈 Fashion brands see aggregates
        ├─ "Earth tones trending +47%"
        ├─ "Oversized fit worn 3x more"
        └─ "Avg item lifespan: 2.3 years"
```

---

## Privacy Zones

```
┌────────────────────────────────────────────────────────────────┐
│                        🟢 ALWAYS SAFE                           │
│                     (User's Device Only)                        │
│  • Full wardrobe data                                          │
│  • Photos (including faces, backgrounds)                       │
│  • Personal notes                                              │
│  • Exact usage patterns                                        │
│  • AI interaction history                                      │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                    🟡 REQUIRES OPT-IN + ANONYMIZATION           │
│                    (Hypothetical Multi-User)                    │
│  • Aggregated wardrobe statistics                              │
│  • Color/category trends (no images)                           │
│  • Brand popularity (hashed)                                   │
│  • Usage patterns (anonymized)                                 │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                        🔴 NEVER SHARED                          │
│                      (Ethical Red Lines)                        │
│  • Individual user data                                        │
│  • Photos with faces                                           │
│  • Dysphoria/body image preferences                            │
│  • Mental health indicators                                    │
│  • Location data                                               │
│  • Financial information                                       │
└────────────────────────────────────────────────────────────────┘
```

---

## Sample Insight: Color Trend Over Time

```
Color Popularity (2025-2026)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Black   ████████████████████████████ 45% (stable)
White   ███████████████░░░░░░░░░░░░░ 22% (↑ 3%)
Gray    ████████████░░░░░░░░░░░░░░░░ 18% (↓ 2%)
Brown   ████████░░░░░░░░░░░░░░░░░░░░ 12% (↑ 7%)  🔥 Trending!
Red     ████░░░░░░░░░░░░░░░░░░░░░░░░  6% (↓ 1%)

Insight: Earth tones (brown, tan, beige) increased 47% 
         in Fall/Winter 2025
```

---

## Sample Insight: Outfit Success by Context

```
Outfit Rating by Weather & Vibe
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

               Hot    Warm   Cool   Cold
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Dopamine       87%    92%    89%    84%   ← Best vibe
Confidence     76%    84%    88%    91%
Neutral        71%    73%    75%    72%
Dysphoria-Safe 81%    85%    87%    83%

Insight: "Confidence boost" outfits work best in cold weather
         "Dopamine" outfits successful across all temperatures
```

---

## Data Richness Comparison

```
E-Commerce Site       Twin Style         Twin Style + Multi-User
(Stitch Fix)          (Current)          (Hypothetical)
─────────────────     ───────────────    ──────────────────────
• Purchase data       • Full wardrobe    • Aggregated trends
• Returns             • Wear frequency   • Pattern insights
• Ratings             • Wash cycles      • Brand benchmarks
• Style quiz          • Outfit combos    • Sustainability data
                      • AI interactions  • UX effectiveness
                      • Context data     • Fashion forecasting
                      • Photos           
                      • Usage timeline   
                      
Limited lifecycle     Complete lifecycle  Industry intelligence
Individual only       Individual focus   Benefits everyone
```

---

**Key Takeaway**: Twin Style's data model is extraordinarily rich because it tracks the complete lifecycle of clothing items, from acquisition through daily use to eventual donation. This makes it uniquely valuable for sustainability insights, personalized recommendations, and fashion trend forecasting—IF data collection is done ethically and with explicit user consent.

**Current Reality**: All data stays on user's device. No sharing, no analytics collection, no multi-user features.

**Future Possibility**: IF multi-user, privacy-first approach with anonymization, opt-in, and user benefit as the guiding principle.

---

**See Also**:
- [MULTI_USER_ANALYTICS.md](MULTI_USER_ANALYTICS.md) - Full strategy
- [ANALYTICS_EXAMPLES.md](ANALYTICS_EXAMPLES.md) - Detailed examples
- [ANALYTICS_SUMMARY.md](ANALYTICS_SUMMARY.md) - Executive overview
