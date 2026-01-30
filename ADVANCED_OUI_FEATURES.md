# Advanced OUI Features Guide

## Overview

This document describes the advanced features added to the Orchestrated User Interface (OUI) system. These enhancements make the system even more intelligent and ADHD-friendly by adding color harmony detection, seasonal intelligence, style learning, and quick actions.

## New Features

### 1. Advanced Color Harmony 🎨

**Location:** `app/lib/colorHarmony.ts`

**What it does:**
Goes beyond exact color matching to detect sophisticated color relationships based on color theory.

**Harmony Types:**
1. **Exact** (🎨) - Same color, score: 1.0
2. **Complementary** (🔄) - Opposite on color wheel (~180°), score: 0.9
3. **Analogous** (🌈) - Adjacent colors (0-60°), score: 0.85
4. **Triadic** (🔺) - 120° apart, score: 0.75
5. **Split-Complementary** (🎭) - 150° and 210° from base, score: 0.7
6. **Neutral Match** (⚫⚪) - Both neutrals or one neutral, score: 0.8-0.85

**ADHD Benefits:**
- Visual emoji indicators for quick recognition
- Simple scores (no complex explanations needed)
- Auto-calculates best match from multiple colors

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

**Color Theory Made Simple:**
- **Complementary:** Bold contrast (e.g., red + green)
- **Analogous:** Smooth transitions (e.g., blue + purple)
- **Triadic:** Vibrant balance (e.g., red + yellow + blue)
- **Neutrals:** Black/white/gray go with everything

---

### 2. Visual Weight Indicators ⚫◐⚪

**Location:** `app/components/VisualWeightBadge.tsx`

**What it does:**
Shows how much visual attention an item demands, helping users balance outfits.

**Weight Levels:**
1. **Minimal** (⚪) - Simple, understated
2. **Moderate** (◐) - Balanced presence
3. **Heavy** (⚫) - Strong focal point
4. **Complex** (🌟) - Lots of details

**ADHD Benefits:**
- Clear emoji indicators
- Helps balance outfits without overthinking
- Prevents "too busy" looks

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

### 3. Quick Actions Menu ⚡

**Location:** `app/components/QuickActionsMenu.tsx`

**What it does:**
One-tap access to common actions without navigating through menus.

**Features:**
- **QuickActionsMenu:** Floating menu with large touch targets
- **SwipeActions:** Swipe gestures for mobile
- **Haptic Feedback:** Vibration on mobile devices
- **Auto-dismiss:** Closes after action

**Actions Available:**
- ➕ Add to outfit
- ⭐ Mark as favorite
- 👁️ Quick view
- 🧺 Move to laundry

**ADHD Benefits:**
- Reduces friction (no multi-step flows)
- Large 48dp touch targets
- Clear icons with labels
- Immediate feedback

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

### 4. Seasonal Intelligence 🌸☀️🍂❄️

**Location:** `app/lib/seasonalIntelligence.ts`, `app/components/SeasonalBanner.tsx`

**What it does:**
Auto-detects current season and provides smart recommendations.

**Features:**
- **Auto-detection:** Based on current month
- **Seasonal scoring:** Rates item appropriateness (0-1)
- **Smart tips:** Actionable advice for each season
- **Filtering:** Show/hide off-season items

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

**ADHD Benefits:**
- Auto-updates (no manual input)
- Dismissible banner (doesn't nag)
- Brief, actionable tips
- Visual season indicators

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

### 5. Style Profile Learning 💜🧠

**Location:** `app/lib/styleProfile.ts`, `app/components/StyleProfileWidget.tsx`

**What it does:**
Learns user preferences automatically to improve suggestions over time.

**What it tracks:**
- Favorite colors (top 5)
- Preferred categories
- Common style tags
- Recent trends

**How it works:**
1. Records every item added to outfit
2. Stores last 100 choices in localStorage
3. Calculates frequency scores
4. Boosts suggestions matching user's style

**ADHD Benefits:**
- No setup required
- Learns passively in background
- Shows encouraging feedback
- Improves experience over time

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

**Preference Scoring:**
- 0.0-0.3: Doesn't match your style
- 0.4-0.6: Neutral
- 0.7-0.9: Good match (shows "Your style" badge)
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

All features follow ADHD-optimized principles:

### Visual Clarity
- **Emoji indicators:** Quick recognition without reading
- **Color coding:** Consistent meanings across features
- **Badge hierarchy:** Most important badges show first

### Reduced Friction
- **Auto-detection:** Season, color harmony calculated automatically
- **Passive learning:** Style profile learns without user action
- **One-tap actions:** Quick menu reduces steps

### Decision Support
- **Scores:** Clear 0-1 ranges
- **Rankings:** Best options highlighted
- **Explanations:** Brief, actionable reasoning

### Progressive Disclosure
- **Seasonal banner:** Dismissible, reappears next day
- **Style widget:** Expandable for more details
- **Quick actions:** Hidden until needed

---

## Testing Guide

### Manual Testing

**Color Harmony:**
- [ ] Create outfit with complementary colors (red + green)
- [ ] Verify harmony badge shows "🔄 Bold contrast"
- [ ] Try analogous colors (blue + purple)
- [ ] Verify shows "🌈 Harmonious blend"

**Visual Weight:**
- [ ] Add simple black tee (should show minimal)
- [ ] Add graphic print (should show heavy/complex)
- [ ] Verify outfit balance suggestions

**Quick Actions:**
- [ ] Click quick actions button
- [ ] Menu appears with 4 actions
- [ ] Actions trigger correctly
- [ ] Menu auto-dismisses after action
- [ ] Test swipe gestures on mobile

**Seasonal Intelligence:**
- [ ] Seasonal banner appears
- [ ] Shows current season correctly
- [ ] Displays 3 suggested accessories
- [ ] Can be dismissed
- [ ] Reappears next day

**Style Profile:**
- [ ] Add 5+ items to outfits
- [ ] Profile widget appears
- [ ] Shows favorite colors
- [ ] Shows top category
- [ ] "Your style" badges appear on matching items

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

## Future Enhancements

### Advanced Color Harmony
- Suggest color palettes for new items
- Warn about color clashes before adding
- Generate color scheme suggestions

### Seasonal Intelligence
- Weather API integration
- Location-based seasons (hemispheres)
- Climate zone adjustments

### Style Profile
- Export/import profile
- Share profile anonymously for comparisons
- AI-powered style predictions

### Visual Weight
- Advanced calculation with AI
- Outfit balance visualizer
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

## Migration Guide

### Existing Installations

1. **No database changes required** - Features work with existing schema
2. **LocalStorage:** Features create entries automatically
3. **Backwards compatible:** All features gracefully degrade

### Integration Steps

```typescript
// 1. Import new components
import SeasonalBanner from '@/app/components/SeasonalBanner';
import StyleProfileWidget from '@/app/components/StyleProfileWidget';
import QuickActionsMenu from '@/app/components/QuickActionsMenu';

// 2. Add to pages
<SeasonalBanner />
<StyleProfileWidget />

// 3. Enhance existing components
import { findBestColorHarmony } from '@/app/lib/colorHarmony';
// Use in ColorCompatibilityBadge (already updated)

// 4. Record user actions
import { recordStyleChoice } from '@/app/lib/styleProfile';
recordStyleChoice(itemId, category, colors, tags);
```

---

## Credits

Built with 💜 for people with ADHD

**Features designed for:**
- Color theory enthusiasts
- Visual thinkers
- People who struggle with decisions
- Users who want personalized experiences
- Mobile-first interactions

---

**Last Updated:** 2026-01-30  
**Version:** 2.0  
**Status:** Production Ready
