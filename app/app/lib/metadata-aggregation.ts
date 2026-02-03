/**
 * Metadata Aggregation Service
 * 
 * Safely aggregates non-sensitive clothing metadata for analytics
 * and B2B insights. All queries enforce minimum user thresholds
 * to prevent re-identification.
 * 
 * Non-sensitive metadata includes:
 * - Clothing types (tops, bottoms, dresses, etc.)
 * - Brands (Nike, Zara, H&M, etc.)
 * - Colors (from color_palette field)
 * - Materials (cotton, polyester, wool, etc.)
 * - Seasons (spring/summer, fall/winter)
 * - Categories (workwear, casual, formal)
 * 
 * All aggregations require minimum user thresholds to ensure k-anonymity.
 */

import { prisma } from '@/app/lib/prisma';
import { config } from '@/app/lib/config';
import crypto from 'crypto';

// Minimum user thresholds for different data types
const MIN_USERS_THRESHOLD = 100; // Standard for most aggregations
const MIN_USERS_SMALL_GROUP = 50; // Minimum for basic category stats
const MIN_USERS_BEHAVIORAL = 200; // Higher threshold for behavioral data

export interface BrandPopularity {
  brand: string;
  itemCount: number;
  userCount: number;
  percentage: number;
}

export interface ColorTrend {
  color: string;
  frequency: number;
  trending: 'up' | 'down' | 'stable';
  changePercent: number;
}

export interface CategoryDistribution {
  category: string;
  itemCount: number;
  percentage: number;
}

export interface MaterialPreference {
  material: string;
  count: number;
  percentage: number;
}

export interface SeasonalWearPattern {
  month: number;
  category: string;
  wearCount: number;
}

/**
 * Get brand popularity rankings
 * Only includes brands with sufficient user count
 */
export async function getBrandPopularity(
  options: {
    category?: string;
    minUsers?: number;
    limit?: number;
  } = {}
): Promise<BrandPopularity[]> {
  const { category, minUsers = MIN_USERS_THRESHOLD, limit = 50 } = options;
  
  if (!config.isHosted()) {
    throw new Error('Metadata aggregation only available in hosted mode');
  }
  
  // Build dynamic query with optional category filter
  const categoryFilter = category ? `AND category = '${category}'` : '';
  
  const results = await prisma.$queryRawUnsafe<any[]>(`
    SELECT 
      brand,
      COUNT(*) as item_count,
      COUNT(DISTINCT user_id) as user_count,
      COUNT(*) * 100.0 / SUM(COUNT(*)) OVER () as percentage
    FROM items
    WHERE brand IS NOT NULL
      AND user_id IS NOT NULL
      ${categoryFilter}
    GROUP BY brand
    HAVING COUNT(DISTINCT user_id) >= ${minUsers}
    ORDER BY item_count DESC
    LIMIT ${limit}
  `);
  
  return results.map(r => ({
    brand: r.brand,
    itemCount: Number(r.item_count),
    userCount: Number(r.user_count),
    percentage: parseFloat(Number(r.percentage).toFixed(2)),
  }));
}

/**
 * Get color trends over time
 * Analyzes primary colors from color_palette JSON field
 */
