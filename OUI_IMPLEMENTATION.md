# Orchestrated User Interface (OUI) Implementation Guide

## Overview

This document describes the implementation of Orchestrated User Interface (OUI), also known as Generative UI, in the ADHD Closet application. The OUI approach creates context-aware, intelligent interfaces that adapt to user needs and provide smart suggestions without overwhelming the user.

## What is Orchestrated/Generative UI?

Orchestrated UI is an AI-powered approach to interface design where the UI dynamically generates contextually relevant suggestions, recommendations, and interface elements based on:

1. **User context** - What the user is currently doing
2. **Data patterns** - Analysis of available items and their attributes
3. **AI intelligence** - Smart recommendations from LLM/vision models
4. **Progressive disclosure** - Showing the right information at the right time

## Why OUI is Perfect for ADHD Users

The OUI approach aligns perfectly with ADHD-friendly design principles:

### 1. Reduces Decision Paralysis
- **Problem**: ADHD users can become overwhelmed by too many choices
- **OUI Solution**: Presents 3-5 curated suggestions instead of all options
- **Example**: "Complete the Look" shows only accessories that match current outfit

### 2. Contextual Intelligence
- **Problem**: Remembering what goes with what is difficult
- **OUI Solution**: AI analyzes color palettes, styles, and visual weight automatically
- **Example**: Suggests statement jewelry for simple outfits, minimal jewelry for complex ones

### 3. Progressive Disclosure
- **Problem**: Too much information at once causes cognitive overload
- **OUI Solution**: Shows basic info first, reveals details on demand
- **Example**: Sub-categories appear only when a main category is selected

### 4. Instant Feedback
- **Problem**: Uncertainty about choices increases anxiety
- **OUI Solution**: Visual indicators show compatibility immediately
- **Example**: Color match badges show if accessories coordinate with outfit

### 5. Clear Visual Hierarchy
- **Problem**: ADHD users struggle with competing focal points
- **OUI Solution**: AI confidence scores highlight best suggestions
- **Example**: "Top pick" and "Perfect match" badges guide attention

## Components Implemented

### 1. SmartAccessorySuggestions Component

**Location**: `app/components/SmartAccessorySuggestions.tsx`

**Purpose**: Context-aware accessory recommendations for outfit building

**Features**:
- Fetches suggestions based on current outfit items
- Shows color compatibility indicators
- Displays confidence scores visually
- Progressive disclosure (show 3, expand to show more)
- One-click add to outfit

**ADHD Benefits**:
- Limits choices to 3-5 most relevant items
- Clear visual feedback (color match badges)
- Explains *why* each suggestion works
- No manual searching required

**Usage**:
```tsx
<SmartAccessorySuggestions
  outfitItems={[
    { id: '123', category: 'tops', colorPalette: ['#000000', '#ffffff'] }
  ]}
  onAddAccessory={(accessoryId) => addToOutfit(accessoryId)}
/>
```

### 2. CategoryTabsEnhanced Component

**Location**: `app/components/CategoryTabsEnhanced.tsx`

**Purpose**: Dynamic category navigation with sub-category filtering

**Features**:
- Main category tabs (Tops, Bottoms, Accessories, Jewelry, Shoes)
- Sub-category chips appear contextually
- Accessories: Purses, Bags, Backpacks, Belts, Hats, Scarves
- Jewelry: Necklaces, Earrings, Bracelets, Rings
- Shoes: Sneakers, Boots, Sandals, Heels

**ADHD Benefits**:
- Progressive disclosure: sub-categories only shown when relevant
- Clear visual hierarchy with icons
- Reduces cognitive load by chunking information
- Touch-friendly 48dp minimum targets

**Usage**:
```tsx
<CategoryTabsEnhanced
  selectedCategory="accessories"
  onCategoryChange={(cat) => setCategory(cat)}
  selectedSubCategory="purse"
  onSubCategoryChange={(sub) => setSubCategory(sub)}
/>
```

### 3. ColorCompatibilityBadge Component

**Location**: `app/components/ColorCompatibilityBadge.tsx`

**Purpose**: Visual indicator of color coordination between items

**Features**:
- Shows matching colors as colored dots
- Displays "Perfect match" or "Goes well" text
- Only appears when items coordinate
- Color palette preview

**ADHD Benefits**:
- Instant visual feedback
- Reduces decision uncertainty
- No need to mentally compare colors
- Clear, emoji-enhanced messaging

**Usage**:
```tsx
<ColorCompatibilityBadge
  itemColors={['#000000', '#ffffff']}
  outfitColors={['#000000', '#ff0000']}
  className="bg-tertiary/10 text-tertiary"
/>
```

## API Endpoints

### POST /api/accessories/suggest

