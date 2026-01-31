# Real vs AI-Generated Items Guide

## Overview

The ADHD Closet now distinguishes between **real wardrobe items** (clothes you actually own) and **AI-generated variations** (color variations, style transfers, etc.). This helps keep your view clean and focused on your actual wardrobe by default.

## User Problem

> "So i only want to see my real clothes not recolored versions"

Users were seeing both their actual wardrobe items AND AI-generated variations mixed together, which was:
- Cluttered and overwhelming
- Made it hard to see what they actually own
- Not ADHD-friendly (too many choices)
- Confusing when planning outfits

## Solution

### Default Behavior: Show Only Real Clothes ✅

By default, the application now **only shows real wardrobe items** and hides all AI-generated variations.

### Optional: View AI-Generated Items

Users can toggle a filter to **include AI-generated items** when they want to explore color variations, style transfers, or other AI-generated suggestions.

---

## How It Works

### Database Schema

Three new fields track whether items are real or generated:

```prisma
model Item {
  // ... existing fields ...
  
  // AI-generated vs real item tracking
  isGenerated     Boolean   @default(false)  // Is this AI-generated?
  sourceItemId    String?                    // Links to original real item
  generationType  String?                    // Type of generation
}
```

**Field Descriptions:**

- **`isGenerated`** (Boolean, default: false)
  - `false` = Real wardrobe item you actually own
  - `true` = AI-generated variation (color, seasonal, etc.)

- **`sourceItemId`** (String, optional)
  - If generated, references the ID of the original real item
  - Allows tracing generated items back to their source

- **`generationType`** (String, optional)
  - Describes type of generation:
    - `'color_variation'` - Different color of same item
    - `'seasonal'` - Seasonal adaptation
    - `'style_transfer'` - Style transfer from reference
    - `'matching'` - Generated matching piece
    - `'outfit_context'` - Context-specific variation

---

## User Interface

### Filter Toggle

Located in the Filter Panel on desktop:

```
AI-Generated Items 🤖
━━━━━━━━━━━━━━━━━━━━━━━━
[🙈 Only Real Clothes    ] ← Default (OFF)
Only showing your actual wardrobe items
```

**When toggled ON:**
```
[👁️ Showing AI-Generated ✓]
Includes color variations and AI-generated items
```

### Visual Indicators

| Icon | State | Meaning |
|------|-------|---------|
| 🙈 | Default | Only real clothes shown |
| 👁️ | Toggled | AI-generated items included |

---

## API Behavior

### GET /api/items

**Default (excludes generated):**
```
GET /api/items
GET /api/items?excludeGenerated=true
```
Returns only real wardrobe items.

**Include generated items:**
```
GET /api/items?excludeGenerated=false
```
Returns both real and AI-generated items.

### Query Logic

```typescript
// Default behavior
const excludeGenerated = searchParams.get('excludeGenerated') !== 'false';

// Build where clause
const where: any = {};
if (excludeGenerated) {
  where.isGenerated = false;  // Only real items
}
```

---

## Use Cases

### Use Case 1: Daily Wardrobe Management

**Scenario:** Planning your outfit for today

**Behavior:**
- Filter: `showGenerated = false` (default)
- Shows: Only real clothes you can actually wear
- Benefits: Clear view, no AI clutter

### Use Case 2: Exploring Color Options

**Scenario:** "What would my favorite band tee look like in burgundy?"

**Steps:**
1. Toggle filter to show AI-generated items
2. Generate color variation
3. View generated burgundy version
4. Toggle filter off to return to real wardrobe

### Use Case 3: Shopping Planning

**Scenario:** Deciding what colors to buy

**Behavior:**
- Generate multiple color variations
- Compare all versions (real + generated)
- Decide which colors to actually purchase
- Toggle filter off after decision

---

## ADHD-Friendly Design

### Reduces Clutter ✅
- Default view shows only what you own
- No overwhelming choices
- Clear, focused view

### Clear Visual Feedback ✅
- Emoji indicators (🙈 vs 👁️)
- Descriptive text explains current state
- No guessing what you're viewing

### Easy Toggle ✅
- One-click to switch modes
- Remembers your preference during session
- Quick to explore then return

### Flexible ✅
- Default optimized for daily use
- Optional exploration mode
- Best of both worlds

---

## Migration

### Automatic Migration

When you first run after updating:

```bash
cd app
npx prisma migrate deploy
```

**What happens:**
1. Adds `isGenerated`, `sourceItemId`, `generationType` columns
2. Sets `isGenerated = false` for all existing items
3. Adds indexes for performance