export async function getColorTrends(
  options: {
    category?: string;
    minUsers?: number;
    limit?: number;
  } = {}
): Promise<ColorTrend[]> {
  const { category, minUsers = MIN_USERS_THRESHOLD, limit = 30 } = options;
  
  if (!config.isHosted()) {
    throw new Error('Metadata aggregation only available in hosted mode');
  }
  
  const categoryFilter = category ? `AND category = '${category}'` : '';
  
  // Get current period colors (last 3 months)
  const currentResults = await prisma.$queryRawUnsafe<any[]>(`
    SELECT 
      color_palette->>'$[0]' as primary_color,
      COUNT(*) as frequency,
      COUNT(DISTINCT user_id) as user_count
    FROM items
    WHERE color_palette IS NOT NULL
      AND user_id IS NOT NULL
      AND created_at >= NOW() - INTERVAL '3 months'
      ${categoryFilter}
    GROUP BY color_palette->>'$[0]'
    HAVING COUNT(DISTINCT user_id) >= ${minUsers}
    ORDER BY frequency DESC
    LIMIT ${limit}
  `);
  
  // Get previous period for trend calculation (3-6 months ago)
  const previousResults = await prisma.$queryRawUnsafe<any[]>(`
    SELECT 
      color_palette->>'$[0]' as primary_color,
      COUNT(*) as frequency
    FROM items
    WHERE color_palette IS NOT NULL
      AND user_id IS NOT NULL
      AND created_at >= NOW() - INTERVAL '6 months'
      AND created_at < NOW() - INTERVAL '3 months'
      ${categoryFilter}
    GROUP BY color_palette->>'$[0]'
    HAVING COUNT(DISTINCT user_id) >= ${minUsers}
  `);
  
  // Calculate trends
  const previousMap = new Map(
    previousResults.map(r => [r.primary_color, Number(r.frequency)])
  );
  
  return currentResults.map(r => {
    const currentFreq = Number(r.frequency);
    const previousFreq = previousMap.get(r.primary_color) || 0;
    const changePercent = previousFreq > 0 
      ? ((currentFreq - previousFreq) / previousFreq) * 100 
      : 100;
    
    let trending: 'up' | 'down' | 'stable' = 'stable';
    if (changePercent > 10) trending = 'up';
    if (changePercent < -10) trending = 'down';
    
    return {
      color: r.primary_color,
      frequency: currentFreq,
      trending,
      changePercent: Math.round(changePercent),
    };
  }).sort((a, b) => b.frequency - a.frequency);
}

/**
 * Get category distribution across all users
 */
export async function getCategoryDistribution(
  minUsers: number = MIN_USERS_SMALL_GROUP
): Promise<CategoryDistribution[]> {
  if (!config.isHosted()) {
    throw new Error('Metadata aggregation only available in hosted mode');
  }
  
  const results = await prisma.$queryRawUnsafe<any[]>(`
    SELECT 
      category,
      COUNT(*) as item_count,
      COUNT(*) * 100.0 / SUM(COUNT(*)) OVER () as percentage
    FROM items
    WHERE category IS NOT NULL
      AND user_id IS NOT NULL
    GROUP BY category
    HAVING COUNT(DISTINCT user_id) >= ${minUsers}
    ORDER BY item_count DESC
  `);
  
  return results.map(r => ({
    category: r.category,
    itemCount: Number(r.item_count),
    percentage: parseFloat(Number(r.percentage).toFixed(2)),
  }));
}

/**
 * Get material preferences
 */
export async function getMaterialPreferences(
  options: {
    category?: string;
    minUsers?: number;
    limit?: number;
  } = {}
): Promise<MaterialPreference[]> {
  const { category, minUsers = MIN_USERS_THRESHOLD, limit = 30 } = options;
  
  if (!config.isHosted()) {
    throw new Error('Metadata aggregation only available in hosted mode');
  }
  
  const categoryFilter = category ? `AND category = '${category}'` : '';
  
  const results = await prisma.$queryRawUnsafe<any[]>(`
    SELECT 
      materials,
      COUNT(*) as count,
      COUNT(*) * 100.0 / SUM(COUNT(*)) OVER () as percentage
    FROM items
    WHERE materials IS NOT NULL
      AND user_id IS NOT NULL
      ${categoryFilter}
    GROUP BY materials
    HAVING COUNT(DISTINCT user_id) >= ${minUsers}
    ORDER BY count DESC
    LIMIT ${limit}
  `);
  
  return results.map(r => ({
    material: r.materials,
    count: Number(r.count),
    percentage: parseFloat(Number(r.percentage).toFixed(2)),
  }));
}

/**
 * Get seasonal wear patterns
 * Analyzes when items are actually worn (not just owned)
 */