**Purpose**: Get smart accessory suggestions for an outfit

**Input**:
```json
{
  "outfitItems": [
    {
      "id": "item-123",
      "category": "tops",
      "colorPalette": ["#000000", "#ffffff"]
    }
  ]
}
```

**Output**:
```json
{
  "suggestions": [
    {
      "id": "acc-456",
      "title": "Black Leather Purse",
      "category": "accessories",
      "subType": "purse",
      "imageUrl": "/api/images/...",
      "reason": "Color-coordinated with outfit",
      "confidenceScore": 0.85,
      "colorMatch": true
    }
  ]
}
```

**Intelligence**:
1. Checks what's missing (shoes, accessories, jewelry)
2. Analyzes outfit color palette
3. Considers visual weight (simple vs complex outfits)
4. Scores suggestions by confidence
5. Returns top 5 recommendations

## AI Enhancements

### Enhanced Item Inference

The AI inference now detects:
- **Sub-types**: Purse, necklace, sneakers, etc.
- **Pairing tips**: What works well with this item
- **Visual weight**: Minimal, moderate, heavy
- **Occasion tags**: Casual, formal, both

Example AI response:
```json
{
  "category": "accessories",
  "subType": "purse",
  "colors": ["black", "silver"],
  "colorPalette": ["#000000", "#c0c0c0"],
  "attributes": {
    "accessoryType": "purse",
    "size": "medium",
    "material": "leather",
    "structure": "structured",
    "visualWeight": "moderate",
    "occasion": "both"
  },
  "pairingTips": [
    "Pairs well with high-waisted bottoms",
    "Works as everyday or formal accessory"
  ]
}
```

### Enhanced Outfit Generation

The outfit generation now includes:
- **Accessory suggestions**: Contextual recommendations
- **Visual weight balancing**: Adds accessories to balance minimal outfits
- **Color coordination**: Matches accessory colors to outfit palette
- **Occasion awareness**: Suggests formal shoes for work outfits

Example AI prompt enhancement:
```
IMPORTANT: Use an Orchestrated/Generative UI approach:
- Include accessories (purses, bags, jewelry) when they enhance the outfit
- Suggest shoes that match the occasion and weather
- Add jewelry strategically (statement for simple, minimal for busy)
- Consider visual weight: add accessories to balance minimal outfits
- Match accessory colors to outfit palette
```

## Database Schema Changes

### New Enums

```prisma
enum AccessoryType {
  purse, bag, backpack, belt, hat, scarf, gloves, sunglasses, watch, other
}

enum JewelryType {
  necklace, earrings, bracelet, ring, anklet, brooch, other
}

enum ShoeType {
  sneakers, boots, sandals, heels, flats, loafers, oxfords, platforms, other
}
```

### Item Model Updates

```prisma
model Item {
  // ... existing fields ...
  accessoryType AccessoryType? @map("accessory_type")
  jewelryType   JewelryType?   @map("jewelry_type")
  shoeType      ShoeType?      @map("shoe_type")
}
```

## Design Principles

### 1. Contextual Intelligence
- UI adapts based on what user is doing
- Suggestions change based on current outfit composition
- Filters appear/disappear based on selection

### 2. Confidence-Based Display
- High confidence (>0.8): "Top pick" badge
- Color match: "Perfect match" badge
- Visual indicators guide attention

### 3. Progressive Disclosure
- Start with 3 suggestions, expand to see more
- Sub-categories appear only when category is selected
- Details shown on hover/click, not by default

### 4. Visual Feedback
- Color dots show coordination
- Badges indicate quality of match
- Icons provide quick recognition

### 5. Clear Reasoning
- Every suggestion includes a "reason" field
- Explains *why* it's being suggested
- Reduces uncertainty and builds confidence

## User Flows

### Flow 1: Building an Outfit with Smart Suggestions

1. User selects top and bottom from closet
2. SmartAccessorySuggestions component appears automatically
3. Shows "Complete the Look" with 3 accessory suggestions
4. Each suggestion shows:
   - Thumbnail image
   - Color compatibility badge
   - Brief explanation ("Matches your outfit colors")
   - Confidence indicator ("Top pick")
5. User clicks to add accessory to outfit
6. New suggestions appear for remaining gaps (shoes, jewelry)

### Flow 2: Browsing Accessories by Sub-Type

1. User clicks "Accessories" in category tabs
2. Sub-category chips appear below: Purses, Bags, Hats, etc.
3. User clicks "Purses"
4. Grid shows only purse items
5. Can click "All accessories" to see all types again

### Flow 3: AI Outfit Generation with Accessories

