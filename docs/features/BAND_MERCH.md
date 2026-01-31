# Band Merch & Licensed Product Support

Track and filter band merchandise and licensed products in ADHD-Closet.

## What's Supported

- Band Merch - Concert tees, tour hoodies, band accessories
- Movie Merch - Character shirts, franchise hoodies, themed accessories
- TV Show Merch - Show-branded clothing and accessories
- Game Merch - Video game character apparel and accessories
- Anime Merch - Anime character clothing and accessories
- Comic Merch - Superhero and comic book themed items
- Sports Merch - Team jerseys, fan gear, sports apparel
- Brand Items - Fashion/lifestyle brands with prominent branding

---

## Features

### 1. AI Auto-Detection

The vision AI automatically detects:
- Band logos and names
- Movie/TV show characters
- Game graphics and logos
- Anime characters and symbols
- Sports team logos
- Brand logos and branding

**Example:**
```
Photo of t-shirt with "My Chemical Romance" logo
→ AI detects: franchise="My Chemical Romance", franchiseType="band"
```

### 2. Filtering & Search

**Filter by Franchise Type:**
- Show only band merch
- Show only movie/TV merch
- Show only game merch
- Mix and match multiple types

**Search Specific Franchises:**
- Search "Slipknot" to find all Slipknot merch
- Search "Star Wars" to find all Star Wars items
- Search "Zelda" to find all Legend of Zelda items

**Licensed Merch Only Toggle:**
- One-click filter to show only licensed merchandise
- Hide generic/non-branded items

### 3. Visual Display Badges

Items show franchise badges with:
- Franchise name ("My Chemical Romance")
- Type icon (🎸 for band, 🎬 for movie, etc.)
- Color-coded by type

**Badge Variants:**
- Standard - Full franchise name with icon
- Compact - Icon only for small spaces
- List - Multiple franchises in a grid

---

## Database Schema

### Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| **isLicensedMerch** | Boolean | Is this licensed merchandise? | `true`, `false` |
| **franchise** | String | Specific franchise name | "My Chemical Romance" |
| **franchiseType** | Enum | Type of franchise | `band`, `movie`, `tv_show`, etc. |

### Franchise Types

| Type | Description | Examples |
|------|-------------|----------|
| **band** | Music groups/artists | My Chemical Romance, Metallica, BTS |
| **movie** | Films | Star Wars, Marvel, Harry Potter |
| **tv_show** | TV series | Stranger Things, The Mandalorian, Friends |
| **game** | Video games | The Legend of Zelda, Minecraft, Pokemon |
| **anime** | Anime series | Naruto, Attack on Titan, Sailor Moon |
| **comic** | Comic books/manga | Marvel, DC, Demon Slayer |
| **sports** | Sports teams | Manchester United, Lakers, Yankees |
| **brand** | Fashion brands | Supreme, Nike, Adidas (with prominent branding) |
| **other** | Other licensed | Any other licensed content |

---

## Usage Examples

### Band T-Shirt Collection

**Items:**
- Black t-shirt with Slipknot logo and tour dates
- White t-shirt with My Chemical Romance artwork
- Red hoodie with Metallica "Master of Puppets" design

**How to Track:**
1. Upload photos (AI auto-detects franchise)
2. Confirm/edit franchise details
3. Filter by `franchiseType: band` to see all band merch
4. Search "Slipknot" to find specific band items

**Result:**
All band merch in one place. Easy outfit planning with favorite bands.

### Movie/TV Collection

**Items:**
- Hoodie with Baby Yoda/Grogu from The Mandalorian
- T-shirt with Marvel Avengers logo
- Socks with Harry Potter house crests

**How to Track:**
1. AI detects characters/logos automatically
2. Sets franchiseType to `tv_show` or `movie`
3. Filter by franchise type to see all movie/TV merch
4. Search specific franchise ("Star Wars")

**Result:**
Organized by franchise. Easy themed outfit creation.

### Game Merch

**Items:**
- T-shirt with Mario and Luigi
- Hoodie with Legend of Zelda Triforce
- Hat with Pokemon characters

**How to Track:**
1. AI recognizes game characters/logos
2. Sets franchiseType to `game`
3. Browse all game merch in one view
4. Filter by specific game series

**Result:**
Gaming wardrobe organized. Easy to find gaming-themed outfits.

---

## AI Detection

### What AI Looks For

**Band Merch:**
- Band logos and wordmarks
- Band member images
- Tour dates and locations
- Album artwork
- Concert/festival graphics

**Movie/TV Merch:**
- Character images and silhouettes
- Show/movie logos and titles
- Iconic symbols (Deathly Hallows, Triforce)
- Character catchphrases
- Production company logos

**Game Merch:**
- Game character sprites/artwork
- Game logos and titles
- In-game items and symbols
- Gaming controller graphics
- Game franchise symbols

**Anime/Comic Merch:**
- Character artwork
- Series logos and titles
- Iconic symbols (Sharingan, Captain America shield)
- Japanese text for anime
- Comic book style graphics

**Sports Merch:**
- Team logos and names
- Player numbers and names
- League logos
- Team colors and patterns
- Mascot images

### Confidence Scoring

AI provides confidence scores:
- Franchise detection (0-1)
- Franchise name accuracy (0-1)
- Franchise type classification (0-1)

