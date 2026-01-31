# Clothing Item Attributes Reference

Complete guide to all attributes tracked for clothing items in the ADHD-Closet application.

## Overview

The ADHD-Closet tracks rich metadata about each clothing item to enable:
- 🤖 **Smart AI recommendations** - Better outfit matching
- 🎯 **Precise filtering** - Find exactly what you need
- 📊 **Visual balance** - Create harmonious outfits
- 🧠 **ADHD-friendly organization** - Less decision paralysis

---

## Core Attributes (All Items)

These fields apply to every item in your wardrobe:

### Basic Information

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| **title** | String | Optional name/description | "Black band t-shirt" |
| **category** | Enum | Main category | `tops`, `bottoms`, `dresses`, etc. |
| **brand** | String | Brand/manufacturer | "H&M", "Target", "Handmade" |
| **sizeText** | String | Size information | "M", "32x30", "One Size" |
| **materials** | String | Fabric composition | "100% cotton", "Polyester blend" |

### Licensed Merchandise & Band Merch 🎸🎬🎮

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| **isLicensedMerch** | Boolean | Is this official licensed merchandise? | `true`, `false`, `null` |
| **franchise** | String | Band name, movie, game, show, etc. | "My Chemical Romance", "Star Wars", "The Legend of Zelda" |
| **franchiseType** | Enum | Type of franchise | `band`, `movie`, `tv_show`, `game`, `anime`, `comic`, `sports`, `brand`, `other` |

**Franchise Types:**
- **band** - Music groups/artists (My Chemical Romance, Metallica, BTS)
- **movie** - Films (Star Wars, Marvel, Harry Potter)
- **tv_show** - TV series (Stranger Things, The Mandalorian, Friends)
- **game** - Video games (The Legend of Zelda, Minecraft, Pokemon)
- **anime** - Anime series (Naruto, Attack on Titan, Sailor Moon)
- **comic** - Comic books/graphic novels (Marvel, DC, manga)
- **sports** - Sports teams (Manchester United, Lakers, Yankees)
- **brand** - Fashion/lifestyle brands with prominent branding (Supreme, Nike, Adidas)
- **other** - Other licensed content

**Examples:**
- Band t-shirt with Slipknot logo: `isLicensedMerch: true, franchise: "Slipknot", franchiseType: "band"`
- Hoodie with Baby Yoda: `isLicensedMerch: true, franchise: "The Mandalorian", franchiseType: "tv_show"`
- Shirt with Mario graphics: `isLicensedMerch: true, franchise: "Super Mario Bros", franchiseType: "game"`
- Plain black t-shirt: `isLicensedMerch: false, franchise: null, franchiseType: null`

### Visual Characteristics

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| **colors** | Array | Named colors | `["black", "dark purple"]` |
| **colorPalette** | Array | Hex color codes | `["#000000", "#4B0082"]` |
| **pattern** | String | Pattern description | "solid", "striped", "floral", "graphic print" |
| **tags** | Array | Style tags | `["emo", "goth", "casual", "edgy"]` |

### Metadata

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| **fitNotes** | String | How item fits | "Oversized fit creates volume contrast" |
| **pairingTips** | Array | Styling suggestions | `["Pairs well with high-waisted bottoms"]` |
| **confidence** | Object | AI confidence scores | `{ "category": 0.95, "colors": 0.88 }` |

### Wear & Care Tracking

| Field | Type | Description |
|-------|------|-------------|
| **state** | Enum | `available`, `laundry`, `unavailable`, `donate` |
| **cleanStatus** | Enum | `clean`, `dirty`, `needs_wash` |
| **wearsBeforeWash** | Int | Wears before washing needed |
| **currentWears** | Int | Current wear count since last wash |
| **lastWornDate** | DateTime | When item was last worn |
| **lastWashedDate** | DateTime | When item was last washed |

### Physical Storage

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| **storageType** | Enum | Storage method | `hanging`, `folded`, `drawer`, `shelf` |
| **locationInCloset** | String | Where stored | "Left side", "Top drawer" |
| **sortOrder** | Int | Custom ordering | For organizing display |

---

## Category-Specific Attributes

