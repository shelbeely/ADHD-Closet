# Twin Style - Database Schema and Data Models

## Database Overview

**Database**: PostgreSQL 16  
**ORM**: Prisma 7.3  
**Schema File**: `app/prisma/schema.prisma`  
**Total Tables**: 11 models with comprehensive relationships

## Entity Relationship Diagram

```
┌─────────────┐
│    Tag      │
│─────────────│
│ id (PK)     │
│ name (UQ)   │
└──────┬──────┘
       │
       │ M:N
       │
┌──────▼──────┐       ┌──────────────┐
│   ItemTag   │       │     Item     │
│─────────────│       │──────────────│
│ itemId (FK) │◄──────┤ id (PK)      │
│ tagId (FK)  │       │ title        │
└─────────────┘       │ category     │
                      │ state        │
                      │ brand        │
                      │ colorPalette │
                      │ attributes   │
                      └──────┬───────┘
                             │
                             │ 1:N
                             │
                      ┌──────▼───────┐
                      │  ImageAsset  │
                      │──────────────│
                      │ id (PK)      │
                      │ itemId (FK)  │
                      │ kind (ENUM)  │
                      │ filePath     │
                      │ width, height│
                      └──────────────┘
                             │
                             │ 1:N
                             │
                      ┌──────▼───────┐
                      │    AIJob     │
                      │──────────────│
                      │ id (PK)      │
                      │ itemId (FK)  │
                      │ type (ENUM)  │
                      │ status       │
                      │ outputJson   │
                      │ error        │
                      └──────────────┘

┌─────────────┐       ┌──────────────┐
│   Outfit    │       │  OutfitItem  │
│─────────────│       │──────────────│
│ id (PK)     │◄──────┤ outfitId (FK)│
│ title       │       │ itemId (FK)  │
│ rating      │       │ role (ENUM)  │
│ weather     │       └──────┬───────┘
│ vibe        │              │
│ explanation │              │
└─────────────┘              │
                      ┌──────▼───────┐
                      │     Item     │
                      │──────────────│
                      │ id (PK)      │
                      └──────────────┘

┌─────────────┐
│   NFCTag    │
│─────────────│
│ id (PK)     │
│ tagId (UQ)  │───┐
│ itemId (FK) │   │
└─────────────┘   │
                  │
┌─────────────┐   │
│  NFCEvent   │   │
│─────────────│   │
│ id (PK)     │   │
│ tagId       │───┘
│ itemId (FK) │
│ action      │
└─────────────┘
```

## Core Models

### 1. Item

The central model representing a single clothing or accessory item.

```prisma
model Item {
  id            String     @id @default(uuid())
  title         String?
  category      Category?
  state         ItemState  @default(available)
  
  // Sub-type categorization
  accessoryType AccessoryType?
  jewelryType   JewelryType?
  shoeType      ShoeType?
  bottomsType   BottomsType?
  
  // Label/brand info (from AI OCR)
  brand         String?
  sizeText      String?
  materials     String?
  
  // Licensed merchandise tracking
  isLicensedMerch Boolean?
  franchise       String?
  franchiseType   FranchiseType?
  
  // AI-generated variations tracking
  isGenerated     Boolean   @default(false)
  sourceItemId    String?
  generationType  String?
  
  // AI-inferred attributes
  colorPalette  Json?      // ["#FF0000", "#000000"]
  attributes    Json?      // { "neckline": "crew", ... }
  
  // Clean/wear tracking
  cleanStatus      CleanStatus @default(clean)
  wearsBeforeWash  Int         @default(1)
  currentWears     Int         @default(0)
  lastWornDate     DateTime?
  lastWashedDate   DateTime?
  
  // Physical location
  storageType      StorageType?
  locationInCloset String?
  sortOrder        Int?
  
  // Relationships
  images        ImageAsset[]
  tags          ItemTag[]
  outfitItems   OutfitItem[]
  aiJobs        AIJob[]
  nfcTag        NFCTag?
  nfcEvents     NFCEvent[]
  
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
}
```

**Key Features**:
- UUID primary key for global uniqueness
- Optional title (can be auto-generated from attributes)
- Flexible category and sub-type system
- AI-inferred color palette and attributes stored as JSON
- Wear and wash tracking for laundry management
- Physical location tracking for closet organization
- Support for both real items and AI-generated variations
- Licensed merchandise tracking for band merch collectors

