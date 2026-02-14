/**
 * Seed Extension Script - Adds comprehensive test scenarios
 * Run after main seed: tsx prisma/seed-extension.ts
 */

import { PrismaClient, Category, ItemState, CleanStatus, StorageType, FranchiseType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter, log: ['error', 'warn'] });

async function extend() {
  console.log('📦 Adding comprehensive test scenarios...\n');
  
  // Items in different states
  const items = [
    { title: 'Worn White T-Shirt', category: 'tops' as Category, cleanStatus: 'needs_wash' as CleanStatus, state: 'laundry' as ItemState, brand: 'Uniqlo', sizeText: 'M', materials: 'Cotton', colorPalette: ['#FFFFFF'], storageType: 'folded' as StorageType },
    { title: 'Dirty Gym Shorts', category: 'activewear' as Category, cleanStatus: 'dirty' as CleanStatus, state: 'laundry' as ItemState, brand: 'Nike', sizeText: 'M', materials: 'Polyester', colorPalette: ['#000000'], storageType: 'drawer' as StorageType },
    { title: 'Winter Coat', category: 'outerwear' as Category, cleanStatus: 'clean' as CleanStatus, state: 'unavailable' as ItemState, brand: 'North Face', sizeText: 'L', materials: 'Down', colorPalette: ['#000080'], storageType: 'box' as StorageType },
    { title: 'Old Jeans', category: 'bottoms' as Category, bottomsType: 'jeans', cleanStatus: 'clean' as CleanStatus, state: 'donate' as ItemState, brand: 'Gap', sizeText: '32', materials: 'Denim', colorPalette: ['#87CEEB'], storageType: 'folded' as StorageType },
    // Licensed merch - all franchise types
    { title: 'Star Wars Tee', category: 'tops' as Category, cleanStatus: 'clean' as CleanStatus, state: 'available' as ItemState, isLicensedMerch: true, franchise: 'Star Wars', franchiseType: 'movie' as FranchiseType, brand: 'Target', sizeText: 'M', materials: 'Cotton', colorPalette: ['#000000'], storageType: 'hanging' as StorageType },
    { title: 'Stranger Things Hoodie', category: 'loungewear' as Category, cleanStatus: 'clean' as CleanStatus, state: 'available' as ItemState, isLicensedMerch: true, franchise: 'Stranger Things', franchiseType: 'tv_show' as FranchiseType, brand: 'Netflix', sizeText: 'L', materials: 'Cotton', colorPalette: ['#8B0000'], storageType: 'hanging' as StorageType },
    { title: 'Zelda Tee', category: 'tops' as Category, cleanStatus: 'clean' as CleanStatus, state: 'available' as ItemState, isLicensedMerch: true, franchise: 'Legend of Zelda', franchiseType: 'game' as FranchiseType, brand: 'Nintendo', sizeText: 'M', materials: 'Cotton', colorPalette: ['#228B22'], storageType: 'folded' as StorageType },
    { title: 'Naruto Headband', category: 'accessories' as Category, accessoryType: 'hat', cleanStatus: 'clean' as CleanStatus, state: 'available' as ItemState, isLicensedMerch: true, franchise: 'Naruto', franchiseType: 'anime' as FranchiseType, brand: 'Crunchyroll', sizeText: 'One Size', materials: 'Cotton', colorPalette: ['#000000'], storageType: 'shelf' as StorageType },
    { title: 'Spider-Man Tee', category: 'tops' as Category, cleanStatus: 'clean' as CleanStatus, state: 'available' as ItemState, isLicensedMerch: true, franchise: 'Spider-Man', franchiseType: 'comic' as FranchiseType, brand: 'Marvel', sizeText: 'M', materials: 'Cotton', colorPalette: ['#FF0000'], storageType: 'folded' as StorageType },
    { title: 'Lakers Jersey', category: 'activewear' as Category, cleanStatus: 'clean' as CleanStatus, state: 'available' as ItemState, isLicensedMerch: true, franchise: 'LA Lakers', franchiseType: 'sports' as FranchiseType, brand: 'Nike', sizeText: 'L', materials: 'Polyester', colorPalette: ['#552583'], storageType: 'hanging' as StorageType },
    { title: 'Supreme Logo', category: 'tops' as Category, cleanStatus: 'clean' as CleanStatus, state: 'available' as ItemState, isLicensedMerch: true, franchise: 'Supreme', franchiseType: 'brand' as FranchiseType, brand: 'Supreme', sizeText: 'M', materials: 'Cotton', colorPalette: ['#FFFFFF'], storageType: 'folded' as StorageType },
    { title: 'Band Tee MCR', category: 'tops' as Category, cleanStatus: 'clean' as CleanStatus, state: 'donate' as ItemState, isLicensedMerch: true, franchise: 'MCR', franchiseType: 'band' as FranchiseType, brand: 'Hot Topic', sizeText: 'S', materials: 'Cotton', colorPalette: ['#000000'], storageType: 'folded' as StorageType },
    // "Other" sub-types
    { title: 'Misc Accessory', category: 'accessories' as Category, accessoryType: 'other', cleanStatus: 'clean' as CleanStatus, state: 'available' as ItemState, brand: 'Generic', sizeText: 'One Size', materials: 'Mixed', colorPalette: ['#808080'], storageType: 'other' as StorageType },
    { title: 'Custom Jewelry', category: 'jewelry' as Category, jewelryType: 'other', cleanStatus: 'clean' as CleanStatus, state: 'available' as ItemState, brand: 'Handmade', sizeText: 'One Size', materials: 'Mixed', colorPalette: ['#4B0082'], storageType: 'box' as StorageType },
    { title: 'Unique Shoes', category: 'shoes' as Category, shoeType: 'other', cleanStatus: 'clean' as CleanStatus, state: 'available' as ItemState, brand: 'Custom', sizeText: '9', materials: 'Leather', colorPalette: ['#DAA520'], storageType: 'shelf' as StorageType },
    { title: 'Unconventional Bottom', category: 'bottoms' as Category, bottomsType: 'other', cleanStatus: 'clean' as CleanStatus, state: 'available' as ItemState, brand: 'Designer', sizeText: 'M', materials: 'Mixed', colorPalette: ['#000000'], storageType: 'hanging' as StorageType },
    // AI Generated
    { title: 'AI Red Tee', category: 'tops' as Category, cleanStatus: 'clean' as CleanStatus, state: 'available' as ItemState, isGenerated: true, generationType: 'color_variation', brand: 'Uniqlo', sizeText: 'M', materials: 'Cotton', colorPalette: ['#FF0000'], storageType: 'folded' as StorageType },
    // Wear tracking
    { title: 'Well-Worn Jeans', category: 'bottoms' as Category, bottomsType: 'jeans', cleanStatus: 'needs_wash' as CleanStatus, state: 'available' as ItemState, wearsBeforeWash: 5, currentWears: 4, lastWornDate: new Date('2026-02-13'), brand: 'Levis', sizeText: '30x32', materials: 'Denim', colorPalette: ['#4682B4'], storageType: 'hanging' as StorageType },
  ];
  
  for (const item of items) {
    await prisma.item.create({ data: item });
  }
  console.log(`✅ Added ${items.length} scenario items\n`);
  
  // Tags
  console.log('🏷️  Creating tags...');
  await prisma.tag.createMany({ data: [
    { name: 'favorite' }, { name: 'workwear' }, { name: 'casual' }, { name: 'formal' },
    { name: 'vintage' }, { name: 'comfortable' }, { name: 'dysphoria-safe' },
    { name: 'confidence-boost' }, { name: 'summer' }, { name: 'winter' },
  ]});
  const allTags = await prisma.tag.findMany();
  const allItems = await prisma.item.findMany({ where: { state: 'available' }, take: 2 });
  if (allItems.length >= 2) {
    await prisma.itemTag.create({ data: { itemId: allItems[0].id, tagId: allTags[0].id } });
    await prisma.itemTag.create({ data: { itemId: allItems[1].id, tagId: allTags[1].id } });
  }
  console.log('✅ Created 10 tags and tagged 2 items\n');
  
  // Outfits
  console.log('👔 Creating outfits...');
  const topItem = await prisma.item.findFirst({ where: { category: 'tops', state: 'available' } });
  const bottomItem = await prisma.item.findFirst({ where: { category: 'bottoms', state: 'available' } });
  const shoeItem = await prisma.item.findFirst({ where: { category: 'shoes', state: 'available' } });
  const dressItem = await prisma.item.findFirst({ where: { category: 'dresses', state: 'available' } });
  
  if (topItem && bottomItem && shoeItem) {
    await prisma.outfit.create({ data: { title: 'Casual Look', rating: 'up', weather: 'warm', vibe: 'confidence_boost', items: { create: [
      { itemId: topItem.id, role: 'top' }, { itemId: bottomItem.id, role: 'bottom' }, { itemId: shoeItem.id, role: 'shoes' }
    ]}}});
    await prisma.outfit.create({ data: { title: 'Formal Attire', rating: 'down', weather: 'cool', items: { create: [
      { itemId: topItem.id, role: 'top' }, { itemId: bottomItem.id, role: 'bottom' }
    ]}}});
    if (dressItem) {
      await prisma.outfit.create({ data: { title: 'Simple Dress', rating: 'neutral', items: { create: [
        { itemId: dressItem.id, role: 'dress' }
      ]}}});
    }
  }
  console.log('✅ Created 3 outfits (UP, DOWN, NEUTRAL)\n');
  
  // AI Jobs
  console.log('🤖 Creating AI jobs...');
  if (topItem) {
    await prisma.aIJob.createMany({ data: [
      { type: 'generate_catalog_image', status: 'succeeded', itemId: topItem.id, completedAt: new Date() },
      { type: 'infer_item', status: 'running', itemId: bottomItem?.id, attempts: 1 },
      { type: 'generate_outfit', status: 'queued', attempts: 0 },
      { type: 'extract_label', status: 'failed', itemId: shoeItem?.id, error: 'Cannot read', attempts: 3 },
      { type: 'generate_outfit_visualization', status: 'needs_review', completedAt: new Date() },
    ]});
  }
  console.log('✅ Created 5 AI jobs (all statuses)\n');
  
  // Image Assets
  console.log('📸 Creating image assets...');
  if (topItem) {
    await prisma.imageAsset.createMany({ data: [
      { itemId: topItem.id, kind: 'original_main', filePath: 'test-main.jpg', width: 1200, height: 1600, mimeType: 'image/jpeg' },
      { itemId: topItem.id, kind: 'original_back', filePath: 'test-back.jpg', width: 1200, height: 1600, mimeType: 'image/jpeg' },
      { itemId: topItem.id, kind: 'label_brand', filePath: 'test-label.jpg', width: 800, height: 600, mimeType: 'image/jpeg' },
      { itemId: topItem.id, kind: 'label_care', filePath: 'test-care.jpg', width: 600, height: 400, mimeType: 'image/jpeg' },
      { itemId: topItem.id, kind: 'detail', filePath: 'test-detail.jpg', width: 800, height: 800, mimeType: 'image/jpeg' },
      { itemId: topItem.id, kind: 'ai_catalog', filePath: 'test-catalog.jpg', width: 1024, height: 1024, mimeType: 'image/jpeg' },
      { itemId: topItem.id, kind: 'thumbnail', filePath: 'test-thumb.jpg', width: 256, height: 256, mimeType: 'image/jpeg' },
    ]});
  }
  console.log('✅ Created 7 image assets\n');
  
  // NFC Tags
  console.log('📱 Creating NFC tags...');
  if (topItem && bottomItem) {
    const nfc1 = await prisma.nFCTag.create({ data: { tagId: 'NFC-001', label: 'Blue Hanger', itemId: topItem.id }});
    await prisma.nFCEvent.createMany({ data: [
      { tagId: nfc1.tagId, itemId: topItem.id, action: 'removed', createdAt: new Date('2026-02-14T08:00:00') },
      { tagId: nfc1.tagId, itemId: topItem.id, action: 'returned', createdAt: new Date('2026-02-14T20:00:00') },
    ]});
    await prisma.nFCTag.create({ data: { tagId: 'NFC-002', label: 'Drawer Tag', itemId: bottomItem.id }});
  }
  console.log('✅ Created 2 NFC tags with 2 events\n');
  
  // Summary
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🎉 COMPREHENSIVE TEST DATABASE COMPLETE!\n');
  const totalItems = await prisma.item.count();
  const totalTags = await prisma.tag.count();
  const totalOutfits = await prisma.outfit.count();
  const totalAIJobs = await prisma.aIJob.count();
  const totalImages = await prisma.imageAsset.count();
  const totalNFCTags = await prisma.nFCTag.count();
  console.log(`✅ Items: ${totalItems} | Tags: ${totalTags} | Outfits: ${totalOutfits}`);
  console.log(`✅ AI Jobs: ${totalAIJobs} | Images: ${totalImages} | NFC: ${totalNFCTags}\n`);
  
  const stateGroups = await prisma.item.groupBy({ by: ['state'], _count: { state: true } });
  console.log('📊 Items by State:');
  for (const { state, _count } of stateGroups) {
    console.log(`  ${state}: ${_count.state}`);
  }
  console.log('═══════════════════════════════════════════════════════════\n');
}

extend()
  .catch((e) => { console.error('❌ Error:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });
