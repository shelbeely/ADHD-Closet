/**
 * Comprehensive Database Seed Script
 * 
 * Covers EVERY possible scenario for thorough app testing:
 * - All 13 categories with multiple items each
 * - All sub-types (including "other")
 * - All ItemState values (available, laundry, unavailable, donate)
 * - All CleanStatus values (clean, dirty, needs_wash)
 * - All StorageType values (hanging, folded, drawer, shelf, box, other)
 * - Licensed merchandise (all FranchiseType values)
 * - Generated items (AI color variations)
 * - Wear tracking examples
 * - Tags and tag associations
 * - Outfits with all roles
 * - AI jobs in all states
 * - Image assets
 * - NFC tags and events
 * 
 * Target: 100+ items + comprehensive related data
 * Run with: npm run prisma:seed
 */

import { PrismaClient, Category, ItemState, CleanStatus, StorageType, FranchiseType } from '@prisma/client';
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
  console.log('🌱 Starting COMPREHENSIVE database seeding...');
  console.log('📋 This will create 100+ items covering ALL scenarios\n');

  // Clear existing data
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
  console.log('✅ Existing data cleared\n');

  // PART 1: Create comprehensive items covering all scenarios
  console.log('📦 PART 1: Creating comprehensive items...\n');
  
  const items = [
    // ========== AVAILABLE ITEMS - CLEAN ==========
    // These are the basic items from the original seed
