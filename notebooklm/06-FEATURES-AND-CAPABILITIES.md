# Wardrobe AI Closet - Features and Capabilities

## Core Features Overview

This document provides a comprehensive guide to all features and capabilities of Wardrobe AI Closet, organized by user workflow and use case.

## Photo-Based Inventory Management

### Quick Item Capture

**Time to add item**: ~30 seconds

The app is optimized for rapid item entry with minimal friction:

1. **Take or upload photo** - Front photo required, back photo optional
2. **Auto-save** - Item created immediately
3. **AI processing begins** - Catalog generation and categorization run in background
4. **Review and refine** - Add details later at your pace

**Photo Types Supported**:
- **Front (Main)**: Primary photo showing front of garment
- **Back**: Back view (especially important for interesting back designs)
- **Details**: Close-ups of embroidery, buttons, texture, etc.
- **Label Photos**:
  - Brand label (for brand/size/material extraction)
  - Care instructions label

**Image Format Support**:
- JPEG, PNG, WebP, HEIC
- Maximum size: 50MB per image
- Recommended: 1024x1024 or higher resolution

### Side-by-Side View

Items with both front and back photos display in a split view:

![Example of side-by-side view](https://raw.githubusercontent.com/shelbeely/ADHD-Closet/main/docs/screenshots/main-mobile-view.png)

- Left half: Front photo with "Front" label
- Right half: Back photo with "Back" label
- Vertical divider for clear separation
- No interaction needed - both views visible simultaneously

**ADHD Optimization**: See complete context at once without flipping or tapping.

### Progressive Photo Addition

Start minimal, add more later:

```
Add Item Flow:
1. Upload front photo → Item created ✓
2. (Optional) Add back photo
3. (Optional) Add label photos
4. (Optional) Add detail photos
5. All can be added/edited anytime from item page
```

## AI-Powered Enhancements

### Catalog Image Generation

Transform real photos into professional catalog-style images.

**Input**: Original photo (casual, messy background, any angle)  
**Output**: Clean, centered, professional catalog image

**AI Model**: `black-forest-labs/flux-1.1-pro` (via OpenRouter)  
**Processing Time**: ~10-30 seconds  
**Cost**: ~$0.04 per image

**Features**:
- Square format (1024x1024)
- Centered garment with consistent padding
- Neutral background (white or light gray)
- Preserves colors and graphic details
- No text or watermarks

**Generates For**:
- Front photo → Front catalog image
- Back photo → Back catalog image (optional)

**Reference**: [Image Generation Documentation](https://shelbeely.github.io/ADHD-Closet/features/IMAGE_GENERATION/)

### Smart Categorization

AI automatically detects item attributes from photos.

**AI Model**: `google/gemini-2.0-flash-exp:free` (vision)  
**Processing Time**: ~5-15 seconds  
**Cost**: ~$0.01 per analysis

**Detects**:
- **Category**: tops, bottoms, dresses, outerwear, shoes, accessories, etc.
- **Colors**: Named colors + hex color palette
- **Pattern**: solid, striped, graphic, floral, etc.
- **Attributes** (category-specific):
  - Tops: neckline, sleeve length, fit
  - Bottoms: rise, inseam, leg style
  - Shoes: heel height, closure type
  - Accessories: type, style
- **Tags**: Style keywords (goth, punk, preppy, etc.)

**Output Example**:
```json
{
  "category": "tops",
  "colors": ["black", "white"],
  "colorPalette": ["#000000", "#FFFFFF", "#333333"],
  "pattern": "graphic",
  "attributes": {
    "neckline": "crew",
    "sleeve_length": "short",
    "fit": "regular"
  },
  "tags": ["goth", "band-tee", "graphic"],
  "confidence": 0.92
}
```

**User Control**: All AI suggestions can be reviewed and edited before accepting.

**Reference**: [Vision Model Guide](https://shelbeely.github.io/ADHD-Closet/features/VISION_MODEL_GUIDE/)

### Label Extraction (OCR)

Extract text from label photos for brand, size, and materials.

**AI Model**: `google/gemini-2.0-flash-exp:free` (vision + OCR)  
**Processing Time**: ~5-10 seconds

**Extracts**:
- Brand name
- Size information
- Material composition (e.g., "100% Cotton")
- Care instructions (e.g., "Machine wash cold")

**Confidence Scores**: Shows reliability of extraction so you can verify.

### Licensed Merchandise Tracking

Special support for band merch and licensed products.

**Fields**:
- `isLicensedMerch`: Boolean flag
- `franchise`: Band name, movie title, game name, etc.
- `franchiseType`: band, movie, tv_show, game, anime, comic, sports, brand, other

**Use Cases**:
- Track band merch collection
- Organize by franchise
- Find all items from specific band/show
- Analyze spending on merch

**Reference**: [Band Merch Features](https://shelbeely.github.io/ADHD-Closet/features/BAND_MERCH/)

## Outfit Generation

### Panic Pick

**The Problem**: Need to leave NOW, no time to think.

**The Solution**: One-button instant outfit generation.

```
User clicks "Panic Pick"
  ↓
AI selects outfit in <5 seconds
  ↓
Display outfit with items
  ↓
User can accept or try again
```

**No decisions required**. No constraints to set. Just instant outfit.

![Outfit Generator](https://raw.githubusercontent.com/shelbeely/ADHD-Closet/main/docs/screenshots/outfits-generate-mobile.png)

### Constraint-Based Generation

For when you have 15+ minutes and specific needs:

**Weather Constraints**:
- Hot (90°F+)
- Warm (70-89°F)
- Cool (50-69°F)
- Cold (<50°F)
- Rain
- Snow

**Mood/Vibe Constraints**:
- Dysphoria-safe (comfortable, low-stress)
- Confidence boost (power outfit)
- Dopamine hit (exciting, bold)
- Neutral (standard comfort)

**Time Available**:
- Quick (5 min) - Easy to put on
- Normal (15+ min) - Can take time with accessories

**Occasion** (optional):
- Work
- Date
- Concert/event
- Errands
- Staying home

**AI Processing**:
- Model: `google/gemini-2.0-flash-exp:free`
- Time: ~10-20 seconds
- Returns: 1-3 ranked outfit options

**Outfit Response Includes**:
- Item combinations with roles (top, bottom, shoes, etc.)
- Explanation of why items work together
- Swap suggestions (alternative pieces)
- Confidence score

**Rating System**: Rate outfits up/down/neutral to improve future suggestions.

### Fit & Proportion Guide Integration

Built-in styling guide helps understand what works:

![Fit Guide](https://raw.githubusercontent.com/shelbeely/ADHD-Closet/main/docs/screenshots/guide-page-mobile.png)

**Topics Covered**:
- Body proportions
- Balance and silhouettes
- Necklines for different face shapes
- Sleeve lengths
- Rise and inseam
- Layering principles
- Color theory basics

**Reference**: [OUI Guide](https://shelbeely.github.io/ADHD-Closet/features/OUI_GUIDE/)

## Organization Features

### Category-First Navigation

**Mobile Navigation** (<1024px):
Primary navigation by category for cognitive load reduction.

**Categories**:
1. Tops
2. Bottoms
3. Dresses
4. Outerwear
5. Shoes
6. Accessories
7. Underwear/Bras
8. Jewelry
9. Swimwear
10. Activewear
11. Sleepwear
12. Loungewear
13. Suits/Sets

**Subcategories** (when needed):
- Accessories: purse, bag, backpack, belt, hat, scarf, gloves, sunglasses, watch
- Jewelry: necklace, earrings, bracelet, ring, anklet, brooch
- Shoes: sneakers, boots, sandals, heels, flats, loafers, oxfords, platforms
- Bottoms: jeans, dress pants, casual pants, cargo pants, shorts, skirt, leggings, joggers

**Reference**: [Categories Documentation](https://shelbeely.github.io/ADHD-Closet/features/CATEGORIES/)

### Tag System

Flexible, user-defined tags for cross-category organization.

**Features**:
- Global tag pool (reusable across items)
- Auto-suggest from AI
- Tag popularity counts
- Multi-tag filtering
- Easy global rename

**Example Tags**:
- Style: goth, punk, preppy, casual, formal
- Comfort: comfy, itchy, stiff, breathable
- Occasion: work, date, concert, gym
- State: favorite, needs-repair, too-small
- Color: all-black, colorful, neutrals

### State Tracking

Track item availability and lifecycle:

**States**:
- **Available**: Ready to wear
- **Laundry**: In laundry basket or being washed
- **Unavailable**: Packed away, at cleaners, lent out
- **Donate**: Marked for donation

**Laundry Management**:
- `cleanStatus`: clean, dirty, needs_wash
- `wearsBeforeWash`: How many wears before washing (default 1)
- `currentWears`: Current wear count
- `lastWornDate`: When item was last worn
- `lastWashedDate`: When item was last washed

**Auto-tracking**: Wearing item via outfit increments wear count.

### Physical Location Tracking

Know where items are in your closet:

**Fields**:
- `storageType`: hanging, folded, drawer, shelf, box, other
- `locationInCloset`: Freeform text ("Left side", "Top drawer", "Under bed")
- `sortOrder`: Optional numeric order for organizing

**Use Case**: "Where did I put that shirt?" → Search shows "Hanging, left side, position 5"

## Desktop Power Tools

### Bulk Editing

**Access**: Desktop view (≥1024px)

![Desktop View](https://raw.githubusercontent.com/shelbeely/ADHD-Closet/main/docs/screenshots/main-desktop-empty.png)

**Features**:
- Select multiple items with checkboxes
- Edit common fields in batch
- Apply tags to multiple items
- Change state for multiple items
- Bulk delete (with confirmation)

**Example Use Cases**:
- Mark 10 items as "laundry" at once
- Add "winter" tag to all coats
- Change storage location for full drawer

### Advanced Filtering

**Desktop Sidebar Filters**:
- Multi-category selection
- Multi-state selection
- Tag filtering (AND/OR logic)
- Color filtering
- Brand filtering
- Size filtering
- Custom attribute filtering

**Search Bar**:
- Search title, brand, tags
- Fuzzy matching
- Real-time results
- Clear filters button

### Table View

Alternative to grid for dense information:

**Columns** (sortable):
- Thumbnail
- Title
- Category
- Brand
- Size
- State
- Tags
- Last Worn
- Created Date

**Sorting**: Click column headers to sort

**Row Actions**: Quick edit, view, delete from table

### Keyboard Shortcuts

Power user productivity:

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + K` | Focus search |
| `Ctrl/Cmd + N` | New item |
| `Ctrl/Cmd + S` | Save (auto-save, but works for habits) |
| `Escape` | Close modal/drawer |
| `Tab` | Navigate forward |
| `Shift + Tab` | Navigate backward |
| Arrow keys | Navigate lists |
| `Enter` | Select/open focused item |
| `Space` | Toggle selection (bulk edit) |

## NFC Tag Support

Track items with physical NFC tags on hangers.

**Supported Platforms**:
- Native Android app (via Capacitor)
- Native iOS app (via Capacitor)
- Chrome/Edge on Android (Web NFC API)

**Workflow**:
1. Write NFC tag with item ID
2. Attach tag to hanger
3. Scan tag when removing item from closet
4. Scan tag when returning item to closet

**Tracking**:
- `NFCEvent` logs with timestamp
- Action: "removed" or "returned"
- Optional notes per scan
- Automatic wear count increment

**Use Cases**:
- Track most worn items
- Know when item was last worn
- Laundry scheduling
- Lost item recovery ("Last scanned 3 days ago")

**Reference**: [NFC Tag Support](https://shelbeely.github.io/ADHD-Closet/features/NFC_TAG_SUPPORT/)

## 3D Closet Rail Visualization

**Status**: Planned (Phase 6)

Interactive 3D view of your closet using Three.js.

**Concept**:
- Hanging cards with item thumbnails
- Group by category or collection
- Search highlights matching cards
- Drag from rail to outfit board
- Lazy-load textures for performance

**Technology**:
- Three.js for 3D rendering
- @react-three/fiber for React integration
- @react-three/drei for helpers
- Thumbnail textures (512px max)

**Performance**:
- Instancing for multiple cards
- Lazy texture loading
- Low draw calls
- No expensive post-processing

## Export/Import

### Full Data Backup

**Export Format**: ZIP file

**Contents**:
```
wardrobe-backup-2024-01-27.zip
├── manifest.json           # App version, schema version
├── export.json             # Full data (JSON)
├── items.csv               # Items in CSV
├── outfits.csv             # Outfits in CSV
├── tags.csv                # Tags in CSV
├── images/
│   └── [itemId]/
│       └── [imageId].jpg   # All images
└── thumbs/
    └── [itemId]/
        └── [imageId].webp  # Thumbnails
```

**Features**:
- Complete data export
- All images included
- Multiple formats (JSON, CSV)
- Metadata preserved
- Version tracking

### Import Modes

**Replace Mode**:
- Deletes all existing data
- Imports backup completely
- Clean slate restoration

**Merge Mode**:
- Keeps existing data
- Adds items from backup
- Skips duplicates (by ID)
- Useful for combining wardrobes

**Validation**:
- Schema version check
- Data integrity validation
- File existence verification
- Error reporting

## Analytics (Future)

Planned analytics features:

**Wear Frequency**:
- Most worn items
- Never worn items
- Wear count over time

**Cost Per Wear**:
- Track item cost
- Calculate cost per wear
- ROI on clothing

**Color Analysis**:
- Most common colors in wardrobe
- Color gaps
- Seasonal color distribution

**Category Balance**:
- Item count per category
- Outfit coverage gaps
- Suggested additions

## PWA & Mobile Apps

### Progressive Web App

**Features**:
- Install to home screen
- Offline capability
- Push notifications (future)
- Background sync
- Fast loading with service worker

**Installation**:
- Chrome/Edge: "Install App" prompt
- Safari: "Add to Home Screen"
- Firefox: "Install" button

### Native Apps (Capacitor)

**iOS App**:
- Native camera integration
- File system access
- Share sheet
- Haptic feedback
- Status bar customization

**Android App**:
- Native camera integration
- NFC tag support (Web NFC API)
- File system access
- Share functionality

**Building**:
```bash
npm run build:mobile
npx cap sync
npx cap open ios    # or android
```

**Reference**: [Deployment Guide](https://shelbeely.github.io/ADHD-Closet/deployment/DEPLOYMENT/)

## AI Model Configuration

Flexible AI provider configuration via environment variables.

**Current Optimal Setup**:
```bash
# Image generation
OPENROUTER_IMAGE_MODEL="black-forest-labs/flux-1.1-pro"

# Vision/OCR
OPENROUTER_VISION_MODEL="google/gemini-2.0-flash-exp:free"

# Text generation
OPENROUTER_TEXT_MODEL="google/gemini-2.0-flash-exp:free"
```

**Alternative Models**:
- GPT-4 Vision
- Claude 3 Opus
- DALL-E 3
- Stable Diffusion

**Reference**: [Model Selection Guide](https://shelbeely.github.io/ADHD-Closet/features/MODEL_SELECTION/)

## Advanced OUI Features

OUI (Outfit Understanding Interface) provides intelligent styling assistance.

**Features**:
- Style constraint validation
- Color harmony checking
- Proportion balance analysis
- Weather appropriateness
- Occasion matching

**Reference**: [Advanced OUI Features](https://shelbeely.github.io/ADHD-Closet/features/ADVANCED_OUI_FEATURES/)

## Attribute System

Comprehensive attribute tracking for detailed item metadata.

**Category-Specific Attributes**:

**Tops**:
- neckline, sleeve_length, fit, closure, hem_style

**Bottoms**:
- rise, inseam, leg_style, closure, waist_type

**Dresses**:
- neckline, sleeve_length, length, silhouette, closure

**Shoes**:
- heel_height, toe_style, closure, sole_type

**Accessories**:
- size, material, closure, hardware

**Reference**: [Attributes Documentation](https://shelbeely.github.io/ADHD-Closet/features/ATTRIBUTES/)

## Privacy & Security

**Data Privacy**:
- All data stored locally on your server
- No third-party analytics
- No tracking pixels
- Images never shared (except to OpenRouter for AI)

**Single-User Design**:
- No authentication complexity
- Assumes trusted network
- For internet: Use reverse proxy with auth

**API Security**:
- Input validation with Zod
- File type validation
- Path traversal protection
- SQL injection protection (Prisma)
- XSS protection (React)

## Performance Budget

**Image Handling**:
- Always use thumbnails in grids (512px WebP)
- Lazy load images in lists
- Stream large files, never buffer

**Lists & Tables**:
- Paginate mobile results
- Virtualize desktop tables if >100 items

**3D Rendering**:
- Use thumbnails as textures (≤512px)
- Lazy-load textures
- Cap simultaneous textures
- Prefer instancing

**AI Jobs**:
- Always background jobs
- Never block UI
- Poll with exponential backoff

## Coming Soon

**Phase 6**: 3D Closet Rail Visualization  
**Phase 7**: Enhanced Export/Import  
**Phase 8**: Polish & Hardening

**Future Features**:
- Embedding-based similarity search
- Virtual try-on (AI)
- Outfit visualization (AI person wearing outfit)
- Style trend analysis
- Wardrobe capsule generator
- Seasonal rotation planning

## External Resources

- [Full Documentation](https://shelbeely.github.io/ADHD-Closet/)
- [GitHub Repository](https://github.com/shelbeely/ADHD-Closet)
- [User Tutorial](https://shelbeely.github.io/ADHD-Closet/user-guides/TUTORIAL/)
- [FAQ](https://shelbeely.github.io/ADHD-Closet/user-guides/FAQ/)
- [Troubleshooting Guide](https://shelbeely.github.io/ADHD-Closet/user-guides/TROUBLESHOOTING/)