### 2. ImageAsset

Stores metadata for all images associated with items.

```prisma
model ImageAsset {
  id          String     @id @default(uuid())
  itemId      String
  item        Item       @relation(fields: [itemId], references: [id], onDelete: Cascade)
  
  kind        ImageKind
  filePath    String     // relative to DATA_DIR
  width       Int?
  height      Int?
  mimeType    String?
  
  createdAt   DateTime   @default(now())
  
  @@index([itemId])
  @@index([kind])
}
```

**Image Kinds**:
- `original_main`: Front photo of item
- `original_back`: Back photo of item
- `label_brand`: Photo of brand label
- `label_care`: Photo of care instructions label
- `detail`: Close-up detail photos
- `ai_catalog`: AI-generated catalog image
- `thumbnail`: Optimized thumbnail (512px WebP)
- `outfit_board`: Outfit visualization
- `outfit_person_wearing`: Person wearing the outfit

**Storage Strategy**:
- Files stored at: `DATA_DIR/images/{itemId}/{assetId}.{ext}`
- Thumbnails cached for performance
- Original images preserved for re-processing
- Cascade delete when item is removed

### 3. Tag

User-defined tags for item organization.

```prisma
model Tag {
  id          String     @id @default(uuid())
  name        String     @unique
  itemTags    ItemTag[]
  createdAt   DateTime   @default(now())
}
```

**Features**:
- Global tag pool shared across items
- Unique name constraint
- Many-to-many relationship through ItemTag
- Can show tag popularity (count items per tag)
- Easy to rename tags globally

### 4. ItemTag (Join Table)

Many-to-many relationship between Items and Tags.

```prisma
model ItemTag {
  itemId      String
  tagId       String
  item        Item       @relation(fields: [itemId], references: [id], onDelete: Cascade)
  tag         Tag        @relation(fields: [tagId], references: [id], onDelete: Cascade)
  
  @@id([itemId, tagId])
  @@index([itemId])
  @@index([tagId])
}
```

**Indexes**:
- Composite primary key on (itemId, tagId)
- Index on itemId for fast item lookups
- Index on tagId for fast tag-based queries

### 5. Outfit

Represents a complete outfit combination.

```prisma
model Outfit {
  id               String       @id @default(uuid())
  title            String?
  notes            String?
  rating           OutfitRating @default(neutral)
  
  // Generation constraints
  weather          String?      // hot, warm, cool, cold, rain, snow
  vibe             String?      // dysphoria_safe, confidence_boost, dopamine, neutral
  occasion         String?
  timeAvailable    String?      // quick, normal
  
  // AI-generated fields
  explanation      String?      @db.Text
  swapSuggestions  String?      @db.Text
  
  items            OutfitItem[]
  images           OutfitImage[]
  aiJobs           AIJob[]
  
  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt
}
```

**Constraint Fields**:
- Weather conditions for outfit appropriateness
- Vibe for mood-based selection
- Occasion for context-appropriate styling
- Time available for quick vs. considered choices

**AI Features**:
- AI-generated explanation of why items work together
- Swap suggestions for alternative pieces
- Rating system (up/down/neutral) to improve future suggestions

### 6. OutfitItem (Join Table)

Links items to outfits with role information.

```prisma
model OutfitItem {
  outfitId    String
  itemId      String
  role        OutfitRole
  
  outfit      Outfit      @relation(fields: [outfitId], references: [id], onDelete: Cascade)
  item        Item        @relation(fields: [itemId], references: [id], onDelete: Cascade)
  
  @@id([outfitId, itemId])
  @@index([outfitId])
  @@index([itemId])
}
```

**Outfit Roles**:
- top, bottom, dress (base layers)
- outerwear (jackets, coats)
- shoes
- accessory (bags, belts, hats)
- underwear_bras
- jewelry
- swimwear, activewear, sleepwear, loungewear
- suit_set (matching sets)

### 7. OutfitImage

Images specifically for outfit visualizations.

```prisma
model OutfitImage {
  id          String     @id @default(uuid())
  outfitId    String
  outfit      Outfit     @relation(fields: [outfitId], references: [id], onDelete: Cascade)
  
  kind        ImageKind  // outfit_board or outfit_person_wearing
  filePath    String     // relative to DATA_DIR
  width       Int?
  height      Int?
  mimeType    String?
  
  createdAt   DateTime   @default(now())
  
  @@index([outfitId])
  @@index([kind])
}
```

