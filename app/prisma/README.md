# Database Seeding

This directory contains the database seeding script that populates the database with comprehensive dummy data for testing and development.

## What Does the Seed Script Do?

The seed script (`seed.ts`) creates **comprehensive test data covering all categories and attribute variations**:

### Categories Covered (13 main categories):

1. 👕 **Tops** (6 items) - Different necklines and sleeve lengths
   - Crew neck, V-neck, Scoop neck, Boat neck, Turtleneck, Off-shoulder
   
2. 👖 **Bottoms** (8 items) - All sub-types
   - Jeans, Dress pants, Casual pants, Cargo pants, Shorts, Skirt, Leggings, Joggers
   
3. 👗 **Dresses** (2 items) - Different styles and silhouettes
   
4. 🧥 **Outerwear** (2 items) - Different lengths and weights
   
5. 👟 **Shoes** (8 items) - All sub-types
   - Sneakers, Boots, Sandals, Heels, Flats, Loafers, Oxfords, Platforms
   
6. 🎒 **Accessories** (9 items) - All sub-types
   - Purse, Bag, Backpack, Belt, Hat, Scarf, Gloves, Sunglasses, Watch
   
7. 🩲 **Underwear & Bras** (2 items)
   
8. 💍 **Jewelry** (6 items) - All sub-types
   - Necklace, Earrings, Bracelet, Ring, Anklet, Brooch
   
9. 🩱 **Swimwear** (2 items) - Different styles and coverage
   
10. 🏃 **Activewear** (2 items) - Different activity types
   
11. 😴 **Sleepwear** (2 items) - Different warmth levels
   
12. 🛋️ **Loungewear** (2 items) - Different comfort levels
   
13. 👔 **Suits & Sets** (2 items) - Two-piece and three-piece

**Total: ~53 items** with realistic data including brands, sizes, materials, color palettes, and category-specific attributes.

Each item includes realistic data such as:
- Brand name
- Size
- Materials
- Color palette
- Category-specific attributes
- Clean status

## Prerequisites

1. **Database available**: Ensure your Supabase project is running and `DATABASE_URL` is set in `.env`:
   ```bash
   cd app
   npx prisma db pull  # Verify connection works
   ```
   Or for local development with Docker:
   ```bash
   cd /home/runner/work/ADHD-Closet/ADHD-Closet
   docker compose --profile local-db up -d
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
  ✓ Created: Black Crew Neck T-Shirt (tops)
  ✓ Created: Gray V-Neck Sweater (tops)
  ✓ Created: White Scoop Neck Tank (tops)
  ... (continues for all 53 items)

✨ Successfully seeded 53 items with comprehensive attribute coverage

📊 Summary by Category:
  tops: 6 item(s)
  bottoms: 8 item(s)
  dresses: 2 item(s)
  ... (and so on for all 13 categories)

📊 Summary by Sub-Type:
  Bottoms - jeans: 1 item(s)
  Bottoms - dress_pants: 1 item(s)
  ... (and so on for all sub-types)
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

Make sure your Supabase `DATABASE_URL` is correct in `.env`:
```bash
cd app && npx prisma db pull  # Verify connection
```

For local PostgreSQL:
```bash
docker compose --profile local-db ps  # Should show wardrobe-postgres container
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