export async function getSeasonalWearPatterns(
  minUsers: number = MIN_USERS_BEHAVIORAL
): Promise<SeasonalWearPattern[]> {
  if (!config.isHosted()) {
    throw new Error('Metadata aggregation only available in hosted mode');
  }
  
  const results = await prisma.$queryRawUnsafe<any[]>(`
    SELECT 
      EXTRACT(MONTH FROM last_worn_date)::integer as month,
      category,
      COUNT(*) as wear_count,
      COUNT(DISTINCT user_id) as user_count
    FROM items
    WHERE last_worn_date IS NOT NULL
      AND user_id IS NOT NULL
      AND last_worn_date >= NOW() - INTERVAL '1 year'
    GROUP BY EXTRACT(MONTH FROM last_worn_date), category
    HAVING COUNT(DISTINCT user_id) >= ${minUsers}
    ORDER BY month, wear_count DESC
  `);
  
  return results.map(r => ({
    month: Number(r.month),
    category: r.category,
    wearCount: Number(r.wear_count),
  }));
}

/**
 * Get wardrobe composition statistics
 * Shows average distribution of items across categories
 */
export async function getWardrobeComposition(
  minUsers: number = MIN_USERS_THRESHOLD
): Promise<{
  category: string;
  avgItemsPerUser: number;
  medianItemsPerUser: number;
  userCount: number;
}[]> {
  if (!config.isHosted()) {
    throw new Error('Metadata aggregation only available in hosted mode');
  }
  
  const results = await prisma.$queryRawUnsafe<any[]>(`
    WITH user_category_counts AS (
      SELECT 
        user_id,
        category,
        COUNT(*) as item_count
      FROM items
      WHERE category IS NOT NULL
        AND user_id IS NOT NULL
      GROUP BY user_id, category
    )
    SELECT 
      category,
      AVG(item_count) as avg_items_per_user,
      PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY item_count) as median_items_per_user,
      COUNT(DISTINCT user_id) as user_count
    FROM user_category_counts
    GROUP BY category
    HAVING COUNT(DISTINCT user_id) >= ${minUsers}
    ORDER BY avg_items_per_user DESC
  `);
  
  return results.map(r => ({
    category: r.category,
    avgItemsPerUser: parseFloat(Number(r.avg_items_per_user).toFixed(1)),
    medianItemsPerUser: parseFloat(Number(r.median_items_per_user).toFixed(1)),
    userCount: Number(r.user_count),
  }));
}

/**
 * Generate comprehensive B2B fashion intelligence report
 * All data is aggregated and anonymized
 */
