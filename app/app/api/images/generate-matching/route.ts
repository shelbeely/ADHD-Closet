import { NextRequest, NextResponse } from 'next/server';
import { getOpenRouterClient } from '@/app/lib/ai/openrouter';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * POST /api/images/generate-matching
 * 
 * Generate matching items that complement a reference piece
 * 
 * Body:
 * {
 *   referenceImageBase64: string,
 *   targetCategory: string,
 *   styleNotes?: string,
 *   matchingType?: 'coordinated-set' | 'complementary-piece'
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      referenceImageBase64, 
      targetCategory, 
      styleNotes,
      matchingType = 'complementary-piece',
      setType = 'two-piece'
    } = body;

    // Validation
    if (!referenceImageBase64) {
      return NextResponse.json(
        { error: 'referenceImageBase64 is required' },
        { status: 400 }
      );
    }

    const openrouter = getOpenRouterClient();
    let generatedImageUrl: string;

    if (matchingType === 'coordinated-set') {
      // Generate a full coordinated set
      if (!['two-piece', 'three-piece', 'complete-outfit'].includes(setType)) {
        return NextResponse.json(
          { error: 'setType must be one of: two-piece, three-piece, complete-outfit' },
          { status: 400 }
        );
      }
      
      generatedImageUrl = await openrouter.generateCoordinatedSet(
        referenceImageBase64,
        setType as 'two-piece' | 'three-piece' | 'complete-outfit'
      );
    } else {
      // Generate a single complementary piece
      if (!targetCategory) {
        return NextResponse.json(
          { error: 'targetCategory is required for complementary-piece matching' },
          { status: 400 }
        );
      }

      generatedImageUrl = await openrouter.generateMatchingItem(
        referenceImageBase64,
        targetCategory,
        styleNotes
      );
    }

    return NextResponse.json({
      success: true,
      generatedImageUrl,
      matchingType,
      targetCategory: matchingType === 'coordinated-set' ? setType : targetCategory,
      styleNotes,
    });

  } catch (error: any) {
    console.error('Error generating matching item:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate matching item' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/images/generate-matching
 * Returns API documentation
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/images/generate-matching',
    method: 'POST',
    description: 'Generate matching items that complement a reference piece',
    body: {
      referenceImageBase64: 'string (required) - Base64 encoded reference image',
      targetCategory: 'string (required for complementary-piece) - Category of item to generate',
      styleNotes: 'string (optional) - Additional style guidance',
      matchingType: 'string (optional) - Type: coordinated-set or complementary-piece (default)',
      setType: 'string (optional for coordinated-set) - two-piece, three-piece, or complete-outfit',
    },
    response: {
      success: 'boolean',
      generatedImageUrl: 'string - Generated image URL or base64',
      matchingType: 'string',
      targetCategory: 'string',
      styleNotes: 'string',
    },
    examples: [
      {
        description: 'Generate matching bottoms for a top',
        body: {
          referenceImageBase64: '...',
          targetCategory: 'bottoms',
          styleNotes: 'Casual, suitable for everyday wear',
        },
      },
      {
        description: 'Generate coordinated two-piece set',
        body: {
          referenceImageBase64: '...',
          matchingType: 'coordinated-set',
          setType: 'two-piece',
        },
      },
      {
        description: 'Generate accessories to match outfit',
        body: {
          referenceImageBase64: '...',
          targetCategory: 'accessories',
          styleNotes: 'Edgy, statement pieces',
        },
      },
    ],
  });
}