These attributes are stored in the `attributes` JSON field and vary by category.

### 👕 Tops

| Attribute | Values | Description |
|-----------|--------|-------------|
| **neckline** | crew, v-neck, scoop, boat, square, halter, off-shoulder, turtleneck | Neckline style |
| **sleeveLength** | sleeveless, short, 3/4, long | Length of sleeves |
| **sleeveFit** | fitted, loose, puff, bell | How sleeves fit |
| **visualWeight** | minimal, moderate, heavy, complex | Visual heaviness |
| **silhouette** | fitted, loose, oversized, boxy | Overall shape |

**Example:**
```json
{
  "neckline": "v-neck",
  "sleeveLength": "short",
  "sleeveFit": "fitted",
  "visualWeight": "minimal",
  "silhouette": "fitted"
}
```

---

### 👖 Bottoms

| Attribute | Values | Description |
|-----------|--------|-------------|
| **bottomsType** | jeans, dress_pants, casual_pants, cargo_pants, shorts, skirt, leggings, joggers | Type of bottom (stored separately) |
| **rise** | low, mid, high | Waist height |
| **inseam** | Number | Length in inches |
| **fit** | skinny, slim, straight, wide, bootcut, flare | How bottom fits legs |
| **hemline** | raw, cuffed, distressed | Bottom edge style |
| **visualWeight** | minimal, moderate, heavy | Visual heaviness |
| **pocketStyle** | String | Description of pockets |

**Example:**
```json
{
  "rise": "high",
  "inseam": 30,
  "fit": "skinny",
  "hemline": "raw",
  "visualWeight": "moderate",
  "pocketStyle": "5-pocket jean style"
}
```

**Note:** High rise skinny jeans = `bottomsType: "jeans"` + `rise: "high"` + `fit: "skinny"`

---

### 👗 Dresses

| Attribute | Values | Description |
|-----------|--------|-------------|
| **neckline** | crew, v-neck, scoop, boat, square, halter, off-shoulder, turtleneck | Neckline style |
| **sleeveLength** | sleeveless, short, 3/4, long | Length of sleeves |
| **waistline** | natural, empire, dropped, none | Where waist sits |
| **hemline** | mini, knee, midi, maxi, asymmetric | Dress length |
| **silhouette** | fitted, A-line, shift, bodycon, flowy | Overall shape |

**Example:**
```json
{
  "neckline": "scoop",
  "sleeveLength": "sleeveless",
  "waistline": "empire",
  "hemline": "midi",
  "silhouette": "A-line"
}
```

---

### 🧥 Outerwear

| Attribute | Values | Description |
|-----------|--------|-------------|
| **silhouette** | fitted, loose, oversized, boxy | Overall shape |
| **length** | cropped, hip, mid-thigh, knee, long | How long jacket is |
| **visualWeight** | minimal, moderate, heavy, complex | Visual heaviness |

**Example:**
```json
{
  "silhouette": "oversized",
  "length": "hip",
  "visualWeight": "heavy"
}
```

---

### 👟 Shoes

| Attribute | Values | Description |
|-----------|--------|-------------|
| **shoeType** | sneakers, boots, sandals, heels, flats, loafers, oxfords, platforms | Type of shoe (stored separately) |
| **heelHeight** | Number | Height in inches |
| **heelThickness** | none, slim, chunky, wedge | Heel style |
| **toeboxShape** | rounded, almond, pointed, square | Toe shape |
| **visualWeight** | minimal, moderate, heavy | Visual heaviness |

**Example:**
```json
{
  "heelHeight": 3,
  "heelThickness": "chunky",
  "toeboxShape": "rounded",
  "visualWeight": "heavy"
}
```

---

### 🎒 Accessories

| Attribute | Values | Description |
|-----------|--------|-------------|
| **accessoryType** | purse, bag, backpack, belt, hat, scarf, gloves, sunglasses, watch | Type (stored separately) |
| **size** | small, medium, large | Overall size |
| **material** | String | What it's made of |
| **structure** | structured, unstructured, semi-structured | How stiff/floppy |
| **visualWeight** | minimal, moderate, heavy | Visual heaviness |
| **occasion** | casual, formal, both | When to wear |

