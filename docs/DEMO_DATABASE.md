# Realistic Demo Database - Documentation

## Overview

The demo database seed creates **284 items** for a realistic wardrobe demonstration. This provides enough variety and volume to showcase all app features in a believable way.

## Quick Start

```bash
cd app
npm run prisma:seed:demo
```

This will:
1. Clear existing data
2. Create 284 diverse wardrobe items
3. Create 15 organizational tags
4. Create 3 sample outfits

## Database Contents

### Total Records
- **284 Items** across 13 categories
- **15 Tags** for organization
- **3 Outfits** with different ratings

### Items by Category

| Category | Count | Examples |
|----------|-------|----------|
| **Tops** | 44 | T-shirts, blouses, sweaters, hoodies in 15+ colors |
| **Bottoms** | 36 | Jeans, pants, shorts, skirts in various styles |
| **Shoes** | 35 | Sneakers, boots, heels, flats, sandals |
| **Accessories** | 25 | Bags, hats, belts, scarves, sunglasses |
| **Activewear** | 22 | Leggings, sports bras, athletic shorts |
| **Dresses** | 21 | Maxi, mini, midi, wrap, bodycon styles |
| **Outerwear** | 19 | Jackets, coats, blazers, cardigans |
| **Jewelry** | 18 | Necklaces, earrings, bracelets, rings |
| **Loungewear** | 16 | Hoodies, sweatpants, cozy sets |
| **Underwear/Bras** | 12 | Various colors and sizes, includes tucking underwear and bras with removable pads |
| **Suits/Sets** | 12 | Two-piece, three-piece, co-ord sets |
| **Sleepwear** | 12 | Pajama sets, nightgowns |
| **Swimwear** | 12 | One-pieces, bikinis, tankinis |

### Items by State

| State | Count | Description |
|-------|-------|-------------|
| **Available** | 266 | Ready to wear |
| **Laundry** | 9 | In wash or needs washing |
| **Unavailable** | 7 | In storage or borrowed |
| **Donate** | 2 | Marked for donation |

## Features Included

### Variety & Realism
- ✅ **15+ colors** - Black, white, gray, navy, red, blue, green, pink, purple, yellow, orange, etc.
- ✅ **30+ brands** - Mix of fast fashion (H&M, Zara), mid-range (J.Crew, Madewell), athletic (Nike, Adidas), and indie/thrift
- ✅ **All sizes** - XS through XXL for clothing, shoe sizes 6-11
- ✅ **Multiple variations** - Same item in different colors/sizes to simulate real wardrobe

### Different States
- ✅ Items in laundry
- ✅ Items marked for donation
- ✅ Seasonal items in storage
- ✅ Items with different clean statuses

### Storage Types
- ✅ Hanging (jackets, dresses, suits)
- ✅ Folded (t-shirts, sweaters)
- ✅ Drawer (underwear, socks, activewear)
- ✅ Shelf (shoes, bags)
- ✅ Box (seasonal storage)

### Licensed Merchandise
- ✅ Movie merch (Star Wars)
- ✅ TV show merch (Friends)
- ✅ Game merch (Zelda)
- ✅ Anime merch (Naruto)

### Specialized Underwear/Bra Attributes
- ✅ **Tucking support** - 2 underwear items with tucking functionality (TomboyX brand)
- ✅ **Removable pads** - 4 bras with removable pad pockets (Target brand)
- ✅ **No removable pads** - 2 bras explicitly without pad pockets (Victoria's Secret)

See [UNDERWEAR_BRA_ATTRIBUTES.md](./UNDERWEAR_BRA_ATTRIBUTES.md) for detailed documentation.

### Tags for Organization
- favorite
- workwear
- casual
- formal
- vintage
- comfortable
- dressy
- everyday
- special-occasion
- summer, winter, spring, fall
- confidence-boost
- needs-repair

### Sample Outfits
1. **Casual Day Look** (rated UP)
2. **Work Outfit** (rated NEUTRAL)
3. **Date Night** (rated UP)

## Answering the "Multiple Categories" Question

**Q: Can items have multiple categories?**

**A: No, items have ONE primary category.**

Based on the Prisma schema, the `category` field is a single enum value, not an array:

```typescript
category: Category?  // Single value, not Category[]
```

**However**, items can be *multi-purpose* in real life:
- A dress could be worn for work OR going out → categorized as 'dresses'
- Athletic leggings could be worn casually → categorized as 'activewear'
- A blazer could be work OR dressy → categorized as 'outerwear'

The category represents the **primary function**, but tags can be used to indicate secondary uses:
- Tag a dress as "workwear" AND "date-night"
- Tag leggings as "casual" AND "activewear"

## Use Cases for Demo

This realistic dataset is perfect for demonstrating:

### 1. **Browsing & Filtering**
- Browse by category with substantial variety
- Filter by color, brand, size
- Search functionality with many results

### 2. **Outfit Creation**
- Mix and match from diverse items
- Create outfits for different occasions
- Test outfit rating system

### 3. **Organization Features**
- Tag items for easy finding
- Track laundry and cleaning
- Manage storage locations

### 4. **Wardrobe Management**
- See which categories need more items
- Identify rarely-worn items
- Plan seasonal rotation

### 5. **ADHD-Optimized Features**
- Test "Panic Pick" with variety
- Browse recent items
- Quick search with many matches

## Comparison with Other Seeds

| Seed Command | Items | Purpose |
|--------------|-------|---------|
| `npm run prisma:seed` | 53 | Basic coverage of all categories |
| `npm run prisma:seed:full` | 71 | Comprehensive test scenarios |
| `npm run prisma:seed:demo` | **284** | **Realistic wardrobe for demos** |

## Customization

To adjust the demo seed:

1. Edit `/app/prisma/seed-demo.ts`
2. Modify quantities in each category section
3. Add/remove brands, colors, or styles
4. Run `npm run prisma:seed:demo` again

## Performance

Seeding 284 items takes approximately **45-60 seconds** depending on database connection speed.

## Notes for Presenters

When demoing the app:
- ✅ You have enough items to show realistic browsing
- ✅ Multiple colors/styles show variety
- ✅ Different states demonstrate lifecycle features
- ✅ Licensed merch showcases franchise tracking
- ✅ Tags demonstrate organization
- ✅ Outfits show the styling feature

The database size is realistic for someone who:
- Has been using the app for 3-6 months
- Regularly adds new purchases
- Has a moderate to large wardrobe
- Uses multiple categories regularly
