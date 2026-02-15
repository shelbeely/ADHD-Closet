# Underwear & Bra Attributes

## Overview

The Twin Style wardrobe system includes specialized attributes for underwear and bras to help users track important functional features of these items.

## New Attributes

### `hasTucking` (Boolean, Optional)

**Purpose**: Indicates whether underwear has tucking support/design.

**Applies to**: Underwear items (category: `underwear_bras`)

**Usage**:
- `true` - Underwear specifically designed with tucking functionality
- `false` or `null` - Regular underwear without tucking support

**Example Items**:
```typescript
{
  title: "Navy Underwear (Tucking)",
  category: "underwear_bras",
  brand: "TomboyX",
  hasTucking: true
}
```

### `hasRemovablePads` (Boolean, Optional)

**Purpose**: Indicates whether a bra has removable pad pockets.

**Applies to**: Bra items (category: `underwear_bras`)

**Usage**:
- `true` - Bra has pockets/slots for removable pads
- `false` - Bra does not have removable pad functionality (e.g., seamless bras, wire-only bras)
- `null` - Information not specified

**Example Items**:
```typescript
{
  title: "Sports Bra (Removable Pads)",
  category: "underwear_bras",
  brand: "Nike",
  hasRemovablePads: true
}

{
  title: "Seamless Bra",
  category: "underwear_bras",
  brand: "Calvin Klein",
  hasRemovablePads: false
}
```

## Schema Definition

In `prisma/schema.prisma`:

```prisma
model Item {
  // ... other fields ...
  
  // Underwear/bras specific attributes
  hasTucking         Boolean? @map("has_tucking")           // For underwear: supports tucking
  hasRemovablePads   Boolean? @map("has_removable_pads")    // For bras: has removable pad pockets
  
  // ... other fields ...
}
```

## Database Columns

- **Column**: `has_tucking`
- **Type**: `BOOLEAN` (nullable)
- **Default**: `NULL`

- **Column**: `has_removable_pads`
- **Type**: `BOOLEAN` (nullable)
- **Default**: `NULL`

## Querying

### Find underwear with tucking support:

```typescript
const tuckingUnderwear = await prisma.item.findMany({
  where: {
    category: 'underwear_bras',
    hasTucking: true
  }
});
```

### Find bras with removable pads:

```typescript
const removablePadBras = await prisma.item.findMany({
  where: {
    category: 'underwear_bras',
    hasRemovablePads: true
  }
});
```

### Find all underwear/bras with any special features:

```typescript
const specialUnderwear = await prisma.item.findMany({
  where: {
    category: 'underwear_bras',
    OR: [
      { hasTucking: true },
      { hasRemovablePads: true }
    ]
  }
});
```

## Seed Data Examples

The demo seed (`npm run prisma:seed:demo`) includes:
- **2 items** with tucking support (TomboyX brand)
- **4 bras** with removable pads (Target brand)
- **2 bras** without removable pads (Victoria's Secret)
- **4 regular underwear** without tucking

The comprehensive test seed (`npm run prisma:seed:full`) includes:
- Tucking underwear example
- Sports bra with removable pads
- Seamless bra explicitly marked as no removable pads

## UI Considerations

When displaying these items in the UI, you may want to:

1. **Show badges/icons** for special features:
   - "Tucking Support" badge for `hasTucking: true`
   - "Removable Pads" badge for `hasRemovablePads: true`

2. **Filter options**:
   - Allow filtering by "Has Tucking Support"
   - Allow filtering by "Has Removable Pads"

3. **Item detail view**:
   - Display these attributes prominently in the item details
   - Consider adding these as editable fields when adding/editing items

4. **Search**:
   - Consider including these attributes in search functionality
   - Users might search for "tucking underwear" or "bras with pads"

## Backend Integration

These fields are:
- ✅ **Optional/Nullable** - Won't break existing items
- ✅ **Category-agnostic** - Stored on Item model like other sub-type fields
- ✅ **Type-safe** - Boolean type ensures consistent data
- ✅ **Queryable** - Can filter and search by these attributes
- ✅ **Indexed-ready** - Can add indexes if needed for performance

## Future Enhancements

Potential future additions for underwear/bras:
- Bra style/type enum (sports, padded, wireless, strapless, etc.)
- Underwear style/type enum (brief, boxer-brief, thong, etc.)
- Support level (light, medium, high for sports bras)
- Wire type (underwire, wireless, soft-cup)
- Closure type (back clasp, front clasp, pull-over)

## Migration Notes

- **Added**: 2026-02-15
- **Migration**: Schema changes applied via `prisma db push`
- **Backwards compatible**: Existing items unchanged (fields are nullable)
- **No data loss**: Safe to roll out to existing databases