**Example:**
```json
{
  "size": "medium",
  "material": "leather",
  "structure": "structured",
  "visualWeight": "moderate",
  "occasion": "both"
}
```

---

### 💍 Jewelry

| Attribute | Values | Description |
|-----------|--------|-------------|
| **jewelryType** | necklace, earrings, bracelet, ring, anklet, brooch | Type (stored separately) |
| **metal** | gold, silver, rose gold, bronze, mixed, none | Metal type |
| **gemstones** | yes, no | Has gemstones? |
| **style** | delicate, statement, chunky, minimalist | Overall style |
| **occasion** | everyday, formal, special | When to wear |

**Example:**
```json
{
  "metal": "silver",
  "gemstones": "no",
  "style": "statement",
  "occasion": "everyday"
}
```

---

### 🩱 Swimwear

| Attribute | Values | Description |
|-----------|--------|-------------|
| **style** | one-piece, two-piece, bikini, tankini, boardshorts, rash-guard | Swimwear style |
| **coverage** | minimal, moderate, full | How much covered |
| **activity** | swimming, surfing, beach, pool | Intended activity |

**Example:**
```json
{
  "style": "two-piece",
  "coverage": "moderate",
  "activity": "beach"
}
```

---

### 🏃 Activewear

| Attribute | Values | Description |
|-----------|--------|-------------|
| **activityType** | gym, running, yoga, cycling, sports | Intended activity |
| **fit** | compression, fitted, loose | How tight |
| **moisture-wicking** | yes, no | Wicks sweat? |
| **visualWeight** | minimal, moderate | Visual heaviness |

**Example:**
```json
{
  "activityType": "yoga",
  "fit": "fitted",
  "moisture-wicking": "yes",
  "visualWeight": "minimal"
}
```

---

### 😴 Sleepwear

| Attribute | Values | Description |
|-----------|--------|-------------|
| **style** | pajamas, nightgown, robe, sleep-shirt, shorts-set | Sleepwear style |
| **warmth** | light, medium, heavy | How warm |
| **season** | summer, winter, all-season | Best season |

**Example:**
```json
{
  "style": "pajamas",
  "warmth": "medium",
  "season": "all-season"
}
```

---

### 🛋️ Loungewear

| Attribute | Values | Description |
|-----------|--------|-------------|
| **comfort-level** | ultra-comfy, relaxed, presentable | Comfort rating |
| **style** | sweats, joggers, lounge-set, casual | Style type |
| **occasion** | home-only, casual-outing | Where to wear |

**Example:**
```json
{
  "comfort-level": "ultra-comfy",
  "style": "sweats",
  "occasion": "home-only"
}
```

---

### 👔 Suits & Sets

| Attribute | Values | Description |
|-----------|--------|-------------|
| **type** | two-piece, three-piece, co-ord, matching-set | Set type |
| **formality** | casual, business-casual, formal | Formality level |
| **completeness** | complete-set, mix-and-match | Can pieces separate? |

**Example:**
```json
{
  "type": "two-piece",
  "formality": "business-casual",
  "completeness": "mix-and-match"
}
```

---

## Visual Weight Explained

**Visual weight** describes how much visual "presence" an item has in an outfit.

| Level | Description | Examples |
|-------|-------------|----------|
| **Minimal** | Light, airy, barely there | Simple tank top, thin jewelry, minimalist shoes |
| **Moderate** | Balanced presence | Basic t-shirt, regular jeans, simple accessories |
| **Heavy** | Strong visual impact | Chunky sweater, platform boots, large bag |
| **Complex** | Very busy/detailed | Heavily patterned top, intricate jewelry |

**Why it matters:**
- Balance heavy pieces with minimal pieces
- Avoid all-heavy or all-minimal outfits
- Create intentional focus points

---

## Common Attribute Combinations

### High-Waisted Skinny Jeans
```json
{
  "category": "bottoms",
  "bottomsType": "jeans",
  "attributes": {
    "rise": "high",
    "fit": "skinny",
    "visualWeight": "moderate"
  }
}
```

