# Advanced OUI Features Guide

New features I added to the OUI system: color harmony detection, seasonal intelligence, style learning, and quick actions. All ADHD-friendly.

## New Features

### 1. Color Harmony

**Location:** `app/lib/colorHarmony.ts`

Uses color theory to find colors that work together instead of just exact matches.

**Harmony Types:**
1. **Exact** 🎨 - Same color, score: 1.0
2. **Complementary** 🔄 - Opposite on color wheel (~180°), score: 0.9
3. **Analogous** 🌈 - Adjacent colors (0-60°), score: 0.85
4. **Triadic** 🔺 - 120° apart, score: 0.75
5. **Split-Complementary** 🎭 - 150° and 210° from base, score: 0.7
6. **Neutral Match** ⚫⚪ - Both neutrals or one neutral, score: 0.8-0.85

Emoji indicators show the harmony type at a glance. Simple scores from 0-1. Automatically picks the best match when items have multiple colors.

**Usage:**
```typescript
import { findBestColorHarmony, detectColorHarmony } from '@/app/lib/colorHarmony';

// Find best harmony between item and outfit
const harmony = findBestColorHarmony(
  ['#FF0000', '#000000'], // item colors
  ['#00FF00', '#FFFFFF']  // outfit colors
);

console.log(harmony.type); // 'complementary'
console.log(harmony.score); // 0.9
console.log(harmony.emoji); // '🔄'
console.log(harmony.description); // 'Complementary colors create contrast'
```

**Color Theory:**
- **Complementary:** Bold contrast (red + green)
- **Analogous:** Smooth transitions (blue + purple)
- **Triadic:** Vibrant balance (red + yellow + blue)
- **Neutrals:** Black/white/gray go with everything

---

### 2. Visual Weight Indicators

**Location:** `app/components/VisualWeightBadge.tsx`

Shows how much visual attention an item grabs. Helps you avoid wearing three competing statement pieces.

**Weight Levels:**
1. **Minimal** ⚪ - Simple, understated
2. **Moderate** ◐ - Balanced presence
3. **Heavy** ⚫ - Strong focal point
4. **Complex** 🌟 - Lots of details

Quick visual indicators with no analysis required.

**Usage:**
```typescript
import VisualWeightBadge, { calculateVisualWeight } from '@/app/components/VisualWeightBadge';

// Display badge
<VisualWeightBadge weight="heavy" showLabel={true} size="medium" />

// Calculate from attributes
const weight = calculateVisualWeight({
  pattern: 'graphic print',
  visualWeight: 'heavy',
  embellishments: true
});
```

**Balancing Tips:**
- 1 heavy + 2 minimal = balanced
- All moderate = safe choice
- 2+ heavy = competing focal points (avoid unless intentional)

---

### 3. Quick Actions Menu

**Location:** `app/components/QuickActionsMenu.tsx`

Common actions in one tap instead of clicking through five screens.

**Features:**
- Floating menu with large touch targets (48dp)
- Swipe gestures for mobile
- Haptic feedback (vibration)
- Auto-dismiss after action

**Actions:**
- Add to outfit
- Mark as favorite
- Quick view
- Move to laundry

One tap and you're done. Big touch targets so you don't miss. Icons have labels. Instant feedback.

**Usage:**
```typescript
import QuickActionsMenu, { SwipeActions } from '@/app/components/QuickActionsMenu';

// Floating menu
<QuickActionsMenu
  itemId="item-123"
  onAddToOutfit={() => addToOutfit()}
  onToggleFavorite={() => toggleFavorite()}
  isFavorite={false}
  position="bottom"
/>

// Swipe variant for mobile
<SwipeActions
  itemId="item-123"
  onSwipeLeft={() => favorite()}
  onSwipeRight={() => laundry()}
  leftIcon="⭐"
  rightIcon="🧺"
>
  <ItemCard {...item} />
</SwipeActions>
```

**Haptic Feedback:**
- 50ms vibration on action
- Works on iOS/Android
- Gracefully degrades on desktop

---

### 4. Seasonal Intelligence

**Location:** `app/lib/seasonalIntelligence.ts`, `app/components/SeasonalBanner.tsx`

Figures out what season it is and suggests stuff that makes sense for the weather.

**Features:**
- Auto-detection based on current month
- Seasonal scoring: rates item appropriateness (0-1)
- Tips for each season
- Filtering: show/hide off-season items

