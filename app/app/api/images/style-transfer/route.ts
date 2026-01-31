import { NextRequest, NextResponse } from 'next/server';
import { getOpenRouterClient } from '@/app/lib/ai/openrouter';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * POST /api/images/style-transfer
 * 
 * Apply style/aesthetic from a reference image to an item
 * 
 * Body:
 * {
 *   itemImageBase64: string,
 *   styleReferenceBase64: string,
 *   transferStrength?: number  // 0.3-0.9, default 0.6
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      itemImageBase64, 
      styleReferenceBase64,
      transferStrength = 0.6 
    } = body;

    // Validation
    if (!itemImageBase64) {
      return NextResponse.json(
        { error: 'itemImageBase64 is required' },
        { status: 400 }
      );
    }

    if (!styleReferenceBase64) {
      return NextResponse.json(
        { error: 'styleReferenceBase64 is required' },
        { status: 400 }
      );
    }

    if (transferStrength < 0.3 || transferStrength > 0.9) {
      return NextResponse.json(
        { error: 'transferStrength must be between 0.3 and 0.9' },
        { status: 400 }
      );
    }

    const openrouter = getOpenRouterClient();
    const generatedImageUrl = await openrouter.applyStyleTransfer(
      itemImageBase64,
      styleReferenceBase64,
      transferStrength
    );

    return NextResponse.json({
      success: true,
      generatedImageUrl,
      transferStrength,
      strengthLevel: transferStrength < 0.5 
        ? 'subtle' 
        : transferStrength < 0.7 
          ? 'moderate' 
          : 'strong',
    });

  } catch (error: any) {
    console.error('Error applying style transfer:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to apply style transfer' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/images/style-transfer
 * Returns API documentation
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/images/style-transfer',
    method: 'POST',
    description: 'Apply style/aesthetic from a reference image to an item',
    body: {
      itemImageBase64: 'string (required) - Base64 encoded item image to transform',
      styleReferenceBase64: 'string (required) - Base64 encoded reference with desired style',
      transferStrength: 'number (optional) - Strength of transformation (0.3-0.9, default 0.6)',
    },
    response: {
      success: 'boolean',
      generatedImageUrl: 'string - Generated image URL or base64',
      transferStrength: 'number',
      strengthLevel: 'string - subtle, moderate, or strong',
    },
    strengthGuide: {
      '0.3-0.4': 'Subtle - Light inspiration from style reference',
      '0.5-0.6': 'Moderate - Balanced transformation',
      '0.7-0.9': 'Strong - Heavy transformation matching style reference',
    },
    examples: [
      {
        description: 'Apply cottagecore aesthetic to item',
        body: {
          itemImageBase64: '...',
          styleReferenceBase64: '...',  // Cottagecore mood board
          transferStrength: 0.7,
        },
      },
      {
        description: 'Subtle inspiration from cyberpunk aesthetic',
        body: {
          itemImageBase64: '...',
          styleReferenceBase64: '...',  // Cyberpunk reference
          transferStrength: 0.4,
        },
      },
    ],
  });
}