### Oversized Band T-Shirt
```json
{
  "category": "tops",
  "attributes": {
    "neckline": "crew",
    "sleeveLength": "short",
    "sleeveFit": "loose",
    "silhouette": "oversized",
    "visualWeight": "moderate"
  }
}
```

### Statement Chunky Platform Boots
```json
{
  "category": "shoes",
  "shoeType": "platforms",
  "attributes": {
    "heelHeight": 3,
    "heelThickness": "chunky",
    "toeboxShape": "rounded",
    "visualWeight": "heavy"
  }
}
```

---

## How Attributes Are Used

### 🤖 AI Outfit Generation
The AI uses attributes to create balanced, cohesive outfits:

```
User: "Generate an outfit"

AI analyzes:
- Visual weight balance (heavy + minimal = good)
- Color harmony (complementary colors)
- Formality matching (casual with casual)
- Season appropriateness (heavy coat in winter)
- Style consistency (tags overlap)

Result: Balanced, wearable outfit
```

### 🎯 Smart Filtering
Filter by specific attributes:

```typescript
// Find all high-rise skinny jeans
items.filter(item => 
  item.category === 'bottoms' &&
  item.bottomsType === 'jeans' &&
  item.attributes.rise === 'high' &&
  item.attributes.fit === 'skinny'
)

// Find statement jewelry
items.filter(item =>
  item.category === 'jewelry' &&
  item.attributes.style === 'statement'
)
```

### 💡 Pairing Recommendations
Attributes drive smart pairing suggestions:

- **High rise + Crop top** = "Pairs well together"
- **Heavy boots + Flowy dress** = "Creates nice contrast"
- **Statement necklace + Crew neck** = "Shows off necklace"

---

## Database Schema

Attributes are stored in two ways:

### 1. Separate Enum Fields (Sub-Types)
```prisma
model Item {
  accessoryType AccessoryType? // purse, bag, etc.
  jewelryType   JewelryType?   // necklace, earrings, etc.
  shoeType      ShoeType?      // sneakers, boots, etc.
  bottomsType   BottomsType?   // jeans, dress_pants, etc.
}
```

### 2. JSON Attributes Field
```prisma
model Item {
  attributes Json? // { "neckline": "v-neck", "rise": "high", ... }
}
```

**Why two approaches?**
- **Sub-types** = Primary categorization (filterable, indexed)
- **Attributes** = Detailed characteristics (flexible, extensible)

---

## API Examples

### Get Item with Attributes
```typescript
const item = await prisma.item.findUnique({
  where: { id: itemId },
  select: {
    id: true,
    category: true,
    bottomsType: true,
    attributes: true,
    colors: true,
    tags: true
  }
});

// Access attributes
console.log(item.attributes.rise); // "high"
console.log(item.attributes.fit);  // "skinny"
```

### Query by Attributes
```typescript
// Find all high-rise bottoms
const highRiseItems = await prisma.item.findMany({
  where: {
    category: 'bottoms',
    attributes: {
      path: ['rise'],
      equals: 'high'
    }
  }
});
```

### Update Attributes
```typescript
await prisma.item.update({
  where: { id: itemId },
  data: {
    attributes: {
      rise: 'high',
      fit: 'skinny',
      visualWeight: 'moderate',
      hemline: 'raw'
    }
  }
});
```

---

## AI Inference

Attributes are automatically detected from photos using AI:

```typescript
// AI analyzes clothing photo
const result = await inferItemDetails(photoBase64);

// Returns:
{
  "category": "bottoms",
  "subType": "jeans",
  "colors": ["black"],
  "colorPalette": ["#1a1a1a"],
  "pattern": "solid",
  "attributes": {
    "rise": "high",
    "fit": "skinny",
    "visualWeight": "moderate",
    "hemline": "raw"
  },
  "fitNotes": "High-rise creates flattering silhouette",
  "pairingTips": [
    "Pairs well with crop tops",
    "Works with tucked-in shirts"
  ],
  "tags": ["casual", "versatile"],
  "confidence": {
    "category": 0.95,
    "attributes": 0.88
  }
}
```

The AI considers:
- Visual appearance
- Common fashion terminology
- Style conventions
- Practical wearability

