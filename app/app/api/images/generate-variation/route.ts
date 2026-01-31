import { NextRequest, NextResponse } from 'next/server';
import { getOpenRouterClient } from '@/app/lib/ai/openrouter';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * POST /api/images/generate-variation
 * 
 * FEATURE DISABLED (2026-01-31)
 * User requested: "I don't want ai recolored clothing at all"
 * 
 * This endpoint now returns 403 Forbidden. Original implementation
 * has been preserved in comments for future reference if needed.
 * 
 * Original purpose:
 * Generate variations of an item using reference image for consistency
 * 
 * Body (no longer accepted):
 * {
 *   referenceImageBase64: string,
 *   variationType: 'color' | 'seasonal' | 'pattern',
 *   parameters: {
 *     targetColor?: string,        // For color variation
 *     preserveDetails?: boolean,   // For color variation
 *     targetSeason?: string,       // For seasonal variation
 *     targetPattern?: string       // For pattern variation
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  // FEATURE DISABLED: User doesn't want AI-recolored clothing at all
  return NextResponse.json(
    { 
      error: 'AI color variation feature has been disabled',
      message: 'This feature is no longer available. The user has requested that AI-recolored clothing not be generated.',
      disabledAt: new Date().toISOString()
    },
    { status: 403 } // 403 Forbidden - feature intentionally disabled
  );

  /* ORIGINAL CODE PRESERVED FOR REFERENCE:
  try {
    const body = await request.json();
    const { referenceImageBase64, variationType, parameters = {} } = body;

    // Validation
    if (!referenceImageBase64) {
      return NextResponse.json(
        { error: 'referenceImageBase64 is required' },
        { status: 400 }
      );
    }

    if (!variationType) {
      return NextResponse.json(
        { error: 'variationType is required (color, seasonal, or pattern)' },
        { status: 400 }
      );
    }

    const openrouter = getOpenRouterClient();
    let generatedImageUrl: string;

    switch (variationType) {
      case 'color':
        if (!parameters.targetColor) {
          return NextResponse.json(
            { error: 'targetColor is required for color variation' },
            { status: 400 }
          );
        }
        generatedImageUrl = await openrouter.generateColorVariation(
          referenceImageBase64,
          parameters.targetColor,
          parameters.preserveDetails ?? true
        );
        break;

      case 'seasonal':
        if (!parameters.targetSeason) {
          return NextResponse.json(
            { error: 'targetSeason is required for seasonal variation' },
            { status: 400 }
          );
        }
        if (!['spring', 'summer', 'fall', 'winter'].includes(parameters.targetSeason)) {
          return NextResponse.json(
            { error: 'targetSeason must be one of: spring, summer, fall, winter' },
            { status: 400 }
          );
        }
        generatedImageUrl = await openrouter.generateSeasonalVariation(
          referenceImageBase64,
          parameters.targetSeason as 'spring' | 'summer' | 'fall' | 'winter'
        );
        break;

      case 'pattern':
        // For now, use color variation with pattern preservation
        generatedImageUrl = await openrouter.generateColorVariation(
          referenceImageBase64,
          parameters.targetColor || 'keep same color',
          false // Don't preserve details to allow pattern change
        );
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid variationType. Must be: color, seasonal, or pattern' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      generatedImageUrl,
      variationType,
      parameters,
    });

  } catch (error: any) {
    console.error('Error generating variation:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate variation' },
      { status: 500 }
    );
  }
  */
}

/**
 * GET /api/images/generate-variation
 * Returns API documentation (FEATURE DISABLED)
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/images/generate-variation',
    status: 'DISABLED',
    reason: 'User requested that AI-recolored clothing not be generated at all',
    disabledAt: '2026-01-31',
    message: 'This feature has been intentionally disabled and will return 403 Forbidden on POST requests.',
    note: 'The original implementation has been preserved in comments for future reference if needed.',
  });
}
