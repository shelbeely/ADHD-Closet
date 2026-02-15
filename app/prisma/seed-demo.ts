/**
 * Demo Database Seed - Realistic Wardrobe
 * 
 * Creates 220+ items for a realistic wardrobe demo
 * Includes variety in colors, brands, styles, and states
 * 
 * Run with: npx tsx prisma/seed-demo.ts
 */

import { PrismaClient, Category, ItemState, CleanStatus, StorageType, FranchiseType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter, log: ['error', 'warn'] });

// Helper arrays for variety
const colors = {
  tops: ['Black', 'White', 'Gray', 'Navy', 'Red', 'Blue', 'Green', 'Pink', 'Purple', 'Yellow', 'Orange', 'Burgundy', 'Olive', 'Tan', 'Cream'],
  hex: ['#000000', '#FFFFFF', '#808080', '#000080', '#FF0000', '#0000FF', '#008000', '#FFC0CB', '#800080', '#FFFF00', '#FFA500', '#800020', '#808000', '#D2B48C', '#FFFDD0']
};

const brands = {
  fast: ['H&M', 'Zara', 'Forever 21', 'Uniqlo', 'Target', 'Old Navy', 'Gap'],
  mid: ['J.Crew', 'Banana Republic', 'Madewell', 'Everlane', 'COS', 'Massimo Dutti'],
  athletic: ['Nike', 'Adidas', 'Under Armour', 'Lululemon', 'Athleta', 'Reebok', 'Puma'],
  premium: ['Nordstrom', 'Bloomingdales', 'Saks', 'Neiman Marcus'],
  indie: ['Local Boutique', 'Thrift Store', 'Vintage Shop', 'Etsy', 'Handmade']
};

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const shoeSizes = ['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11'];