---

## ADHD-Friendly Design

Attributes support ADHD-friendly features:

### 🎯 **Reduced Decision Paralysis**
- Pre-filtered suggestions based on attributes
- "Top picks" use attribute matching
- Progressive disclosure (show key attributes first)

### 👀 **Visual Clarity**
- Visual weight indicators
- Color compatibility badges
- Clear attribute labels

### ⚡ **Quick Actions**
- Filter by common attributes (high-rise, oversized, etc.)
- One-tap outfit generation using attribute intelligence
- "Find similar" based on attributes

### 🧠 **Learning System**
- Tracks which attribute combinations you choose
- Learns your style preferences
- Personalizes suggestions

---

## Common Questions

### Q: Can I edit attributes manually?
**A:** Yes! While AI infers attributes automatically, you can always edit them in the item detail view.

### Q: What if an attribute doesn't fit my item?
**A:** Use the closest match or leave blank. The system is flexible.

### Q: Do I need to fill out all attributes?
**A:** No! Core attributes (category, colors) are most important. Others enhance recommendations but are optional.

### Q: Can I add custom attributes?
**A:** The `attributes` JSON field is extensible. You can add custom key-value pairs.

### Q: How accurate is AI attribute detection?
**A:** Typically 85-95% accurate. Review and adjust as needed.

---

## Summary

### Total Attributes Tracked

| Category | Attributes |
|----------|-----------|
| **Core** | 10+ fields (title, brand, colors, pattern, etc.) |
| **Tops** | 5 attributes |
| **Bottoms** | 7 attributes |
| **Dresses** | 5 attributes |
| **Outerwear** | 3 attributes |
| **Shoes** | 5 attributes |
| **Accessories** | 6 attributes |
| **Jewelry** | 5 attributes |
| **Swimwear** | 3 attributes |
| **Activewear** | 4 attributes |
| **Sleepwear** | 3 attributes |
| **Loungewear** | 3 attributes |
| **Suits & Sets** | 3 attributes |

**Total: 60+ attributes** across all categories

### Key Benefits

✅ **Smarter outfit generation** - AI matches items intelligently  
✅ **Better organization** - Find exactly what you need  
✅ **Visual balance** - Create harmonious looks  
✅ **ADHD-friendly** - Reduced decision-making burden  
✅ **Learning system** - Gets better over time  

---

**Last Updated:** 2026-01-31  
**Version:** 1.0 (Complete Attributes Reference)

---

## Quick Reference Tables

### Tops Attributes

| Attribute | Options |
|-----------|---------|
| Neckline | crew, v-neck, scoop, boat, square, halter, off-shoulder, turtleneck, cowl, mock, polo |
| Sleeve Length | sleeveless, short, 3/4, long |
| Sleeve Fit | fitted, loose, puff, bell, cap, dolman, raglan |
| Silhouette | fitted, loose, oversized, boxy, cropped, longline, tunic, peplum |

### Bottoms Attributes

| Attribute | Options |
|-----------|---------|
| Rise | high, mid, low, ultra-high, ultra-low |
| Inseam | short (< 27"), regular (27-32"), long (32"+), extra-long (34"+) |
| Leg Shape | skinny, straight, bootcut, flare, wide-leg, tapered, jogger |
| Waistband | elastic, drawstring, button/zip, pull-on, belted |

### Shoes Attributes

| Attribute | Options |
|-----------|---------|
| Heel Height | flat (0-1"), low (1-2"), mid (2-3"), high (3-4"), stiletto (4"+) |
| Toe Shape | round, pointed, square, almond, open |
| Closure | lace-up, slip-on, buckle, zipper, velcro |

### Universal Attributes

| Attribute | Options |
|-----------|---------|
| Visual Weight | minimal, moderate, heavy, complex |
| Pattern | solid, striped, plaid, floral, graphic, abstract, animal, polka-dot, paisley |
| Material | cotton, polyester, wool, silk, denim, leather, synthetic, blend, linen, cashmere |
| Fit | tight, fitted, regular, loose, oversized |

---

**Quick lookup complete!** For detailed descriptions, see sections above.

