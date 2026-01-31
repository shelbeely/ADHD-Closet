import { NextRequest, NextResponse } from 'next/server';
import { getOpenRouterClient } from '@/app/lib/ai/openrouter';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * POST /api/images/outfit-context
 * 
 * Generate outfit variations for different contexts/occasions
 * 
 * Body:
 * {
 *   itemsBase64: Array<{ id: string; base64: string; category: string }>,
 *   targetContext: string,
 *   maintainPieces?: string[]  // IDs of pieces to keep unchanged
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      itemsBase64,
      targetContext,
      maintainPieces = []
    } = body;

    // Validation
    if (!itemsBase64 || !Array.isArray(itemsBase64) || itemsBase64.length === 0) {
      return NextResponse.json(
        { error: 'itemsBase64 array is required and must not be empty' },
        { status: 400 }
      );
    }

    if (!targetContext) {
      return NextResponse.json(
        { error: 'targetContext is required (e.g., "formal dinner", "beach day", "job interview")' },
        { status: 400 }
      );
    }

    // Validate items structure
    for (const item of itemsBase64) {
      if (!item.id || !item.base64 || !item.category) {
        return NextResponse.json(
          { error: 'Each item must have id, base64, and category fields' },
          { status: 400 }
        );
      }
    }

    const openrouter = getOpenRouterClient();
    const generatedImageUrl = await openrouter.generateOutfitContextVariation(
      itemsBase64,
      targetContext,
      maintainPieces
    );

    return NextResponse.json({
      success: true,
      generatedImageUrl,
      targetContext,
      originalItemCount: itemsBase64.length,
      maintainedPieces: maintainPieces,
    });

  } catch (error: any) {
    console.error('Error generating context variation:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate context variation' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/images/outfit-context
 * Returns API documentation
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/images/outfit-context',
    method: 'POST',
    description: 'Generate outfit variations for different contexts/occasions using reference items',
    body: {
      itemsBase64: 'array (required) - Array of items with { id, base64, category }',
      targetContext: 'string (required) - Target occasion/setting (e.g., "formal dinner", "casual brunch")',
      maintainPieces: 'array (optional) - Array of item IDs to keep unchanged',
    },
    response: {
      success: 'boolean',
      generatedImageUrl: 'string - Generated outfit visualization',
      targetContext: 'string',
      originalItemCount: 'number',
      maintainedPieces: 'array',
    },
    contexts: {
      formal: ['job interview', 'formal dinner', 'wedding guest', 'business meeting'],
      casual: ['coffee date', 'weekend brunch', 'shopping trip', 'study session'],
      special: ['concert', 'date night', 'party', 'festival'],
      weather: ['rainy day', 'summer heat', 'winter cold', 'windy day'],
      activities: ['gym workout', 'yoga class', 'hiking', 'beach day'],
    },
    examples: [
      {
        description: 'Adapt casual outfit for job interview',
        body: {
          itemsBase64: [
            { id: '1', base64: '...', category: 'tops' },
            { id: '2', base64: '...', category: 'bottoms' },
          ],
          targetContext: 'job interview',
          maintainPieces: ['1'], // Keep the top
        },
      },
      {
        description: 'Transform outfit for concert',
        body: {
          itemsBase64: [
            { id: '1', base64: '...', category: 'tops' },
            { id: '2', base64: '...', category: 'bottoms' },
            { id: '3', base64: '...', category: 'shoes' },
          ],
          targetContext: 'rock concert',
        },
      },
    ],
  });
}