**Result:** All existing items are marked as real (not generated) ✅

### No Data Loss

- Zero breaking changes
- Backward compatible
- Existing items unaffected

---

## For Developers

### Creating AI-Generated Items

When generating variations, set the fields:

```typescript
// Example: Color variation
const generatedItem = await prisma.item.create({
  data: {
    title: `${originalItem.title} (Burgundy Variation)`,
    category: originalItem.category,
    // ... copy other fields ...
    
    // Mark as generated
    isGenerated: true,
    sourceItemId: originalItem.id,
    generationType: 'color_variation',
  }
});
```

### Querying Real Items Only

```typescript
// Get only real wardrobe items
const realItems = await prisma.item.findMany({
  where: {
    isGenerated: false,
  }
});
```

### Querying All Items

```typescript
// Get everything (real + generated)
const allItems = await prisma.item.findMany({
  // No isGenerated filter
});
```

### Finding Generated Variations of an Item

```typescript
// Get all variations of a specific item
const variations = await prisma.item.findMany({
  where: {
    sourceItemId: originalItemId,
    isGenerated: true,
  }
});
```

---

## Performance

### Indexes

Two indexes added for fast queries:

```sql
CREATE INDEX items_is_generated_idx ON items(is_generated);
CREATE INDEX items_source_item_id_idx ON items(source_item_id);
```

**Impact:**
- Fast filtering by generated status
- Efficient lookups of source items
- Minimal overhead

---

## Testing

### Test Scenarios

**1. Default View**
```
Given: User has 50 real items and 10 generated variations
When: User views closet
Then: Only 50 real items are shown
```

**2. Toggle ON**
```
Given: Filter is OFF (default)
When: User toggles "Show AI-Generated" ON
Then: All 60 items are shown (50 real + 10 generated)
```

**3. Toggle OFF**
```
Given: Filter is ON (showing all)
When: User toggles "Show AI-Generated" OFF
Then: Only 50 real items are shown
```

**4. Clear Filters**
```
Given: Various filters applied
When: User clicks "Clear all"
Then: Filter returns to default (showGenerated = false)
```

---

## Benefits Summary

### For Users ✅

| Benefit | Description |
|---------|-------------|
| **Clean View** | Only see what you actually own |
| **Less Overwhelm** | Fewer choices by default |
| **Easy Exploration** | Toggle to view variations |
| **ADHD-Friendly** | Reduced cognitive load |
| **Flexible** | Best of both worlds |

### For System ✅

| Benefit | Description |
|---------|-------------|
| **Clear Separation** | Real vs generated tracked |
| **Traceable** | Generated items link to source |
| **Performant** | Indexed for speed |
| **Backward Compatible** | Zero breaking changes |
| **Extensible** | Easy to add generation types |

---

## Future Enhancements

Potential additions:

1. **Batch Operations**
   - Delete all generated variations
   - Export only real items
   - Archive generated items

2. **Smart Cleanup**
   - Auto-delete old generated items
   - Keep only recent variations
   - Storage management

3. **Advanced Linking**
   - View all variations of an item
   - Compare real vs generated side-by-side
   - "Make this real" button (if you buy it)

4. **Analytics**
   - Track which variations users prefer
   - Suggest purchases based on generated items
   - Identify wardrobe gaps

---

## Troubleshooting

### Q: I don't see my generated variations

**A:** Check the filter toggle:
- Look for "AI-Generated Items 🤖" section
- Make sure it shows 👁️ (eye open) icon
- Should say "Showing AI-Generated"

### Q: Filter toggle doesn't work

**A:** Try these steps:
1. Refresh the page
2. Check browser console for errors
3. Verify migration was applied
4. Clear browser cache

### Q: All items marked as generated

**A:** Run this to fix:
```sql
UPDATE items SET is_generated = false WHERE is_generated = true;
```
(Only if you haven't actually generated any items yet)

### Q: Can I bulk delete generated items?

**A:** Currently manual. Future enhancement planned.

---

## Summary

**Problem:** User wanted to see only real clothes, not AI-generated variations

**Solution:** Added filter that defaults to showing only real wardrobe items

**Result:** 
- ✅ Clean, uncluttered default view
- ✅ Optional exploration mode
- ✅ ADHD-friendly by default
- ✅ Zero breaking changes

**Status:** ✅ **Fully Implemented and Working**

---

## Support

For issues or questions:
1. Check this documentation
2. Review troubleshooting section
3. Check GitHub issues
4. Contact maintainers

**Documentation Last Updated:** January 31, 2026