**Image Types**:
- `outfit_board`: Flat lay or grid visualization
- `outfit_person_wearing`: AI-generated person wearing outfit (future)

### 8. AIJob

Tracks all AI processing jobs for debugging and monitoring.

```prisma
model AIJob {
  id              String       @id @default(uuid())
  type            AIJobType
  status          AIJobStatus  @default(queued)
  
  // References
  itemId          String?
  item            Item?        @relation(fields: [itemId], references: [id], onDelete: Cascade)
  outfitId        String?
  outfit          Outfit?      @relation(fields: [outfitId], references: [id], onDelete: Cascade)
  
  // Job data
  inputRefs       Json?        // Input parameters/references
  outputJson      Json?        // Parsed AI response
  confidenceJson  Json?        // Confidence scores
  modelName       String?      // e.g., "gpt-4-vision-preview"
  rawResponse     String?      // Full API response for debugging
  error           String?
  
  // Job metadata
  attempts        Int          @default(0)
  maxAttempts     Int          @default(3)
  
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
  completedAt     DateTime?
  
  @@index([itemId])
  @@index([outfitId])
  @@index([status])
  @@index([type])
}
```

**Job Types**:
- `generate_catalog_image`: Create clean catalog image from photo
- `infer_item`: Detect category, colors, attributes
- `extract_label`: OCR text from label photos
- `generate_outfit`: Create outfit combination
- `generate_outfit_visualization`: Create outfit image

**Job Statuses**:
- `queued`: Waiting for worker
- `running`: Currently processing
- `succeeded`: Completed successfully
- `failed`: Failed after retries
- `needs_review`: AI uncertain, needs human review

### 9. NFCTag

Maps NFC tag UIDs to specific items.

```prisma
model NFCTag {
  id            String     @id @default(uuid())
  tagId         String     @unique  // NFC tag UID
  label         String?              // Optional user label
  
  itemId        String     @unique
  item          Item       @relation(fields: [itemId], references: [id], onDelete: Cascade)
  
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
  
  @@index([tagId])
}
```

**Use Case**:
- Attach NFC tags to hangers
- Scan tag to quickly identify item
- Track when items are removed/returned to closet

### 10. NFCEvent

Logs NFC tag scans for wear tracking.

```prisma
model NFCEvent {
  id            String     @id @default(uuid())
  tagId         String     // NFC tag UID that was scanned
  itemId        String
  item          Item       @relation(fields: [itemId], references: [id], onDelete: Cascade)
  
  action        String     // "removed" or "returned"
  notes         String?    // Optional user notes
  
  createdAt     DateTime   @default(now())
  
  @@index([itemId])
  @@index([tagId])
  @@index([createdAt])
}
```

**Event Types**:
- `removed`: Item taken from closet
- `returned`: Item returned to closet

## Enums

