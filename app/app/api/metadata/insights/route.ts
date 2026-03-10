/**
 * Metadata Insights API
 * 
 * Provides aggregated, anonymized clothing metadata for B2B fashion intelligence.
 * All endpoints enforce minimum user thresholds to ensure privacy.
 * 
 * Available endpoints:
 * - GET /api/metadata/insights?type=brands
 * - GET /api/metadata/insights?type=colors
 * - GET /api/metadata/insights?type=categories
 * - GET /api/metadata/insights?type=materials
 * - GET /api/metadata/insights?type=seasonal
 * - GET /api/metadata/insights?type=full-report
 */

import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/app/lib/config';
import {
  getBrandPopularity,
  getColorTrends,
  getCategoryDistribution,
  getMaterialPreferences,
  getSeasonalWearPatterns,
  getWardrobeComposition,
  generateFashionIntelligenceReport,
  getBrandPerformanceComparison,
} from '@/app/lib/metadata-aggregation';

export const dynamic = 'force-dynamic';

/**
 * GET /api/metadata/insights
 * 
 * Query params:
 * - type: brands | colors | categories | materials | seasonal | composition | full-report | brand-performance
 * - category: optional category filter
 * - brand: required for brand-performance type
 */
export async function GET(request: NextRequest) {
  // Only available in hosted mode
  if (!config.isHosted()) {
    return NextResponse.json(
      { error: 'Metadata insights only available in hosted mode' },
      { status: 403 }
    );
  }
  
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type') || 'full-report';
  const category = searchParams.get('category') || undefined;
  const brand = searchParams.get('brand') || undefined;
  
  try {
    let data;
    
    switch (type) {
      case 'brands':
        data = await getBrandPopularity({ category });
        break;
      
      case 'colors':
        data = await getColorTrends({ category });
        break;
      
      case 'categories':
        data = await getCategoryDistribution();
        break;
      
      case 'materials':
        data = await getMaterialPreferences({ category });
        break;
      
      case 'seasonal':
        data = await getSeasonalWearPatterns();
        break;
      
      case 'composition':
        data = await getWardrobeComposition();
        break;
      
      case 'brand-performance':
        if (!brand) {
          return NextResponse.json(
            { error: 'Brand parameter required for brand-performance type' },
            { status: 400 }
          );
        }
        data = await getBrandPerformanceComparison(brand, category);
        if (!data) {
          return NextResponse.json(
            { error: 'Brand not found or insufficient data (100+ users required)' },
            { status: 404 }
          );
        }
        break;
      
      case 'full-report':
        data = await generateFashionIntelligenceReport({
          category,
          includeSeasonalData: true,
        });
        break;
      
      default:
        return NextResponse.json(
          { error: 'Invalid type parameter. Must be: brands, colors, categories, materials, seasonal, composition, brand-performance, or full-report' },
          { status: 400 }
        );
    }
    
    return NextResponse.json({
      success: true,
      type,
      data,
      disclaimer: 'All data is aggregated and anonymized. Minimum 100 users per statistic. No individual user data is included.',
    });
    
  } catch (error) {
    console.error('Metadata insights error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate insights',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