High confidence (0.9+): Clear, prominent branding
Medium confidence (0.7-0.9): Visible but subtle branding
Low confidence (<0.7): Uncertain or generic design

---

## Filtering

### In FilterPanel Component

**Licensed Merch Only:**
```tsx
☑️ Licensed Merch Only
```
One-click toggle. Shows only items with `isLicensedMerch: true`. Hides all generic items.

**Franchise Search:**
```tsx
🔍 Search franchises... (e.g., 'Slipknot')
```
Search specific band/movie/game names. Partial matching ("star" finds "Star Wars"). Case-insensitive.

**Franchise Type Filters:**
```tsx
🎸 Band Merch
🎬 Movies
📺 TV Shows
🎮 Video Games
⚡ Anime
💥 Comics
⚽ Sports Teams
🏷️ Brands
🌟 Other
```
Click any to filter by type. Multiple types can be selected. Combined with other filters.

### Filter Examples

**All Band T-Shirts:**
1. Select Category: "Tops"
2. Select Franchise Type: "Band Merch"
Result: Only band t-shirts

**Specific Band in Hoodies:**
1. Select Category: "Outerwear"
2. Search: "My Chemical Romance"
Result: Only MCR hoodies

**All Licensed Merch Ready to Wear:**
1. Toggle "Licensed Merch Only"
2. Select State: "Available"
3. Select Clean Status: "Clean"
Result: All clean, available licensed merch

---

## Component Usage

### FranchiseBadge

Display franchise info on item cards:

```tsx
import FranchiseBadge from '@/app/components/FranchiseBadge';

<FranchiseBadge 
  franchise="My Chemical Romance"
  franchiseType="band"
  isLicensedMerch={true}
  size="md"
/>
```

**Variants:**

```tsx
// Compact (icon only)
import { FranchiseBadgeCompact } from '@/app/components/FranchiseBadge';

<FranchiseBadgeCompact 
  franchise="Star Wars"
  franchiseType="movie"
/>

// List (multiple franchises)
import { FranchiseBadgeList } from '@/app/components/FranchiseBadge';

<FranchiseBadgeList 
  franchises={[
    { franchise: "Slipknot", franchiseType: "band" },
    { franchise: "Star Wars", franchiseType: "movie" }
  ]}
/>
```

### FilterPanel

Integrated franchise filtering:

```tsx
<FilterPanel
  onFilterChange={(filters) => {
    // filters includes:
    // - franchiseTypes: string[]
    // - franchiseSearch: string
    // - licensedMerchOnly: boolean
    // ... plus existing filters
    handleFilters(filters);
  }}
/>
```

---

## Benefits

**For Superfans:**
Track your collection. See all merch from favorite bands/franchises. Create themed outfits easily. Never forget what you have.

**For ADHD Users:**
Filter down to specific franchises. Emoji icons for instant recognition. Quick decisions. Clear organization. No more "I forgot I had this."

**For Everyone:**
AI auto-detection (90% less manual entry). Fast filtering. Visual badges. Flexible search.

---

## Privacy

**Stored:**
- Franchise names ("My Chemical Romance")
- Franchise types ("band", "movie")
- Licensed merchandise flag

**Not Stored:**
- No personal data
- No purchase history
- No external tracking

**User Control:**
- Edit franchise names anytime
- Change franchise types manually
- Remove franchise info if desired

---

## Future Plans

- Franchise statistics (most worn bands/franchises)
- Franchise-based outfit recommendations
- "Complete the Look" by franchise theme
- Franchise wear rotation tracking
- Most worn franchise analytics

---

## Quick Start

1. Upload item photo - AI detects franchise automatically
2. Review detection - confirm or edit franchise name/type
3. Filter your collection - use FilterPanel to find specific franchises
4. Create outfits - mix and match franchise merch
5. Track favorites - see which franchises you wear most

---

## Troubleshooting

**AI Not Detecting Franchise?**
Ensure logo/branding is clearly visible. Try retaking photo with better lighting. Manually add franchise in item details.

**Wrong Franchise Detected?**
Edit item details. Correct franchise name and type. AI learns from corrections.

**Can't Find Specific Franchise?**
Use franchise search in FilterPanel. Check spelling. Try broader search ("star" instead of "Star Wars").

---

## Examples Gallery

### Band Merch
- My Chemical Romance tour t-shirt → `band`
- Metallica "Ride the Lightning" hoodie → `band`
- BTS concert tee → `band`

### Movie/TV Merch
- Baby Yoda hoodie → `tv_show: "The Mandalorian"`
- Harry Potter house t-shirt → `movie: "Harry Potter"`
- Marvel Avengers shirt → `movie: "Marvel"`

### Game Merch
- Mario and Luigi t-shirt → `game: "Super Mario Bros"`
- Legend of Zelda Triforce hoodie → `game: "The Legend of Zelda"`
- Pokemon Pikachu shirt → `game: "Pokemon"`

### Anime Merch
- Naruto Sharingan t-shirt → `anime: "Naruto"`
- Attack on Titan Survey Corps jacket → `anime: "Attack on Titan"`
- Sailor Moon shirt → `anime: "Sailor Moon"`

---

Track your fandom, organize your wardrobe. 🎸🎬🎮