**Season Recommendations:**
```typescript
Spring 🌸
- Accessories: scarf, hat, sunglasses
- Colors: Pastels (#FFB6C1, #90EE90)
- Tip: "Layer with light scarves"

Summer ☀️
- Accessories: sunglasses, hat, belt
- Colors: Bright (#FFD700, #FF6347)
- Tip: "Sunglasses are essential"

Fall 🍂
- Accessories: scarf, belt, hat
- Colors: Earth tones (#D2691E, #8B4513)
- Tip: "Scarves add warmth and style"

Winter ❄️
- Accessories: scarf, gloves, hat
- Colors: Deep (#000000, #8B0000)
- Tip: "Scarves and gloves keep you warm"
```

Updates automatically. Banner can be dismissed. Short tips. Season emoji.

**Usage:**
```typescript
import { getCurrentSeason, getSeasonalScore, filterBySeason } from '@/app/lib/seasonalIntelligence';
import SeasonalBanner, { SeasonalBadge } from '@/app/components/SeasonalBanner';

// Show seasonal banner
<SeasonalBanner />

// Score item
const { score, reason } = getSeasonalScore('accessories', 'scarf');

// Show badge on item
<SeasonalBadge score={score} reason={reason} size="small" />

// Filter items
const seasonalItems = filterBySeason(allItems, 'winter', 0.7);
```

**Scoring:**
- 1.0 = Perfect for season (e.g., scarf in winter)
- 0.7 = Works in season
- 0.2 = Not ideal (e.g., sandals in winter)

---

### 5. Style Profile Learning

**Location:** `app/lib/styleProfile.ts`, `app/components/StyleProfileWidget.tsx`

Learns what you like and gets better at suggesting things you'll actually wear.

**Tracks:**
- Top 5 colors
- Most-used categories
- Style tags
- Recent patterns

**How it works:**
Every time you add something to an outfit, it remembers. After your last 100 choices, it boosts suggestions that match your style. All stored locally in your browser.

Zero setup. Learns in the background. Gets better the more you use it.

**Usage:**
```typescript
import { 
  recordStyleChoice, 
  getPersonalizationBoost,
  getStyleInsights,
  calculatePreferenceScore
} from '@/app/lib/styleProfile';
import StyleProfileWidget, { StyleMatchBadge } from '@/app/components/StyleProfileWidget';

// Record when user adds item
recordStyleChoice(
  'item-123',
  'tops',
  ['#000000', '#ffffff'],
  ['graphic', 'band-tee']
);

// Get personalization boost
const boost = getPersonalizationBoost('tops', ['#000000'], ['graphic']);
// Returns 0.8-1.2 multiplier

// Show profile widget
<StyleProfileWidget />

// Show match badge on items
<StyleMatchBadge score={0.9} size="medium" />

// Get insights
const insights = getStyleInsights();
console.log(insights.topColor); // '#000000'
console.log(insights.recentTrend); // 'Loving tops lately!'
```

**Scoring:**
- 0.0-0.3: Doesn't match
- 0.4-0.6: Neutral
- 0.7-0.9: Good match ("Your style" badge)
- 0.9-1.0: Perfect match (20% boost)

**Privacy:**
- Stored in browser localStorage
- Never sent to server
- User can clear anytime

---

## Integration Examples

### Enhanced Item Card

```typescript
import { useState } from 'react';
import VisualWeightBadge from '@/app/components/VisualWeightBadge';
import QuickActionsMenu from '@/app/components/QuickActionsMenu';
import { SeasonalBadge } from '@/app/components/SeasonalBanner';
import { StyleMatchBadge } from '@/app/components/StyleProfileWidget';
import { ColorCompatibilityBadge } from '@/app/components/ColorCompatibilityBadge';

function EnhancedItemCard({ item, outfitColors }) {
  return (
    <div className="relative bg-surface-container rounded-xl p-4">
      {/* Quick Actions */}
      <div className="absolute top-2 right-2">
        <QuickActionsMenu
          itemId={item.id}
          onAddToOutfit={() => addToOutfit(item)}
          onToggleFavorite={() => toggleFavorite(item)}
          isFavorite={item.isFavorite}
        />
      </div>
      
      {/* Item Image */}
      <img src={item.imageUrl} alt={item.title} />
      
      {/* Badges */}
      <div className="flex flex-wrap gap-2 mt-2">
        <VisualWeightBadge 
          weight={item.attributes?.visualWeight || 'moderate'} 
        />
        <SeasonalBadge 
          score={item.seasonalScore} 
          reason={item.seasonalReason} 
        />
        <StyleMatchBadge score={item.styleScore} />
        {outfitColors.length > 0 && (
          <ColorCompatibilityBadge
            itemColors={item.colorPalette}
            outfitColors={outfitColors}
          />
        )}
      </div>
      
      {/* Item Details */}
      <h3>{item.title}</h3>
      <p>{item.category}</p>
    </div>
  );
}
```

### Enhanced Outfit Builder

