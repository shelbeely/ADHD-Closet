/**
 * Database Seed Script
 * 
 * Populates the database with one item for each of the 13 main categories.
 * This provides a comprehensive dummy dataset for testing and development.
 * 
 * Run with: npm run prisma:seed
 */

import { PrismaClient, Category } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data (optional - comment out if you want to keep existing data)
  console.log('🗑️  Clearing existing items...');
  await prisma.item.deleteMany({});
  await prisma.tag.deleteMany({});
  console.log('✅ Existing data cleared');

  // Seed items - one for each category
  const items = [
    {
      title: 'Black Band T-Shirt',
      category: 'tops' as Category,
      brand: 'Hot Topic',
      sizeText: 'M',
      materials: 'Cotton',
      isLicensedMerch: true,
      franchise: 'My Chemical Romance',
      franchiseType: 'band' as const,
      colorPalette: ['#000000', '#FFFFFF'],
      attributes: {
        neckline: 'crew',
        sleeveLength: 'short',
        sleeveFit: 'fitted',
        silhouette: 'fitted'
      },
      cleanStatus: 'clean' as const,
      state: 'available' as const,
    },
    {
      title: 'Dark Wash Skinny Jeans',
      category: 'bottoms' as Category,
      bottomsType: 'jeans' as const,
      brand: 'Levi\'s',
      sizeText: '30x32',
      materials: 'Denim (98% Cotton, 2% Elastane)',
      colorPalette: ['#2C3E50', '#34495E'],
      attributes: {
        rise: 'high',
        fit: 'skinny',
        inseam: '32',
        hemline: 'raw'
      },
      cleanStatus: 'clean' as const,
      state: 'available' as const,
    },
    {
      title: 'Gothic Lace Maxi Dress',
      category: 'dresses' as Category,
      brand: 'Killstar',
      sizeText: 'S',
      materials: 'Polyester, Lace',
      colorPalette: ['#000000'],
      attributes: {
        neckline: 'v-neck',
        sleeveLength: 'long',
        waistline: 'empire',
        hemline: 'maxi',
        silhouette: 'A-line'
      },
      cleanStatus: 'clean' as const,
      state: 'available' as const,
    },
    {
      title: 'Oversized Denim Jacket',
      category: 'outerwear' as Category,
      brand: 'Thrift Store Find',
      sizeText: 'L',
      materials: 'Denim',
      colorPalette: ['#4A90E2', '#3A7BC8'],
      attributes: {
        length: 'hip',
        silhouette: 'oversized',
        visualWeight: 'moderate'
      },
      cleanStatus: 'clean' as const,
      state: 'available' as const,
    },
    {
      title: 'Platform Combat Boots',
      category: 'shoes' as Category,
      shoeType: 'boots' as const,
      brand: 'Demonia',
      sizeText: '8',
      materials: 'Vegan Leather',
      colorPalette: ['#000000'],
      attributes: {
        heelHeight: '2 inches',
        heelThickness: 'chunky',
        toeboxShape: 'rounded',
        visualWeight: 'heavy'
      },
      cleanStatus: 'clean' as const,
      state: 'available' as const,
    },
    {
      title: 'Black Crossbody Bag',
      category: 'accessories' as Category,
      accessoryType: 'purse' as const,
      brand: 'Urban Outfitters',
      sizeText: 'Small',
      materials: 'Faux Leather',
      colorPalette: ['#000000'],
      attributes: {
        size: 'small',
        structure: 'structured',
        visualWeight: 'minimal',
        occasion: 'casual'
      },
      cleanStatus: 'clean' as const,
      state: 'available' as const,
    },
    {
      title: 'Black Sports Bra',
      category: 'underwear_bras' as Category,
      brand: 'Target',
      sizeText: 'M',
      materials: 'Nylon, Spandex',
      colorPalette: ['#000000'],
      attributes: {
        style: 'sports',
        support: 'medium'
      },
      cleanStatus: 'clean' as const,
      state: 'available' as const,
    },
    {
      title: 'Silver Chain Necklace',
      category: 'jewelry' as Category,
      jewelryType: 'necklace' as const,
      brand: 'Claire\'s',
      sizeText: 'One Size',
      materials: 'Silver-plated',
      colorPalette: ['#C0C0C0'],
      attributes: {
        metal: 'silver',
        gemstones: false,
        style: 'minimalist',
        occasion: 'everyday'
      },
      cleanStatus: 'clean' as const,
      state: 'available' as const,
    },
    {
      title: 'Black One-Piece Swimsuit',
      category: 'swimwear' as Category,
      brand: 'Speedo',
      sizeText: 'M',
      materials: 'Polyester, Elastane',
      colorPalette: ['#000000'],
      attributes: {
        style: 'one-piece',
        coverage: 'moderate',
        activity: 'swimming'
      },
      cleanStatus: 'clean' as const,
      state: 'available' as const,
    },
    {
      title: 'Black Leggings',
      category: 'activewear' as Category,
      brand: 'Nike',
      sizeText: 'M',
      materials: 'Polyester, Spandex',
      colorPalette: ['#000000'],
      attributes: {
        activityType: 'gym',
        fit: 'compression',
        moistureWicking: true,
        visualWeight: 'minimal'
      },
      cleanStatus: 'clean' as const,
      state: 'available' as const,
    },
    {
      title: 'Skull Print Pajama Set',
      category: 'sleepwear' as Category,
      brand: 'Hot Topic',
      sizeText: 'M',
      materials: 'Cotton',
      colorPalette: ['#000000', '#FFFFFF'],
      attributes: {
        style: 'pajamas',
        warmth: 'medium',
        season: 'all-season'
      },
      cleanStatus: 'clean' as const,
      state: 'available' as const,
    },
    {
      title: 'Oversized Hoodie',
      category: 'loungewear' as Category,
      brand: 'H&M',
      sizeText: 'L',
      materials: 'Cotton, Polyester',
      colorPalette: ['#808080'],
      attributes: {
        comfortLevel: 'ultra-comfy',
        style: 'sweats',
        occasion: 'home-only'
      },
      cleanStatus: 'clean' as const,
      state: 'available' as const,
    },
    {
      title: 'Black Two-Piece Co-ord Set',
      category: 'suits_sets' as Category,
      brand: 'Zara',
      sizeText: 'M',
      materials: 'Polyester',
      colorPalette: ['#000000'],
      attributes: {
        type: 'two-piece',
        formality: 'business-casual',
        completeness: 'complete-set'
      },
      cleanStatus: 'clean' as const,
      state: 'available' as const,
    },
  ];

  console.log('📦 Creating items...');
  let createdCount = 0;
  
  for (const itemData of items) {
    const item = await prisma.item.create({
      data: itemData,
    });
    createdCount++;
    console.log(`  ✓ Created: ${item.title} (${item.category})`);
  }

  console.log(`\n✨ Successfully seeded ${createdCount} items (one for each category)`);
  
  // Display summary
  console.log('\n📊 Summary:');
  const categoryCount = await prisma.item.groupBy({
    by: ['category'],
    _count: { category: true },
  });
  
  for (const { category, _count } of categoryCount) {
    console.log(`  ${category}: ${_count.category} item(s)`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
