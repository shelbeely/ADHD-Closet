# Categories Reference Guide

## Overview

This document provides a comprehensive reference for all categories and sub-categories available in the ADHD-Closet wardrobe management system.

---

## Main Categories

The application supports **8 main categories** for organizing wardrobe items:

### 1. 👕 Tops
**Database value:** `tops`

Items worn on the upper body.

**Examples:**
- T-shirts
- Shirts
- Blouses
- Sweaters
- Tank tops
- Crop tops
- Hoodies (casual)

**Attributes tracked:**
- Neckline (crew, v-neck, scoop, boat, square, halter, off-shoulder, turtleneck)
- Sleeve length (sleeveless, short, 3/4, long)
- Sleeve fit (fitted, loose, puff, bell)
- Visual weight (minimal, moderate, heavy, complex)
- Silhouette (fitted, loose, oversized, boxy)

---

### 2. 👖 Bottoms
**Database value:** `bottoms`

Items worn on the lower body.

**Examples:**
- Jeans
- Pants
- Shorts
- Skirts
- Leggings

**Attributes tracked:**
- Rise (low, mid, high)
- Inseam
- Fit (skinny, slim, straight, wide, bootcut, flare)
- Hemline (raw, cuffed, distressed)
- Visual weight (minimal, moderate, heavy)
- Pocket style

---

### 3. 👗 Dresses
**Database value:** `dresses`

One-piece garments.

**Examples:**
- Casual dresses
- Formal dresses
- Maxi dresses
- Mini dresses
- Midi dresses
- Sundresses

**Attributes tracked:**
- Neckline
- Sleeve length
- Waistline (natural, empire, dropped, none)
- Hemline
- Silhouette (fitted, A-line, shift, bodycon, flowy)

---

### 4. 🧥 Outerwear
**Database value:** `outerwear`

Outer layers and jackets.

**Examples:**
- Jackets
- Coats
- Blazers
- Cardigans
- Hoodies (heavier)
- Vests

**Attributes tracked:**
- Silhouette
- Length (cropped, hip, mid-thigh, knee, long)
- Visual weight

---

### 5. 👟 Shoes
**Database value:** `shoes`

Footwear of all types.

**Sub-categories available:**
- 👟 **Sneakers** - Athletic and casual sneakers
- 🥾 **Boots** - All types of boots
- 🩴 **Sandals** - Open-toed footwear
- 👠 **Heels** - High heels and wedges
- **Flats** - Flat shoes, loafers
- **Loafers** - Slip-on shoes
- **Oxfords** - Lace-up dress shoes
- **Platforms** - Platform shoes

**Attributes tracked:**
- Heel height
- Heel thickness (none, slim, chunky, wedge)
- Toebox shape (rounded, almond, pointed, square)
- Visual weight (minimal, moderate, heavy)
- Shoe type (from sub-category)

---

### 6. 🎒 Accessories
**Database value:** `accessories`

Bags, belts, and other accessories (excluding jewelry).

**Sub-categories available:**
- 👜 **Purse** - Small handbags
- 🎒 **Bag** - General bags
- 🎒 **Backpack** - Backpacks
- 👔 **Belt** - Belts
- 🎩 **Hat** - Hats and caps
- 🧣 **Scarf** - Scarves and wraps
- **Gloves** - Gloves and mittens
- **Sunglasses** - Sunglasses
- **Watch** - Watches
- **Other** - Miscellaneous accessories

**Attributes tracked:**
- Accessory type (from sub-category)
- Size (small, medium, large)
- Material
- Structure (structured, unstructured, semi-structured)
- Visual weight (minimal, moderate, heavy)
- Occasion (casual, formal, both)

---

### 7. 🩲 Underwear & Bras
**Database value:** `underwear_bras`

Undergarments and intimates.

**Examples:**
- Bras
- Underwear
- Shapewear
- Undershirts
- Socks
- Tights

**Note:** This category is typically private and may have special visibility settings.

---

### 8. 💍 Jewelry
**Database value:** `jewelry`

Decorative accessories worn on the body.

**Sub-categories available:**
- 📿 **Necklace** - Necklaces and chains
- 💎 **Earrings** - All types of earrings
- 📿 **Bracelet** - Bracelets and bangles
- 💍 **Ring** - Rings
- **Anklet** - Ankle bracelets
- **Brooch** - Pins and brooches
- **Other** - Miscellaneous jewelry

**Attributes tracked:**
- Jewelry type (from sub-category)
- Metal (gold, silver, rose gold, bronze, mixed, none)
- Gemstones (yes/no)
- Style (delicate, statement, chunky, minimalist)
- Occasion (everyday, formal, special)

---

## Complete Category Hierarchy

```
📦 ADHD-Closet Categories
│
├── 👕 Tops
├── 👖 Bottoms
├── 👗 Dresses
├── 🧥 Outerwear
│
├── 👟 Shoes
│   ├── 👟 Sneakers
│   ├── 🥾 Boots
│   ├── 🩴 Sandals
│   ├── 👠 Heels
│   ├── Flats
│   ├── Loafers
│   ├── Oxfords
│   └── Platforms
│
├── 🎒 Accessories
│   ├── 👜 Purse
│   ├── 🎒 Bag
│   ├── 🎒 Backpack
│   ├── 👔 Belt
│   ├── 🎩 Hat
│   ├── 🧣 Scarf
│   ├── Gloves
│   ├── Sunglasses
│   ├── Watch
│   └── Other
│
├── 🩲 Underwear & Bras
│
└── 💍 Jewelry
    ├── 📿 Necklace
    ├── 💎 Earrings
    ├── 📿 Bracelet
    ├── 💍 Ring
    ├── Anklet
    ├── Brooch
    └── Other
```

