# Database Seeding

This directory contains the database seeding script that populates the database with dummy data for testing and development.

## What Does the Seed Script Do?

The seed script (`seed.ts`) creates **one item for each of the 13 main categories** in the ADHD Closet application:

1. 👕 **Tops** - Black Band T-Shirt (My Chemical Romance merch)
2. 👖 **Bottoms** - Dark Wash Skinny Jeans (with sub-type: jeans)
3. 👗 **Dresses** - Gothic Lace Maxi Dress
4. 🧥 **Outerwear** - Oversized Denim Jacket
5. 👟 **Shoes** - Platform Combat Boots (with sub-type: boots)
6. 🎒 **Accessories** - Black Crossbody Bag (with sub-type: purse)
7. 🩲 **Underwear & Bras** - Black Sports Bra
8. 💍 **Jewelry** - Silver Chain Necklace (with sub-type: necklace)
9. 🩱 **Swimwear** - Black One-Piece Swimsuit
10. 🏃 **Activewear** - Black Leggings
11. 😴 **Sleepwear** - Skull Print Pajama Set
12. 🛋️ **Loungewear** - Oversized Hoodie
13. 👔 **Suits & Sets** - Black Two-Piece Co-ord Set

Each item includes realistic data such as:
- Brand name
- Size
- Materials
- Color palette
- Category-specific attributes
- Clean status

## Prerequisites

1. **Database running**: Ensure PostgreSQL is running via Docker:
   ```bash
   cd /home/runner/work/ADHD-Closet/ADHD-Closet
   docker compose up -d postgres
   ```

2. **Database migrations applied**: Run migrations to set up the schema:
   ```bash
   cd app
   npx prisma migrate dev
   ```

3. **Dependencies installed**: Install required packages (including `tsx`):
   ```bash
   cd app
   bun install  # or npm install
   ```

## How to Run the Seed Script

### Method 1: Using the npm script (Recommended)

From the `app` directory:

```bash
npm run prisma:seed
```

### Method 2: Using Prisma's built-in seed command

From the `app` directory:

```bash
npx prisma db seed
```

### Method 3: Direct execution

From the `app` directory:

```bash
npx tsx prisma/seed.ts
```

## Expected Output

When the seed script runs successfully, you'll see output like:

```
🌱 Starting database seeding...
🗑️  Clearing existing items...
✅ Existing data cleared
📦 Creating items...
  ✓ Created: Black Band T-Shirt (tops)
  ✓ Created: Dark Wash Skinny Jeans (bottoms)
  ✓ Created: Gothic Lace Maxi Dress (dresses)
  ... (and so on for all 13 categories)

✨ Successfully seeded 13 items (one for each category)

📊 Summary:
  tops: 1 item(s)
  bottoms: 1 item(s)
  dresses: 1 item(s)
  ... (and so on)
```

## Important Notes

⚠️ **WARNING**: The seed script **clears all existing items and tags** before creating new ones. This ensures a clean slate for testing.

If you want to **keep existing data** and just add the dummy items, comment out these lines in `seed.ts`:

```typescript
// Clear existing data (optional - comment out if you want to keep existing data)
console.log('🗑️  Clearing existing items...');
await prisma.item.deleteMany({});
await prisma.tag.deleteMany({});
console.log('✅ Existing data cleared');
```

## Troubleshooting

### Error: Cannot find module 'tsx'

Install the missing dependency:
```bash
npm install --save-dev tsx
```

### Error: Database connection failed

Make sure PostgreSQL is running:
```bash
docker ps  # Should show wardrobe-postgres container
docker exec wardrobe-postgres pg_isready -U wardrobe  # Should return "accepting connections"
```

### Error: Prisma Client not generated

Generate the Prisma Client:
```bash
npm run prisma:generate
```

## Customizing the Seed Data

To customize the dummy items, edit `prisma/seed.ts` and modify the `items` array. Each item should match the schema defined in `prisma/schema.prisma`.

## See Also

- [Categories Reference Guide](../../docs/features/CATEGORIES.md) - Complete list of all categories and sub-types
- [Prisma Schema](./schema.prisma) - Database schema definition
- [Contributing Guide](../../CONTRIBUTING.md) - How to contribute to this project