```typescript
import SeasonalBanner from '@/app/components/SeasonalBanner';
import StyleProfileWidget from '@/app/components/StyleProfileWidget';
import SmartAccessorySuggestions from '@/app/components/SmartAccessorySuggestions';

function EnhancedOutfitBuilder() {
  return (
    <div className="space-y-4">
      {/* Contextual Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SeasonalBanner />
        <StyleProfileWidget />
      </div>
      
      {/* Current Outfit */}
      <div className="current-outfit">
        {/* ... outfit items ... */}
      </div>
      
      {/* Smart Suggestions with all enhancements */}
      <SmartAccessorySuggestions
        outfitItems={outfitItems}
        onAddAccessory={handleAddAccessory}
      />
    </div>
  );
}
```

---

## Performance Considerations

### Color Harmony
- **Computation:** O(n*m) where n = item colors, m = outfit colors
- **Optimization:** Caches HSL conversions
- **Impact:** Negligible (<1ms for typical cases)

### Style Profile
- **Storage:** ~10-50KB in localStorage
- **Lookup:** O(1) for frequency checks
- **Persistence:** Survives browser refreshes

### Seasonal Intelligence
- **Computation:** O(1) season detection
- **Storage:** Banner dismissal date in localStorage
- **Updates:** Daily (auto-resets dismissed banner)

---

## ADHD-Friendly Design

**Visual Clarity:**
- Emojis so you don't have to read everything
- Consistent color meanings
- Most important info first

**Less Friction:**
- Season and color harmony work automatically
- Style profile learns without training
- One tap instead of five clicks

**Decision Support:**
- Scores from 0-1
- Best options at the top
- Short explanations

**Progressive Disclosure:**
- Seasonal banner dismisses but comes back tomorrow
- Style widget expands when you want details
- Quick actions hide until needed

---

## Testing

**Color Harmony:**
- Create outfit with complementary colors (red + green) - verify harmony badge shows "🔄 Bold contrast"
- Try analogous colors (blue + purple) - verify shows "🌈 Harmonious blend"

**Visual Weight:**
- Add simple black tee (should show minimal)
- Add graphic print (should show heavy/complex)
- Check outfit balance suggestions

**Quick Actions:**
- Click quick actions button - menu appears with 4 actions
- Actions trigger correctly
- Menu auto-dismisses after action
- Test swipe gestures on mobile

**Seasonal Intelligence:**
- Seasonal banner appears and shows current season
- Displays 3 suggested accessories
- Can be dismissed
- Reappears next day

**Style Profile:**
- Add 5+ items to outfits
- Profile widget appears with favorite colors and top category
- "Your style" badges appear on matching items

---

## Troubleshooting

**Color harmony not showing:**
- Check item has colorPalette field
- Verify colors in hex format
- Ensure outfit has colors too

**Seasonal banner keeps appearing:**
- Check localStorage for dismissal
- Verify date string format
- Clear localStorage to reset

**Style profile not learning:**
- Check localStorage is enabled
- Verify recordStyleChoice is called
- Check browser console for errors

**Quick actions not working:**
- Verify all callback props provided
- Check z-index for backdrop
- Test on mobile device for haptic

---

## Future Ideas

**Color Harmony:**
- Suggest color palettes when adding new items
- Warn before adding something that clashes
- Generate whole color schemes

**Seasonal Intelligence:**
- Weather API for actual location
- Southern vs Northern hemisphere
- Climate zone adjustments

**Style Profile:**
- Export/import profile
- Anonymous style comparisons
- Better AI predictions

**Visual Weight:**
- AI for smarter calculation
- Visual outfit balance preview
- Proportion analysis

---

## API Changes

No new API endpoints required. All features work client-side with existing data structures.

**Optional Enhancement:**
Add fields to Item model for caching:
```prisma
model Item {
  // ... existing fields ...
  calculatedWeight   VisualWeight?
  seasonalScore     Float?
  styleScore        Float?
}
```

---

## Migration

If updating from an older version:

1. No database changes needed
2. LocalStorage entries created automatically
3. Backwards compatible

To integrate:

```typescript
// Import
import SeasonalBanner from '@/app/components/SeasonalBanner';
import StyleProfileWidget from '@/app/components/StyleProfileWidget';
import QuickActionsMenu from '@/app/components/QuickActionsMenu';

// Add to pages
<SeasonalBanner />
<StyleProfileWidget />

// Use color harmony
import { findBestColorHarmony } from '@/app/lib/colorHarmony';

// Track style choices
import { recordStyleChoice } from '@/app/lib/styleProfile';
recordStyleChoice(itemId, category, colors, tags);
```

---

Built with 💜 for people with ADHD, visual thinkers, and anyone who gets stuck making decisions.
