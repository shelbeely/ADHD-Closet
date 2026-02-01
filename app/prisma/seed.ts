/**
 * Database Seed Script
 * 
 * Populates the database with comprehensive dummy data covering:
 * - All 13 main categories
 * - All sub-types (bottoms, shoes, accessories, jewelry)
 * - Various attribute combinations (necklines, sleeve lengths, rises, etc.)
 * 
 * This provides a comprehensive dataset for testing and development.
 * 
 * Run with: npm run prisma:seed
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create adapter
const adapter = new PrismaPg(pool);

// Initialize Prisma Client with adapter
const prisma = new PrismaClient({
  adapter,
  log: ['error', 'warn'],
});

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data (optional - comment out if you want to keep existing data)
  console.log('🗑️  Clearing existing items...');
  await prisma.item.deleteMany({});
  await prisma.tag.deleteMany({});
  console.log('✅ Existing data cleared');

  // Seed items - comprehensive coverage of all categories and attributes
  const items = [
    // ========== TOPS - Different necklines and sleeve lengths ==========
    {
      title: 'Black Crew Neck T-Shirt',
      category: 'tops' as Category,
      brand: 'Uniqlo',
      sizeText: 'M',
      materials: 'Cotton',
      colorPalette: ['#000000'],
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
      title: 'Gray V-Neck Sweater',
      category: 'tops' as Category,
      brand: 'H&M',
      sizeText: 'L',
      materials: 'Acrylic, Wool',
      colorPalette: ['#808080'],
      attributes: {
        neckline: 'v-neck',
        sleeveLength: 'long',
        sleeveFit: 'loose',
        silhouette: 'oversized'
      },
      cleanStatus: 'clean' as const,
      state: 'available' as const,
    },
    {
      title: 'White Scoop Neck Tank',
      category: 'tops' as Category,
      brand: 'Target',
      sizeText: 'S',
      materials: 'Cotton',
      colorPalette: ['#FFFFFF'],
      attributes: {
        neckline: 'scoop',
        sleeveLength: 'sleeveless',
        silhouette: 'fitted'
      },
      cleanStatus: 'clean' as const,
      state: 'available' as const,
    },
    {
      title: 'Striped Boat Neck Top',
      category: 'tops' as Category,
      brand: 'Zara',
      sizeText: 'M',
      materials: 'Cotton, Spandex',
      colorPalette: ['#000000', '#FFFFFF'],
      attributes: {
        neckline: 'boat',
        sleeveLength: '3/4',
        silhouette: 'fitted'
      },
      cleanStatus: 'clean' as const,
      state: 'available' as const,
    },
    {
      title: 'Black Turtleneck',
      category: 'tops' as Category,
      brand: 'Gap',
      sizeText: 'M',
      materials: 'Cotton, Spandex',
      colorPalette: ['#000000'],
      attributes: {
        neckline: 'turtleneck',
        sleeveLength: 'long',
        sleeveFit: 'fitted',
        silhouette: 'fitted'
      },
      cleanStatus: 'clean' as const,
      state: 'available' as const,
    },
    {
      title: 'Red Off-Shoulder Blouse',
      category: 'tops' as Category,
      brand: 'Forever 21',
      sizeText: 'S',
      materials: 'Polyester',
      colorPalette: ['#FF0000'],
      attributes: {
        neckline: 'off-shoulder',
        sleeveLength: 'short',
        sleeveFit: 'puff',
        silhouette: 'loose'
      },
      cleanStatus: 'clean' as const,
      state: 'available' as const,
    },
    
    // ========== BOTTOMS - All sub-types ==========
    // ========== BOTTOMS - All sub-types ==========
    {
      title: 'Dark Wash Skinny Jeans',
      category: 'bottoms' as Category,
      bottomsType: 'jeans' as const,
      brand: 'Levi\'s',
      sizeText: '30x32',
      materials: 'Denim (98% Cotton, 2% Elastane)',
      colorPalette: ['#2C3E50'],
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
      title: 'Black Dress Pants',
      category: 'bottoms' as Category,
      bottomsType: 'dress_pants' as const,
      brand: 'Express',
      sizeText: '32x30',
      materials: 'Polyester, Rayon',
      colorPalette: ['#000000'],
      attributes: {
        rise: 'mid',
        fit: 'straight',
        inseam: '30'
      },
      cleanStatus: 'clean' as const,
      state: 'available' as const,
    },
    {
      title: 'Khaki Casual Pants',
      category: 'bottoms' as Category,
      bottomsType: 'casual_pants' as const,
      brand: 'Old Navy',
      sizeText: '32',
      materials: 'Cotton',
      colorPalette: ['#C3B091'],
      attributes: {
        rise: 'mid',
        fit: 'slim'
      },
      cleanStatus: 'clean' as const,
      state: 'available' as const,
    },
    {
      title: 'Black Cargo Pants',
      category: 'bottoms' as Category,
      bottomsType: 'cargo_pants' as const,
      brand: 'Dickies',
      sizeText: '32x32',
      materials: 'Cotton',
      colorPalette: ['#000000'],
      attributes: {
        rise: 'low',
        fit: 'wide',
        pocketStyle: 'cargo'
      },
      cleanStatus: 'clean' as const,
      state: 'available' as const,
    },
    {
      title: 'Denim Shorts',
      category: 'bottoms' as Category,
      bottomsType: 'shorts' as const,
      brand: 'Levi\'s',
      sizeText: '30',
      materials: 'Denim',
      colorPalette: ['#4A90E2'],
      attributes: {
        rise: 'high',
        fit: 'straight',
        hemline: 'distressed'
      },
      cleanStatus: 'clean' as const,
      state: 'available' as const,
    },
    {
      title: 'Black Pleated Skirt',
      category: 'bottoms' as Category,
      bottomsType: 'skirt' as const,
      brand: 'Forever 21',
      sizeText: 'M',
      materials: 'Polyester',
      colorPalette: ['#000000'],
      attributes: {
        hemline: 'midi',
        silhouette: 'A-line'
      },
      cleanStatus: 'clean' as const,
      state: 'available' as const,
    },
    {
      title: 'Black Athletic Leggings',
      category: 'bottoms' as Category,
      bottomsType: 'leggings' as const,
      brand: 'Lululemon',
      sizeText: 'M',
      materials: 'Nylon, Spandex',
      colorPalette: ['#000000'],
      attributes: {
        rise: 'high',
        fit: 'skinny'
      },
      cleanStatus: 'clean' as const,
      state: 'available' as const,
    },
    {
      title: 'Gray Joggers',
      category: 'bottoms' as Category,
      bottomsType: 'joggers' as const,
      brand: 'Adidas',
      sizeText: 'L',
      materials: 'Cotton, Polyester',
      colorPalette: ['#808080'],
      attributes: {
        rise: 'mid',
        fit: 'tapered'
      },
      cleanStatus: 'clean' as const,
      state: 'available' as const,
    },

    // ========== DRESSES ==========
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
      title: 'Red Bodycon Mini Dress',
      category: 'dresses' as Category,
      brand: 'Forever 21',
      sizeText: 'S',
      materials: 'Polyester, Spandex',
      colorPalette: ['#FF0000'],
      attributes: {
        neckline: 'scoop',
        sleeveLength: 'sleeveless',
        waistline: 'natural',
        hemline: 'mini',
        silhouette: 'bodycon'
      },
      cleanStatus: 'clean' as const,
      state: 'available' as const,
    },

    // ========== OUTERWEAR ==========
    {
      title: 'Oversized Denim Jacket',
      category: 'outerwear' as Category,
      brand: 'Thrift Store Find',
      sizeText: 'L',
      materials: 'Denim',
      colorPalette: ['#4A90E2'],
      attributes: {
        length: 'hip',
        silhouette: 'oversized',
        visualWeight: 'moderate'
      },
      cleanStatus: 'clean' as const,
      state: 'available' as const,
    },
    {
      title: 'Black Leather Jacket',
      category: 'outerwear' as Category,
      brand: 'AllSaints',
      sizeText: 'M',
      materials: 'Leather',
      colorPalette: ['#000000'],
      attributes: {
        length: 'hip',
        silhouette: 'fitted',
        visualWeight: 'heavy'
      },
      cleanStatus: 'clean' as const,
      state: 'available' as const,
    },

    // ========== SHOES - All sub-types ==========
    {
      title: 'White Canvas Sneakers',
      category: 'shoes' as Category,
      shoeType: 'sneakers' as const,
      brand: 'Converse',
      sizeText: '9',
      materials: 'Canvas',
      colorPalette: ['#FFFFFF'],
      attributes: {
        heelHeight: 'flat',
        heelThickness: 'none',
        toeboxShape: 'rounded'
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
      title: 'Brown Leather Sandals',
      category: 'shoes' as Category,
      shoeType: 'sandals' as const,
      brand: 'Birkenstock',
      sizeText: '7',
      materials: 'Leather',
      colorPalette: ['#8B4513'],
      attributes: {
        heelHeight: 'flat',
        heelThickness: 'none',
        toeboxShape: 'rounded'
      },
      cleanStatus: 'clean' as const,
      state: 'available' as const,
    },
    {
      title: 'Black Stiletto Heels',
      category: 'shoes' as Category,
      shoeType: 'heels' as const,
      brand: 'Steve Madden',
      sizeText: '8',
      materials: 'Faux Leather',
      colorPalette: ['#000000'],
      attributes: {
        heelHeight: '4 inches',
        heelThickness: 'slim',
        toeboxShape: 'pointed',
        visualWeight: 'minimal'
      },
      cleanStatus: 'clean' as const,
      state: 'available' as const,
    },
    {
      title: 'Black Ballet Flats',
      category: 'shoes' as Category,
      shoeType: 'flats' as const,
      brand: 'Target',
      sizeText: '8',
      materials: 'Faux Leather',
      colorPalette: ['#000000'],
      attributes: {
        heelHeight: 'flat',
        heelThickness: 'none',
        toeboxShape: 'rounded'
      },
      cleanStatus: 'clean' as const,
      state: 'available' as const,
    },
    {
      title: 'Brown Leather Loafers',
      category: 'shoes' as Category,
      shoeType: 'loafers' as const,
      brand: 'Cole Haan',
      sizeText: '9',
      materials: 'Leather',
      colorPalette: ['#8B4513'],
      attributes: {
        heelHeight: 'low',
        heelThickness: 'chunky',
        toeboxShape: 'rounded'
      },
      cleanStatus: 'clean' as const,
      state: 'available' as const,
    },
    {
      title: 'Black Oxford Shoes',
      category: 'shoes' as Category,
      shoeType: 'oxfords' as const,
      brand: 'Clarks',
      sizeText: '9',
      materials: 'Leather',
      colorPalette: ['#000000'],
      attributes: {
        heelHeight: 'low',
        heelThickness: 'chunky',
        toeboxShape: 'almond'
      },
      cleanStatus: 'clean' as const,
      state: 'available' as const,
    },
    {
      title: 'Silver Platform Sneakers',
      category: 'shoes' as Category,
      shoeType: 'platforms' as const,
      brand: 'Buffalo',
      sizeText: '8',
      materials: 'Synthetic',
      colorPalette: ['#C0C0C0'],
      attributes: {
        heelHeight: '3 inches',
        heelThickness: 'chunky',
        toeboxShape: 'rounded',
        visualWeight: 'heavy'
      },
      cleanStatus: 'clean' as const,
      state: 'available' as const,
    },

    // ========== ACCESSORIES - All sub-types ==========
    {
      title: 'Black Crossbody Purse',
      category: 'accessories' as Category,
      accessoryType: 'purse' as const,
      brand: 'Urban Outfitters',
      sizeText: 'Small',
      materials: 'Faux Leather',
      colorPalette: ['#000000'],
      attributes: {
        size: 'small',
        structure: 'structured',
        occasion: 'casual'
      },
      cleanStatus: 'clean' as const,
      state: 'available' as const,
    },
    {
      title: 'Canvas Tote Bag',
      category: 'accessories' as Category,
      accessoryType: 'bag' as const,
      brand: 'Baggu',
      sizeText: 'Large',
      materials: 'Canvas',
      colorPalette: ['#F5F5DC'],
      attributes: {
        size: 'large',
        structure: 'unstructured',
        occasion: 'casual'
      },
      cleanStatus: 'clean' as const,
      state: 'available' as const,
    },
    {
      title: 'Black Backpack',
      category: 'accessories' as Category,
      accessoryType: 'backpack' as const,
      brand: 'JanSport',
      sizeText: 'Medium',
      materials: 'Nylon',
      colorPalette: ['#000000'],
      attributes: {
        size: 'medium',
        structure: 'semi-structured',
        occasion: 'casual'
      },
      cleanStatus: 'clean' as const,
      state: 'available' as const,
    },
    {
      title: 'Black Leather Belt',
      category: 'accessories' as Category,
      accessoryType: 'belt' as const,
      brand: 'Levi\'s',
      sizeText: 'M',
      materials: 'Leather',
      colorPalette: ['#000000'],
      attributes: {
        occasion: 'both'
      },
      cleanStatus: 'clean' as const,
      state: 'available' as const,
    },
    {
      title: 'Black Beanie',
      category: 'accessories' as Category,
      accessoryType: 'hat' as const,
      brand: 'Carhartt',
      sizeText: 'One Size',
      materials: 'Acrylic',
      colorPalette: ['#000000'],
      attributes: {
        occasion: 'casual'
      },
      cleanStatus: 'clean' as const,
      state: 'available' as const,
    },
    {
      title: 'Gray Knit Scarf',
      category: 'accessories' as Category,
      accessoryType: 'scarf' as const,
      brand: 'H&M',
      sizeText: 'One Size',
      materials: 'Acrylic',
      colorPalette: ['#808080'],
      attributes: {
        occasion: 'casual'
      },
      cleanStatus: 'clean' as const,
      state: 'available' as const,
    },
    {
      title: 'Black Leather Gloves',
      category: 'accessories' as Category,
      accessoryType: 'gloves' as const,
      brand: 'Isotoner',
      sizeText: 'M',
      materials: 'Leather',
      colorPalette: ['#000000'],
      attributes: {
        occasion: 'formal'
      },
      cleanStatus: 'clean' as const,
      state: 'available' as const,
    },
    {
      title: 'Black Aviator Sunglasses',
      category: 'accessories' as Category,
      accessoryType: 'sunglasses' as const,
      brand: 'Ray-Ban',
      sizeText: 'One Size',
      materials: 'Metal, Glass',
      colorPalette: ['#000000'],
      attributes: {
        occasion: 'casual'
      },
      cleanStatus: 'clean' as const,
      state: 'available' as const,
    },
    {
      title: 'Silver Digital Watch',
      category: 'accessories' as Category,
      accessoryType: 'watch' as const,
      brand: 'Casio',
      sizeText: 'One Size',
      materials: 'Stainless Steel',
      colorPalette: ['#C0C0C0'],
      attributes: {
        occasion: 'casual'
      },
      cleanStatus: 'clean' as const,
      state: 'available' as const,
    },

    // ========== UNDERWEAR & BRAS ==========
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
      title: 'Black Cotton Underwear Pack',
      category: 'underwear_bras' as Category,
      brand: 'Hanes',
      sizeText: 'M',
      materials: 'Cotton',
      colorPalette: ['#000000'],
      attributes: {
        style: 'briefs'
      },
      cleanStatus: 'clean' as const,
      state: 'available' as const,
    },

    // ========== JEWELRY - All sub-types ==========
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
      title: 'Gold Hoop Earrings',
      category: 'jewelry' as Category,
      jewelryType: 'earrings' as const,
      brand: 'H&M',
      sizeText: 'One Size',
      materials: 'Gold-plated',
      colorPalette: ['#FFD700'],
      attributes: {
        metal: 'gold',
        gemstones: false,
        style: 'statement',
        occasion: 'everyday'
      },
      cleanStatus: 'clean' as const,
      state: 'available' as const,
    },
    {
      title: 'Silver Chain Bracelet',
      category: 'jewelry' as Category,
      jewelryType: 'bracelet' as const,
      brand: 'Pandora',
      sizeText: 'One Size',
      materials: 'Silver',
      colorPalette: ['#C0C0C0'],
      attributes: {
        metal: 'silver',
        gemstones: false,
        style: 'delicate',
        occasion: 'everyday'
      },
      cleanStatus: 'clean' as const,
      state: 'available' as const,
    },
    {
      title: 'Silver Skull Ring',
      category: 'jewelry' as Category,
      jewelryType: 'ring' as const,
      brand: 'Hot Topic',
      sizeText: '7',
      materials: 'Silver-plated',
      colorPalette: ['#C0C0C0'],
      attributes: {
        metal: 'silver',
        gemstones: false,
        style: 'chunky',
        occasion: 'everyday'
      },
      cleanStatus: 'clean' as const,
      state: 'available' as const,
    },
    {
      title: 'Gold Anklet',
      category: 'jewelry' as Category,
      jewelryType: 'anklet' as const,
      brand: 'Forever 21',
      sizeText: 'One Size',
      materials: 'Gold-plated',
      colorPalette: ['#FFD700'],
      attributes: {
        metal: 'gold',
        gemstones: false,
        style: 'delicate',
        occasion: 'special'
      },
      cleanStatus: 'clean' as const,
      state: 'available' as const,
    },
    {
      title: 'Vintage Rose Brooch',
      category: 'jewelry' as Category,
      jewelryType: 'brooch' as const,
      brand: 'Vintage',
      sizeText: 'One Size',
      materials: 'Mixed Metals',
      colorPalette: ['#C0C0C0', '#FFD700'],
      attributes: {
        metal: 'mixed',
        gemstones: true,
        style: 'statement',
        occasion: 'formal'
      },
      cleanStatus: 'clean' as const,
      state: 'available' as const,
    },

    // ========== SWIMWEAR ==========
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
      title: 'Blue Floral Bikini',
      category: 'swimwear' as Category,
      brand: 'Target',
      sizeText: 'M',
      materials: 'Nylon, Spandex',
      colorPalette: ['#4A90E2', '#FFFFFF'],
      attributes: {
        style: 'two-piece',
        coverage: 'minimal',
        activity: 'beach'
      },
      cleanStatus: 'clean' as const,
      state: 'available' as const,
    },

    // ========== ACTIVEWEAR ==========
    {
      title: 'Black Compression Leggings',
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
      title: 'Blue Running Tank',
      category: 'activewear' as Category,
      brand: 'Adidas',
      sizeText: 'S',
      materials: 'Polyester',
      colorPalette: ['#4A90E2'],
      attributes: {
        activityType: 'running',
        fit: 'fitted',
        moistureWicking: true,
        visualWeight: 'minimal'
      },
      cleanStatus: 'clean' as const,
      state: 'available' as const,
    },

    // ========== SLEEPWEAR ==========
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
      title: 'Silk Nightgown',
      category: 'sleepwear' as Category,
      brand: 'Victoria\'s Secret',
      sizeText: 'M',
      materials: 'Silk',
      colorPalette: ['#000000'],
      attributes: {
        style: 'nightgown',
        warmth: 'light',
        season: 'summer'
      },
      cleanStatus: 'clean' as const,
      state: 'available' as const,
    },

    // ========== LOUNGEWEAR ==========
    {
      title: 'Oversized Gray Hoodie',
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
      title: 'Black Lounge Set',
      category: 'loungewear' as Category,
      brand: 'Aerie',
      sizeText: 'M',
      materials: 'Cotton, Spandex',
      colorPalette: ['#000000'],
      attributes: {
        comfortLevel: 'relaxed',
        style: 'lounge-set',
        occasion: 'casual-outing'
      },
      cleanStatus: 'clean' as const,
      state: 'available' as const,
    },

    // ========== SUITS & SETS ==========
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
    {
      title: 'Navy Three-Piece Suit',
      category: 'suits_sets' as Category,
      brand: 'Brooks Brothers',
      sizeText: '40R',
      materials: 'Wool',
      colorPalette: ['#000080'],
      attributes: {
        type: 'three-piece',
        formality: 'formal',
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
    console.log(`  ✓ Created: ${item.title} (${item.category}${item.bottomsType ? ` - ${item.bottomsType}` : ''}${item.shoeType ? ` - ${item.shoeType}` : ''}${item.accessoryType ? ` - ${item.accessoryType}` : ''}${item.jewelryType ? ` - ${item.jewelryType}` : ''})`);
  }

  console.log(`\n✨ Successfully seeded ${createdCount} items with comprehensive attribute coverage`);
  
  // Display summary
  console.log('\n📊 Summary by Category:');
  const categoryCount = await prisma.item.groupBy({
    by: ['category'],
    _count: { category: true },
  });
  
  for (const { category, _count } of categoryCount) {
    console.log(`  ${category}: ${_count.category} item(s)`);
  }

  // Display sub-type summary
  console.log('\n📊 Summary by Sub-Type:');
  const bottomsCount = await prisma.item.groupBy({
    by: ['bottomsType'],
    where: { bottomsType: { not: null } },
    _count: { bottomsType: true },
  });
  for (const { bottomsType, _count } of bottomsCount) {
    console.log(`  Bottoms - ${bottomsType}: ${_count.bottomsType} item(s)`);
  }

  const shoesCount = await prisma.item.groupBy({
    by: ['shoeType'],
    where: { shoeType: { not: null } },
    _count: { shoeType: true },
  });
  for (const { shoeType, _count } of shoesCount) {
    console.log(`  Shoes - ${shoeType}: ${_count.shoeType} item(s)`);
  }

  const accessoriesCount = await prisma.item.groupBy({
    by: ['accessoryType'],
    where: { accessoryType: { not: null } },
    _count: { accessoryType: true },
  });
  for (const { accessoryType, _count } of accessoriesCount) {
    console.log(`  Accessories - ${accessoryType}: ${_count.accessoryType} item(s)`);
  }

  const jewelryCount = await prisma.item.groupBy({
    by: ['jewelryType'],
    where: { jewelryType: { not: null } },
    _count: { jewelryType: true },
  });
  for (const { jewelryType, _count } of jewelryCount) {
    console.log(`  Jewelry - ${jewelryType}: ${_count.jewelryType} item(s)`);
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