export async function generateFashionIntelligenceReport(
  options: {
    startDate?: Date;
    endDate?: Date;
    category?: string;
    includeSeasonalData?: boolean;
  } = {}
): Promise<{
  reportId: string;
  generatedAt: Date;
  userCount: number;
  itemCount: number;
  brands: BrandPopularity[];
  colors: ColorTrend[];
  categories: CategoryDistribution[];
  materials: MaterialPreference[];
  wardrobeComposition: any[];
  seasonalPatterns?: SeasonalWearPattern[];
  disclaimer: string;
  dataQuality: {
    sufficientData: boolean;
    minimumUsersMet: boolean;
    userCount: number;
    itemCount: number;
  };
}> {
  if (!config.isHosted()) {
    throw new Error('Fashion intelligence reports only available in hosted mode');
  }
  
  // Count total users and items in dataset
  const [userCount, itemCount] = await Promise.all([
    prisma.user.count({ where: { isHostedUser: true } }),
    prisma.item.count({ where: { userId: { not: null } } }),
  ]);
  
  // Ensure minimum dataset size
  const sufficientData = userCount >= MIN_USERS_THRESHOLD;
  
  if (!sufficientData) {
    return {
      reportId: crypto.randomUUID(),
      generatedAt: new Date(),
      userCount,
      itemCount,
      brands: [],
      colors: [],
      categories: [],
      materials: [],
      wardrobeComposition: [],
      disclaimer: `Insufficient data for report generation. Need ${MIN_USERS_THRESHOLD}+ users, currently have ${userCount}.`,
      dataQuality: {
        sufficientData: false,
        minimumUsersMet: false,
        userCount,
        itemCount,
      },
    };
  }
  
  // Generate aggregated insights
  const [brands, colors, categories, materials, wardrobeComposition] = await Promise.all([
    getBrandPopularity({ category: options.category }),
    getColorTrends({ category: options.category }),
    getCategoryDistribution(),
    getMaterialPreferences({ category: options.category }),
    getWardrobeComposition(),
  ]);
  
  // Optionally include seasonal data (requires more users)
  let seasonalPatterns: SeasonalWearPattern[] | undefined;
  if (options.includeSeasonalData && userCount >= MIN_USERS_BEHAVIORAL) {
    seasonalPatterns = await getSeasonalWearPatterns();
  }
  
  return {
    reportId: crypto.randomUUID(),
    generatedAt: new Date(),
    userCount,
    itemCount,
    brands,
    colors,
    categories,
    materials,
    wardrobeComposition,
    seasonalPatterns,
    disclaimer: `This report contains aggregated, anonymized data from ${userCount} users and ${itemCount} items. No individual user data is included. All statistics represent groups of ${MIN_USERS_THRESHOLD}+ users unless otherwise noted. This data cannot be used to identify individual users and complies with GDPR/CCPA anonymization requirements.`,
    dataQuality: {
      sufficientData: true,
      minimumUsersMet: true,
      userCount,
      itemCount,
    },
  };
}

/**
 * Get brand performance comparison
 * Useful for brand benchmarking reports
 */
export async function getBrandPerformanceComparison(
  targetBrand: string,
  category?: string,
  minUsers: number = MIN_USERS_THRESHOLD
): Promise<{
  brand: string;
  marketShare: number;
  retentionRate: number;
  avgItemsPerUser: number;
  competitorComparison: {
    brand: string;
    marketShare: number;
    relativeDifference: number;
  }[];
} | null> {
  if (!config.isHosted()) {
    throw new Error('Brand performance analysis only available in hosted mode');
  }
  
  // Get all brand data for comparison
  const allBrands = await getBrandPopularity({ category, minUsers });
  
  const targetBrandData = allBrands.find(b => 
    b.brand.toLowerCase() === targetBrand.toLowerCase()
  );
  
  if (!targetBrandData) {
    return null; // Brand not found or insufficient data
  }
  
  // Calculate retention rate (items still in active rotation vs purchased)
  const categoryFilter = category ? `AND category = '${category}'` : '';
  const retentionData = await prisma.$queryRawUnsafe<any[]>(`
    SELECT 
      COUNT(*) FILTER (WHERE state = 'available') * 100.0 / COUNT(*) as retention_rate,
      COUNT(*) / COUNT(DISTINCT user_id) as avg_items_per_user
    FROM items
    WHERE brand ILIKE '${targetBrand}'
      AND user_id IS NOT NULL
      ${categoryFilter}
    HAVING COUNT(DISTINCT user_id) >= ${minUsers}
  `);
  
  const retentionRate = retentionData.length > 0 
    ? parseFloat(Number(retentionData[0].retention_rate).toFixed(2))
    : 0;
  
  const avgItemsPerUser = retentionData.length > 0
    ? parseFloat(Number(retentionData[0].avg_items_per_user).toFixed(1))
    : 0;
  
  // Top 5 competitors for comparison
  const competitorComparison = allBrands
    .filter(b => b.brand.toLowerCase() !== targetBrand.toLowerCase())
    .slice(0, 5)
    .map(competitor => ({
      brand: competitor.brand,
      marketShare: competitor.percentage,
      relativeDifference: parseFloat(
        (targetBrandData.percentage - competitor.percentage).toFixed(2)
      ),
    }));
  
  return {
    brand: targetBrandData.brand,
    marketShare: targetBrandData.percentage,
    retentionRate,
    avgItemsPerUser,
    competitorComparison,
  };
}