1. User clicks "Generate Outfit"
2. Selects constraints (weather, vibe, occasion)
3. AI generates complete outfits including:
   - Clothing items (top, bottom, outerwear)
   - Shoes
   - Accessories (purse/bag)
   - Jewelry (if appropriate)
4. Each outfit shows accessory reasoning:
   - "Minimal jewelry to let graphic tee be focal point"
   - "Black boots match outfit palette"
   - "Statement necklace adds visual interest"

## Testing

### Manual Testing Checklist

- [ ] SmartAccessorySuggestions appears when building outfit
- [ ] Suggestions change based on outfit colors
- [ ] "Show more" button reveals additional suggestions
- [ ] Color compatibility badges appear when colors match
- [ ] Sub-categories appear when selecting Accessories/Jewelry/Shoes
- [ ] Sub-category filtering works correctly
- [ ] "Top pick" badges appear for high-confidence suggestions
- [ ] AI outfit generation includes accessories
- [ ] Migration applies successfully to database

### Accessibility Testing

- [ ] All interactive elements have 48dp touch targets
- [ ] Color is not the only indicator (icons + text always present)
- [ ] Keyboard navigation works for all components
- [ ] Screen reader announces badge content
- [ ] Focus indicators are visible (3px outline)

## Performance Considerations

### API Optimization
- Limits accessory queries to 10 items per category
- Returns only top 5 suggestions
- Caches color palette comparisons

### Component Optimization
- Uses React hooks for efficient re-renders
- Progressive loading (3 items initially, more on demand)
- Lazy-loads thumbnail images

### Database Optimization
- Indexed queries on category, state, colorPalette
- Limit queries to available items only
- Uses Prisma's efficient joins

## Future Enhancements

### Phase 2 Improvements (Not Yet Implemented)

1. **Advanced Color Harmony**
   - Detect complementary colors (not just exact matches)
   - Suggest color-blocking opportunities
   - Warn about clashing colors

2. **Style Profile Learning**
   - Track which suggestions user accepts/rejects
   - Learn personal style preferences
   - Improve suggestion quality over time

3. **Seasonal Intelligence**
   - Suggest scarves/hats for winter
   - Recommend sandals for summer
   - Weather-based accessory filtering

4. **Occasion-Aware Defaults**
   - Auto-filter formal accessories for work outfits
   - Suggest casual bags for weekend looks
   - Event-specific jewelry recommendations

5. **Visual Weight Calculator**
   - Advanced algorithm for visual weight scoring
   - Balance suggestions across entire outfit
   - Proportion analysis visualization

## Migration Guide

### Applying Schema Changes

```bash
cd app
npx prisma migrate dev --name add_accessory_subtypes
npx prisma generate
```

### Updating Existing Items

Existing items will have `null` for new sub-type fields. To populate:

```typescript
// Example: Infer sub-types from item titles/tags
const shoes = await prisma.item.findMany({
  where: { category: 'shoes', shoeType: null }
});

for (const shoe of shoes) {
  const title = shoe.title?.toLowerCase() || '';
  let shoeType: ShoeType = 'other';
  
  if (title.includes('sneaker') || title.includes('trainer')) {
    shoeType = 'sneakers';
  } else if (title.includes('boot')) {
    shoeType = 'boots';
  }
  // ... more inference logic
  
  await prisma.item.update({
    where: { id: shoe.id },
    data: { shoeType }
  });
}
```

## Troubleshooting

### Suggestions Not Appearing

1. Check that outfit has items with `colorPalette` field
2. Verify API endpoint is returning data: `curl -X POST localhost:3000/api/accessories/suggest`
3. Check browser console for errors
4. Ensure items are in `available` state

### Sub-Categories Not Showing

1. Verify category is one of: accessories, jewelry, shoes
2. Check that `showSubCategories` state is true
3. Ensure `onSubCategoryChange` handler is provided

### Color Badges Not Showing

1. Verify items have `colorPalette` field populated
2. Check that colors are in hex format (e.g., "#000000")
3. Badge only shows when colors actually match

## Contributing

When adding new OUI features:

1. Follow ADHD-friendly design principles
2. Include clear explanations ("reason" fields)
3. Use progressive disclosure patterns
4. Add visual confidence indicators
5. Test with real ADHD users if possible
6. Document reasoning behind suggestions
7. Update this guide with new patterns

## Resources

- [SPEC.md](../SPEC.md) - Full ADHD-friendly UX rules
- [ADHD_IMPROVEMENTS.md](../ADHD_IMPROVEMENTS.md) - Other ADHD features
- [Material Design 3 Guidelines](https://m3.material.io/)
- [Generative UI Best Practices](https://vercel.com/blog/ai-sdk-3-generative-ui)

---

**Built with 💜 for people with ADHD**

Last updated: 2026-01-30
