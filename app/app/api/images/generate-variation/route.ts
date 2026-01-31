import { NextRequest, NextResponse } from 'next/server';
import { getOpenRouterClient } from '@/app/lib/ai/openrouter';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * POST /api/images/generate-variation
 * 
 * Generate variations of an item using reference image for consistency
 * 
 * Body:
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
}

/**
 * GET /api/images/generate-variation
 * Returns API documentation
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/images/generate-variation',
    method: 'POST',
    description: 'Generate variations of an item using reference image for consistency',
    body: {
      referenceImageBase64: 'string (required) - Base64 encoded reference image',
      variationType: 'string (required) - Type of variation: color, seasonal, or pattern',
      parameters: {
        targetColor: 'string (required for color) - Target color name',
        preserveDetails: 'boolean (optional for color) - Preserve graphics/patterns',
        targetSeason: 'string (required for seasonal) - spring, summer, fall, or winter',
        targetPattern: 'string (optional for pattern) - Target pattern description',
      },
    },
    response: {
      success: 'boolean',
      generatedImageUrl: 'string - Generated image URL or base64',
      variationType: 'string',
      parameters: 'object',
    },
    examples: [
      {
        description: 'Generate burgundy color variation',
        body: {
          referenceImageBase64: '...',
          variationType: 'color',
          parameters: {
            targetColor: 'burgundy',
            preserveDetails: true,
          },
        },
      },
      {
        description: 'Generate winter version',
        body: {
          referenceImageBase64: '...',
          variationType: 'seasonal',
          parameters: {
            targetSeason: 'winter',
          },
        },
      },
    ],
  });
}