### Category
Primary item categories:
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
  swimwear
  activewear
  sleepwear
  loungewear
  suits_sets
}
```

### ItemState
Current state of an item:
```prisma
enum ItemState {
  available   // Ready to wear
  laundry     // In laundry basket
  unavailable // Packed away, at cleaners, etc.
  donate      // Marked for donation
}
```

### CleanStatus
Cleanliness tracking:
```prisma
enum CleanStatus {
  clean
  dirty
  needs_wash
}
```

### Sub-Type Enums

**AccessoryType**:
```prisma
enum AccessoryType {
  purse, bag, backpack, belt, hat, scarf, gloves, sunglasses, watch, other
}
```

**JewelryType**:
```prisma
enum JewelryType {
  necklace, earrings, bracelet, ring, anklet, brooch, other
}
```

**ShoeType**:
```prisma
enum ShoeType {
  sneakers, boots, sandals, heels, flats, loafers, oxfords, platforms, other
}
```

**BottomsType**:
```prisma
enum BottomsType {
  jeans, dress_pants, casual_pants, cargo_pants, shorts, skirt, leggings, joggers, other
}
```

### FranchiseType
For licensed merchandise:
```prisma
enum FranchiseType {
  band, movie, tv_show, game, anime, comic, sports, brand, other
}
```

### StorageType
Physical storage methods:
```prisma
enum StorageType {
  hanging, folded, drawer, shelf, box, other
}
```

## JSON Field Structures

### colorPalette (Item.colorPalette)
Array of hex color codes extracted from item images:
```json
["#000000", "#FF0000", "#FFFFFF"]
```

### attributes (Item.attributes)
Category-specific attributes:
```json
{
  "neckline": "crew",
  "sleeve_length": "short",
  "fit": "regular",
  "material": "cotton",
  "pattern": "graphic"
}
```

### outputJson (AIJob.outputJson)
AI response data, varies by job type:

**generate_catalog_image**:
```json
{
  "imageUrl": "https://...",
  "prompt": "...",
  "model": "dall-e-3"
}
```

**infer_item**:
```json
{
  "category": "tops",
  "colors": ["black", "white"],
  "colorPalette": ["#000000", "#FFFFFF"],
  "attributes": {
    "neckline": "crew",
    "sleeve_length": "short"
  },
  "tags": ["goth", "band-tee"],
  "confidence": 0.92
}
```

**extract_label**:
```json
{
  "brand": "Killstar",
  "size": "M",
  "materials": "100% Cotton",
  "care": "Machine wash cold",
  "confidence": 0.88
}
```

**generate_outfit**:
```json
{
  "outfits": [
    {
      "items": ["item-uuid-1", "item-uuid-2", "item-uuid-3"],
      "roles": ["top", "bottom", "shoes"],
      "explanation": "This outfit...",
      "confidence": 0.95
    }
  ]
}
```

## Key Design Decisions

### 1. Separate ImageAsset from Item
**Rationale**: Allows multiple images per item, different kinds, easy to add/remove

### 2. Tags as Separate Entities
**Rationale**: Reusable across items, easy to rename globally, can show popularity

### 3. Outfit References Items, Not Copies
**Rationale**: Item changes reflect in outfits, easier to track "most worn" items

### 4. AIJob Tracks All Operations
**Rationale**: Debug failed jobs, show processing history, retry logic, cost tracking

### 5. JSON Fields for Flexible Data
**Rationale**: Category-specific attributes vary, AI responses are semi-structured

### 6. UUID Primary Keys
**Rationale**: Global uniqueness, no collisions on import/export, URL-safe

### 7. Cascade Deletes
**Rationale**: Deleting an item should remove all related data automatically

### 8. Indexes on Foreign Keys
**Rationale**: Fast lookups for relations, essential for performance

## Query Patterns

### Common Queries

**Get all available items with images**:
```typescript
const items = await prisma.item.findMany({
  where: { state: 'available' },
  include: {
    images: {
      where: { kind: 'ai_catalog' },
      take: 1,
    },
    tags: { include: { tag: true } },
  },
  orderBy: { updatedAt: 'desc' },
});
```

**Get item with full details**:
```typescript
const item = await prisma.item.findUnique({
  where: { id },
  include: {
    images: true,
    tags: { include: { tag: true } },
    aiJobs: {
      orderBy: { createdAt: 'desc' },
      take: 10,
    },
  },
});
```

**Get outfit with items**:
```typescript
const outfit = await prisma.outfit.findUnique({
  where: { id },
  include: {
    items: {
      include: {
        item: {
          include: {
            images: {
              where: { kind: 'ai_catalog' },
              take: 1,
            },
          },
        },
      },
    },
  },
});
```

## Migration Strategy

### Development Migrations
```bash
# Create and run migration
npx prisma migrate dev --name add_new_field

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

### Production Migrations
```bash
# Deploy migrations to production
npx prisma migrate deploy

# Always generate client after schema changes
npm run prisma:generate
```

## Performance Considerations

### Indexes
- Foreign key indexes for fast joins
- Status and type indexes for filtering
- createdAt indexes for chronological queries

### Query Optimization
- Use `select` to fetch only needed fields
- Use `include` sparingly, only for needed relations
- Paginate large result sets
- Use transactions for multi-step operations

### Data Limits
- Items: Tested up to 10,000+
- Images: Limited by disk space
- Outfits: No practical limit (< 1000 typical)

## Backup and Export

### Database Backup
```bash
# PostgreSQL backup
pg_dump wardrobe_closet > backup.sql

# Restore
psql wardrobe_closet < backup.sql
```

### Application Export
Uses custom ZIP format with JSON and CSV files, see `/api/export` endpoint.