---

## Usage in the Application

### Database Schema

Categories are defined as enums in the Prisma schema (`prisma/schema.prisma`):

```prisma
enum Category {
  tops
  bottoms
  dresses
  outerwear
  shoes
  accessories
  underwear_bras
  jewelry
}

enum AccessoryType {
  purse
  bag
  backpack
  belt
  hat
  scarf
  gloves
  sunglasses
  watch
  other
}

enum JewelryType {
  necklace
  earrings
  bracelet
  ring
  anklet
  brooch
  other
}

enum ShoeType {
  sneakers
  boots
  sandals
  heels
  flats
  loafers
  oxfords
  platforms
  other
}
```

### UI Components

Categories are displayed in the UI through:

1. **CategoryTabs** (`components/CategoryTabs.tsx`)
   - Basic category navigation
   - Shows all 8 main categories with icons

2. **CategoryTabsEnhanced** (`components/CategoryTabsEnhanced.tsx`)
   - Advanced navigation with sub-categories
   - Progressive disclosure (sub-categories appear when main category selected)
   - Sub-categories for: accessories, jewelry, shoes

### Filtering & Organization

Users can:
- **Browse by category** - Click category tabs to filter items
- **Browse by sub-category** - Select shoes → sneakers to see only sneakers
- **Search across categories** - Use the search bar to find items regardless of category
- **Multi-category outfits** - Outfit generator considers all categories

---

## Category Selection Guidelines

### When adding a new item, choose the category based on:

1. **Primary function** - What is the item's main purpose?
2. **How you wear it** - Where does it go on your body?
3. **When you use it** - Is it an everyday item or special occasion?

### Common Questions:

**Q: Where do hoodies go?**
- **Casual/thin hoodie** → Tops
- **Heavy/jacket-style hoodie** → Outerwear

**Q: Where do joggers go?**
- **Bottoms** (they're pants)

**Q: Where do tights go?**
- **Underwear & Bras** (undergarments)

**Q: Where do watches go?**
- **Accessories** (not jewelry, as they're functional)

**Q: What about costume jewelry vs. fine jewelry?**
- **Both** → Jewelry (category doesn't distinguish value)

---

## AI Integration

### Automatic Category Detection

The AI inference system can automatically detect categories from photos:

```typescript
// Example AI response
{
  "category": "tops",
  "subType": null,  // No sub-type for tops
  "colors": ["black", "white"],
  "attributes": {
    "neckline": "crew",
    "sleeveLength": "short"
  }
}

// Example with sub-type
{
  "category": "accessories",
  "subType": "purse",
  "colors": ["brown"],
  "attributes": {
    "accessoryType": "purse",
    "size": "medium"
  }
}
```

### Category-Specific AI Prompts

The AI uses different analysis approaches for each category:
- **Tops/Bottoms** - Focus on fit, style, necklines
- **Shoes** - Analyze heel, toe shape, formality
- **Accessories** - Determine function and occasion
- **Jewelry** - Identify type, materials, style

---

## ADHD-Friendly Category Design

The category system is designed with ADHD users in mind:

### 1. **Limited Options**
- Only 8 main categories (not overwhelming)
- Sub-categories hidden until needed (progressive disclosure)

### 2. **Visual Icons**
- Each category has a clear emoji icon
- Quick visual recognition without reading

### 3. **Intuitive Organization**
- Categories match how people naturally think about clothes
- Based on body location (tops, bottoms) and function (outerwear)

### 4. **Smart Defaults**
- AI suggests category automatically
- Reduces decision-making burden

### 5. **Flexible Sub-Categories**
- Optional granularity for those who want it
- Can ignore sub-categories if they add too much complexity

---

## Future Enhancements

Potential category improvements in future versions:

1. **Custom Categories**
   - User-defined categories (e.g., "Costumes", "Vintage")
   - Requires database schema update

2. **Category Collections**
   - Group items across categories (e.g., "Work Wardrobe")
   - Virtual folders without changing item category

3. **Smart Category Suggestions**
   - AI learns your categorization preferences
   - Suggests corrections for miscategorized items

4. **Category Analytics**
   - Show most/least worn categories
   - Identify category gaps in wardrobe

---

## Technical Reference

### API Endpoints

```typescript
// Get items by category
GET /api/items?category=tops

// Get items by category and sub-category
GET /api/items?category=accessories&subType=purse

// Get category statistics
GET /api/stats?groupBy=category
```

### Database Queries

```typescript
// Find all shoes
const shoes = await prisma.item.findMany({
  where: { category: 'shoes' }
});

// Find all sneakers specifically
const sneakers = await prisma.item.findMany({
  where: { 
    category: 'shoes',
    shoeType: 'sneakers'
  }
});

// Count items per category
const counts = await prisma.item.groupBy({
  by: ['category'],
  _count: { category: true }
});
```

---

## Summary

**Total Categories:**
- 8 main categories
- 10 accessory sub-types
- 7 jewelry sub-types
- 9 shoe sub-types
- **34 total classification options**

**Design Philosophy:**
- Simple by default (8 categories)
- Detailed when needed (sub-types)
- ADHD-friendly (visual, intuitive, progressive disclosure)
- AI-enhanced (automatic detection)

---

## See Also

- `SPEC.md` - ADHD-friendly UX design principles
- `OUI_IMPLEMENTATION.md` - Smart suggestions using categories
- `ADVANCED_OUI_FEATURES.md` - Seasonal and style recommendations
- `FAQ.md` - Common questions about the app

---

**Last Updated:** 2026-01-31  
**Version:** Current as of v2.0 (Advanced OUI)