async function seedDemo() {
  console.log('🌱 Starting DEMO database seeding for realistic wardrobe...\n');
  
  // Clear existing
  console.log('🗑️  Clearing existing data...');
  await prisma.nFCEvent.deleteMany({});
  await prisma.nFCTag.deleteMany({});
  await prisma.outfitImage.deleteMany({});
  await prisma.outfitItem.deleteMany({});
  await prisma.outfit.deleteMany({});
  await prisma.aIJob.deleteMany({});
  await prisma.imageAsset.deleteMany({});
  await prisma.itemTag.deleteMany({});
  await prisma.tag.deleteMany({});
  await prisma.item.deleteMany({});
  console.log('✅ Cleared\n');

  const items: any[] = [];
  
  // ========== TOPS (40 items) ==========
  console.log('Creating tops...');
  const topStyles = ['T-Shirt', 'Tank Top', 'Blouse', 'Sweater', 'Hoodie', 'Button-Down', 'Polo', 'Henley'];
  const topBrands = [...brands.fast, ...brands.mid, ...brands.indie];
  
  for (let i = 0; i < 40; i++) {
    const colorIdx = i % colors.tops.length;
    const styleIdx = i % topStyles.length;
    const brandIdx = i % topBrands.length;
    const sizeIdx = i % sizes.length;
    
    items.push({
      title: `${colors.tops[colorIdx]} ${topStyles[styleIdx]}`,
      category: 'tops' as Category,
      brand: topBrands[brandIdx],
      sizeText: sizes[sizeIdx],
      materials: 'Cotton',
      colorPalette: [colors.hex[colorIdx]],
      cleanStatus: i % 10 === 0 ? 'needs_wash' : 'clean' as CleanStatus,
      state: i % 20 === 0 ? 'laundry' : 'available' as ItemState,
      storageType: i % 2 === 0 ? 'hanging' : 'folded' as StorageType,
    });
  }
  
  // ========== BOTTOMS (35 items) ==========
  console.log('Creating bottoms...');
  const bottomTypes = ['jeans', 'dress_pants', 'casual_pants', 'shorts', 'skirt', 'leggings', 'joggers', 'cargo_pants'];
  const bottomColors = ['Black', 'Blue', 'Khaki', 'Gray', 'White', 'Navy', 'Olive'];
  
  for (let i = 0; i < 35; i++) {
    const typeIdx = i % bottomTypes.length;
    const colorIdx = i % bottomColors.length;
    const brandIdx = i % brands.fast.length;
    
    items.push({
      title: `${bottomColors[colorIdx]} ${bottomTypes[typeIdx].replace('_', ' ')}`,
      category: 'bottoms' as Category,
      bottomsType: bottomTypes[typeIdx],
      brand: brands.fast[brandIdx],
      sizeText: i % 2 === 0 ? `${28 + (i % 10)}` : sizes[i % sizes.length],
      materials: typeIdx === 0 ? 'Denim' : 'Cotton Blend',
      colorPalette: [colors.hex[colorIdx]],
      cleanStatus: i % 12 === 0 ? 'dirty' : 'clean' as CleanStatus,
      state: i % 15 === 0 ? 'laundry' : 'available' as ItemState,
      storageType: typeIdx === 3 ? 'drawer' : 'hanging' as StorageType,
    });
  }
  
  // ========== DRESSES (20 items) ==========
  console.log('Creating dresses...');
  const dressStyles = ['Maxi', 'Mini', 'Midi', 'Wrap', 'Shift', 'A-Line', 'Bodycon', 'Sundress'];
  
  for (let i = 0; i < 20; i++) {
    const styleIdx = i % dressStyles.length;
    const colorIdx = i % colors.tops.length;
    const brandIdx = i % brands.mid.length;
    
    items.push({
      title: `${colors.tops[colorIdx]} ${dressStyles[styleIdx]} Dress`,
      category: 'dresses' as Category,
      brand: brands.mid[brandIdx],
      sizeText: sizes[i % sizes.length],
      materials: 'Polyester',
      colorPalette: [colors.hex[colorIdx]],
      cleanStatus: 'clean' as CleanStatus,
      state: i === 19 ? 'unavailable' : 'available' as ItemState,
      storageType: 'hanging' as StorageType,
    });
  }
  
  // ========== OUTERWEAR (18 items) ==========
  console.log('Creating outerwear...');
  const outerStyles = ['Jacket', 'Coat', 'Blazer', 'Cardigan', 'Vest', 'Parka'];
  
  for (let i = 0; i < 18; i++) {
    const styleIdx = i % outerStyles.length;
    const colorIdx = i % 7;
    const brandIdx = i % brands.mid.length;
    
    items.push({
      title: `${colors.tops[colorIdx]} ${outerStyles[styleIdx]}`,
      category: 'outerwear' as Category,
      brand: brands.mid[brandIdx],
      sizeText: sizes[i % sizes.length],
      materials: styleIdx === 1 ? 'Wool' : 'Cotton Blend',
      colorPalette: [colors.hex[colorIdx]],
      cleanStatus: 'clean' as CleanStatus,
      state: i > 15 ? 'unavailable' : 'available' as ItemState,
      storageType: i > 15 ? 'box' : 'hanging' as StorageType,
    });
  }
  
  // ========== SHOES (35 items) ==========
  console.log('Creating shoes...');
  const shoeTypes = ['sneakers', 'boots', 'sandals', 'heels', 'flats', 'loafers', 'oxfords', 'platforms'];
  
  for (let i = 0; i < 35; i++) {
    const typeIdx = i % shoeTypes.length;
    const colorIdx = i % 8;
    const brandIdx = i % brands.fast.length;
    
    items.push({
      title: `${colors.tops[colorIdx]} ${shoeTypes[typeIdx]}`,
      category: 'shoes' as Category,
      shoeType: shoeTypes[typeIdx],
      brand: brands.fast[brandIdx],
      sizeText: shoeSizes[i % shoeSizes.length],
      materials: 'Leather',
      colorPalette: [colors.hex[colorIdx]],
      cleanStatus: 'clean' as CleanStatus,
      state: 'available' as ItemState,
      storageType: 'shelf' as StorageType,
    });
  }
  
  // ========== ACCESSORIES (25 items) ==========
  console.log('Creating accessories...');
  const accessoryTypes = ['purse', 'bag', 'backpack', 'belt', 'hat', 'scarf', 'gloves', 'sunglasses', 'watch'];
  
  for (let i = 0; i < 25; i++) {
    const typeIdx = i % accessoryTypes.length;
    const colorIdx = i % colors.tops.length;
    const brandIdx = i % brands.indie.length;
    
    items.push({
      title: `${colors.tops[colorIdx]} ${accessoryTypes[typeIdx]}`,
      category: 'accessories' as Category,
      accessoryType: accessoryTypes[typeIdx],
      brand: brands.indie[brandIdx],
      sizeText: 'One Size',
      materials: typeIdx < 3 ? 'Leather' : 'Mixed',
      colorPalette: [colors.hex[colorIdx]],
      cleanStatus: 'clean' as CleanStatus,
      state: 'available' as ItemState,
      storageType: typeIdx < 3 ? 'shelf' : 'drawer' as StorageType,
    });
  }
  
  // ========== JEWELRY (18 items) ==========
  console.log('Creating jewelry...');
  const jewelryTypes = ['necklace', 'earrings', 'bracelet', 'ring', 'anklet', 'brooch'];
  
  for (let i = 0; i < 18; i++) {
    const typeIdx = i % jewelryTypes.length;
    const metal = i % 2 === 0 ? 'Silver' : 'Gold';
    
    items.push({
      title: `${metal} ${jewelryTypes[typeIdx]}`,
      category: 'jewelry' as Category,
      jewelryType: jewelryTypes[typeIdx],
      brand: 'Local Jewelry',
      sizeText: 'One Size',
      materials: metal,
      colorPalette: [i % 2 === 0 ? '#C0C0C0' : '#FFD700'],
      cleanStatus: 'clean' as CleanStatus,
      state: 'available' as ItemState,
      storageType: 'box' as StorageType,
    });
  }
  
  // ========== UNDERWEAR/BRAS (12 items) ==========
  console.log('Creating underwear/bras...');
  for (let i = 0; i < 12; i++) {
    const isBra = i % 2 === 0;
    const type = isBra ? 'Bra' : 'Underwear';
    const colorIdx = i % 5;
    
    // Vary the attributes for realism
    const hasTucking = !isBra && i % 3 === 0; // Some underwear has tucking support
    const hasRemovablePads = isBra && i % 3 !== 0; // Most bras have removable pads
    
    items.push({
      title: `${colors.tops[colorIdx]} ${type}${hasTucking ? ' (Tucking)' : ''}${hasRemovablePads ? ' (Removable Pads)' : ''}`,
      category: 'underwear_bras' as Category,
      brand: isBra ? (hasRemovablePads ? 'Target' : 'Victoria\'s Secret') : (hasTucking ? 'TomboyX' : 'Target'),
      sizeText: isBra ? '34B' : sizes[i % sizes.length],
      materials: 'Cotton',
      colorPalette: [colors.hex[colorIdx]],
      cleanStatus: i % 4 === 0 ? 'needs_wash' : 'clean' as CleanStatus,
      state: 'available' as ItemState,
      storageType: 'drawer' as StorageType,
      hasTucking: hasTucking || undefined,
      hasRemovablePads: hasRemovablePads || undefined,
    });
  }
  
  // ========== SWIMWEAR (12 items) ==========
  console.log('Creating swimwear...');
  const swimTypes = ['One-Piece', 'Bikini', 'Tankini', 'Swim Shorts'];
  
  for (let i = 0; i < 12; i++) {
    const styleIdx = i % swimTypes.length;
    const colorIdx = i % colors.tops.length;
    
    items.push({
      title: `${colors.tops[colorIdx]} ${swimTypes[styleIdx]}`,
      category: 'swimwear' as Category,
      brand: 'Target',
      sizeText: sizes[i % sizes.length],
      materials: 'Nylon/Spandex',
      colorPalette: [colors.hex[colorIdx]],
      cleanStatus: 'clean' as CleanStatus,
      state: i > 9 ? 'unavailable' : 'available' as ItemState,
      storageType: 'drawer' as StorageType,
    });
  }
  
  // ========== ACTIVEWEAR (22 items) ==========
  console.log('Creating activewear...');
  const activeTypes = ['Leggings', 'Sports Bra', 'Tank', 'Shorts', 'Joggers', 'Hoodie'];
  
  for (let i = 0; i < 22; i++) {
    const styleIdx = i % activeTypes.length;
    const colorIdx = i % 8;
    const brandIdx = i % brands.athletic.length;
    
    items.push({
      title: `${colors.tops[colorIdx]} Athletic ${activeTypes[styleIdx]}`,
      category: 'activewear' as Category,
      brand: brands.athletic[brandIdx],
      sizeText: sizes[i % sizes.length],
      materials: 'Polyester/Spandex',
      colorPalette: [colors.hex[colorIdx]],
      cleanStatus: i % 5 === 0 ? 'dirty' : 'clean' as CleanStatus,
      state: i % 8 === 0 ? 'laundry' : 'available' as ItemState,
      storageType: 'drawer' as StorageType,
    });
  }
  
  // ========== SLEEPWEAR (12 items) ==========
  console.log('Creating sleepwear...');
  const sleepTypes = ['Pajama Set', 'Nightgown', 'Sleep Shirt', 'Pajama Pants'];
  
  for (let i = 0; i < 12; i++) {
    const styleIdx = i % sleepTypes.length;
    const colorIdx = i % colors.tops.length;
    
    items.push({
      title: `${colors.tops[colorIdx]} ${sleepTypes[styleIdx]}`,
      category: 'sleepwear' as Category,
      brand: brands.fast[i % brands.fast.length],
      sizeText: sizes[i % sizes.length],
      materials: 'Cotton',
      colorPalette: [colors.hex[colorIdx]],
      cleanStatus: i % 6 === 0 ? 'needs_wash' : 'clean' as CleanStatus,
      state: 'available' as ItemState,
      storageType: 'drawer' as StorageType,
    });
  }
  
  // ========== LOUNGEWEAR (15 items) ==========
  console.log('Creating loungewear...');
  const loungeTypes = ['Hoodie', 'Sweatpants', 'Lounge Set', 'Cozy Sweater', 'Joggers'];
  
  for (let i = 0; i < 15; i++) {
    const styleIdx = i % loungeTypes.length;
    const colorIdx = i % 8;
    
    items.push({
      title: `${colors.tops[colorIdx]} ${loungeTypes[styleIdx]}`,
      category: 'loungewear' as Category,
      brand: brands.fast[i % brands.fast.length],
      sizeText: sizes[i % sizes.length],
      materials: 'Cotton Fleece',
      colorPalette: [colors.hex[colorIdx]],
      cleanStatus: 'clean' as CleanStatus,
      state: 'available' as ItemState,
      storageType: 'folded' as StorageType,
    });
  }
  
  // ========== SUITS/SETS (12 items) ==========
  console.log('Creating suits/sets...');
  const suitTypes = ['Two-Piece Suit', 'Three-Piece Suit', 'Co-ord Set', 'Matching Set'];
  
  for (let i = 0; i < 12; i++) {
    const styleIdx = i % suitTypes.length;
    const colorIdx = i % 7;
    
    items.push({
      title: `${colors.tops[colorIdx]} ${suitTypes[styleIdx]}`,
      category: 'suits_sets' as Category,
      brand: brands.mid[i % brands.mid.length],
      sizeText: sizes[i % sizes.length],
      materials: 'Wool Blend',
      colorPalette: [colors.hex[colorIdx]],
      cleanStatus: 'clean' as CleanStatus,
      state: i === 11 ? 'unavailable' : 'available' as ItemState,
      storageType: 'hanging' as StorageType,
    });
  }
  
  // Add some licensed merch
  console.log('Creating licensed merchandise...');
  items.push(
    { title: 'Star Wars Logo Tee', category: 'tops' as Category, isLicensedMerch: true, franchise: 'Star Wars', franchiseType: 'movie' as FranchiseType, brand: 'Target', sizeText: 'M', materials: 'Cotton', colorPalette: ['#000000'], cleanStatus: 'clean' as CleanStatus, state: 'available' as ItemState, storageType: 'hanging' as StorageType },
    { title: 'Friends TV Show Tee', category: 'tops' as Category, isLicensedMerch: true, franchise: 'Friends', franchiseType: 'tv_show' as FranchiseType, brand: 'H&M', sizeText: 'L', materials: 'Cotton', colorPalette: ['#FFFFFF'], cleanStatus: 'clean' as CleanStatus, state: 'available' as ItemState, storageType: 'folded' as StorageType },
    { title: 'Zelda Game Hoodie', category: 'loungewear' as Category, isLicensedMerch: true, franchise: 'Zelda', franchiseType: 'game' as FranchiseType, brand: 'Nintendo Store', sizeText: 'M', materials: 'Cotton', colorPalette: ['#228B22'], cleanStatus: 'clean' as CleanStatus, state: 'available' as ItemState, storageType: 'hanging' as StorageType },
    { title: 'Naruto Anime Tee', category: 'tops' as Category, isLicensedMerch: true, franchise: 'Naruto', franchiseType: 'anime' as FranchiseType, brand: 'Hot Topic', sizeText: 'M', materials: 'Cotton', colorPalette: ['#FFA500'], cleanStatus: 'clean' as CleanStatus, state: 'available' as ItemState, storageType: 'folded' as StorageType },
  );
  
  // Add items in different states
  console.log('Creating items in various states...');
  items.push(
    { title: 'Worn Gray Tee', category: 'tops' as Category, brand: 'Gap', sizeText: 'M', materials: 'Cotton', colorPalette: ['#808080'], cleanStatus: 'needs_wash' as CleanStatus, state: 'laundry' as ItemState, storageType: 'folded' as StorageType, currentWears: 2, wearsBeforeWash: 3 },
    { title: 'Old Faded Jeans', category: 'bottoms' as Category, bottomsType: 'jeans', brand: 'Levis', sizeText: '32', materials: 'Denim', colorPalette: ['#87CEEB'], cleanStatus: 'clean' as CleanStatus, state: 'donate' as ItemState, storageType: 'folded' as StorageType },
    { title: 'Too Small Dress', category: 'dresses' as Category, brand: 'Forever 21', sizeText: 'XS', materials: 'Polyester', colorPalette: ['#FFC0CB'], cleanStatus: 'clean' as CleanStatus, state: 'donate' as ItemState, storageType: 'hanging' as StorageType },
    { title: 'Winter Parka in Storage', category: 'outerwear' as Category, brand: 'North Face', sizeText: 'M', materials: 'Down', colorPalette: ['#000080'], cleanStatus: 'clean' as CleanStatus, state: 'unavailable' as ItemState, storageType: 'box' as StorageType, locationInCloset: 'Attic' },
  );
  
  console.log(`\n📦 Creating ${items.length} items...`);
  let count = 0;
  for (const item of items) {
    await prisma.item.create({ data: item });
    count++;
    if (count % 50 === 0) {
      console.log(`  ✓ Created ${count} items...`);
    }
  }
  console.log(`✅ Created ${count} total items\n`);
  
  // Create tags
  console.log('🏷️  Creating tags...');
  await prisma.tag.createMany({
    data: [
      { name: 'favorite' }, { name: 'workwear' }, { name: 'casual' }, { name: 'formal' },
      { name: 'vintage' }, { name: 'comfortable' }, { name: 'dressy' }, { name: 'everyday' },
      { name: 'special-occasion' }, { name: 'summer' }, { name: 'winter' }, { name: 'spring' }, { name: 'fall' },
      { name: 'confidence-boost' }, { name: 'needs-repair' },
    ],
  });
  console.log('✅ Created 15 tags\n');
  
  // Create some outfits
  console.log('👔 Creating sample outfits...');
  const topItem = await prisma.item.findFirst({ where: { category: 'tops', state: 'available' } });
  const bottomItem = await prisma.item.findFirst({ where: { category: 'bottoms', state: 'available' } });
  const shoeItem = await prisma.item.findFirst({ where: { category: 'shoes', state: 'available' } });
  const dressItem = await prisma.item.findFirst({ where: { category: 'dresses', state: 'available' } });
  
  if (topItem && bottomItem && shoeItem) {
    await prisma.outfit.create({
      data: {
        title: 'Casual Day Look',
        rating: 'up',
        weather: 'warm',
        vibe: 'confidence_boost',
        items: {
          create: [
            { itemId: topItem.id, role: 'top' },
            { itemId: bottomItem.id, role: 'bottom' },
            { itemId: shoeItem.id, role: 'shoes' },
          ],
        },
      },
    });
    
    await prisma.outfit.create({
      data: {
        title: 'Work Outfit',
        rating: 'neutral',
        weather: 'cool',
        items: {
          create: [
            { itemId: topItem.id, role: 'top' },
            { itemId: bottomItem.id, role: 'bottom' },
          ],
        },
      },
    });
    
    if (dressItem) {
      await prisma.outfit.create({
        data: {
          title: 'Date Night',
          rating: 'up',
          weather: 'warm',
          vibe: 'confidence_boost',
          items: {
            create: [{ itemId: dressItem.id, role: 'dress' }, { itemId: shoeItem.id, role: 'shoes' }],
          },
        },
      });
    }
  }
  console.log('✅ Created 3 outfits\n');
  
  // Summary
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🎉 REALISTIC DEMO DATABASE COMPLETE!\n');
  
  const totalItems = await prisma.item.count();
  const byCategory = await prisma.item.groupBy({ by: ['category'], _count: { category: true } });
  const byState = await prisma.item.groupBy({ by: ['state'], _count: { state: true } });
  
  console.log(`✅ Total Items: ${totalItems}`);
  console.log(`✅ Total Tags: 15`);
  console.log(`✅ Total Outfits: 3\n`);
  
  console.log('📊 Items by Category:');
  byCategory.sort((a, b) => (b._count.category || 0) - (a._count.category || 0));
  for (const { category, _count } of byCategory) {
    console.log(`  ${category}: ${_count.category}`);
  }
  
  console.log('\n📊 Items by State:');
  for (const { state, _count } of byState) {
    console.log(`  ${state}: ${_count.state}`);
  }
  
  console.log('\n═══════════════════════════════════════════════════════════\n');
  console.log('Ready for demo! 🚀\n');
}

seedDemo()
  .catch((e) => { console.error('❌ Error:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });
