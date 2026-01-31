// API endpoint for visual similarity search
// POST /api/vision/similarity

import { NextRequest, NextResponse } from 'next/server';
import {
  findSimilarByImage,
  findDuplicates,
  validateImageBase64,
  dataUrlToBase64
} from '@/app/lib/ai/visionEnhancements';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      imageBase64,
      candidateItems,
      mode = 'similarity', // 'similarity' or 'duplicates'
      threshold = 0.6,
      limit = 5,
      sameCategory = false
    } = body;

    // Validate input
    if (!imageBase64) {
      return NextResponse.json(
        { error: 'imageBase64 is required' },
        { status: 400 }
      );
    }

    if (!candidateItems || !Array.isArray(candidateItems)) {
      return NextResponse.json(
        { error: 'candidateItems array is required' },
        { status: 400 }
      );
    }

    // Convert data URLs to base64
    const cleanTargetImage = imageBase64.startsWith('data:')
      ? dataUrlToBase64(imageBase64)
      : imageBase64;

    const cleanCandidates = candidateItems.map((item: any) => ({
      ...item,
      imageBase64: item.imageBase64.startsWith('data:')
        ? dataUrlToBase64(item.imageBase64)
        : item.imageBase64
    }));

    // Validate images
    if (!validateImageBase64(cleanTargetImage)) {
      return NextResponse.json(
        { error: 'Invalid target image format' },
        { status: 400 }
      );
    }

    try {
      if (mode === 'duplicates') {
        // Find duplicates (high threshold)
        const duplicates = await findDuplicates(cleanTargetImage, cleanCandidates);
        
        return NextResponse.json({
          success: true,
          mode: 'duplicates',
          count: duplicates.length,
          duplicates,
          timestamp: new Date().toISOString()
        });
      } else {
        // Find similar items
        const similarItems = await findSimilarByImage(
          cleanTargetImage,
          cleanCandidates,
          { threshold, limit, sameCategory }
        );

        return NextResponse.json({
          success: true,
          mode: 'similarity',
          count: similarItems.length,
          similarItems,
          timestamp: new Date().toISOString()
        });
      }

    } catch (searchError: any) {
      console.error('Similarity search error:', searchError);
      return NextResponse.json(
        {
          error: 'Search failed',
          message: searchError.message,
          details: 'The vision model encountered an error during search'
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      {
        error: 'Server error',
        message: error.message
      },
      { status: 500 }
    );
  }
}

// GET endpoint for API documentation
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/vision/similarity',
    method: 'POST',
    description: 'Visual similarity search and duplicate detection',
    parameters: {
      imageBase64: {
        type: 'string',
        required: true,
        description: 'Base64 encoded target image'
      },
      candidateItems: {
        type: 'array',
        required: true,
        description: 'Array of items with id and imageBase64'
      },
      mode: {
        type: 'string',
        required: false,
        default: 'similarity',
        options: ['similarity', 'duplicates'],
        description: 'Search mode'
      },
      threshold: {
        type: 'number',
        required: false,
        default: 0.6,
        range: '0.0-1.0',
        description: 'Similarity threshold (0.85+ for duplicates)'
      },
      limit: {
        type: 'number',
        required: false,
        default: 5,
        description: 'Maximum number of results'
      },
      sameCategory: {
        type: 'boolean',
        required: false,
        default: false,
        description: 'Only search within same category'
      }
    },
    example: {
      request: {
        imageBase64: 'data:image/jpeg;base64,/9j/4AAQ...',
        candidateItems: [
          {
            id: 'item-1',
            imageBase64: 'data:image/jpeg;base64,/9j/4AAQ...',
            category: 'tops'
          },
          {
            id: 'item-2',
            imageBase64: 'data:image/jpeg;base64,/9j/4AAQ...',
            category: 'tops'
          }
        ],
        mode: 'similarity',
        threshold: 0.7,
        limit: 5
      },
      response: {
        success: true,
        mode: 'similarity',
        count: 2,
        similarItems: [
          {
            itemId: 'item-1',
            score: 0.89,
            reasons: ['similar color', 'similar style', 'matching silhouette'],
            colorMatch: 0.92,
            styleMatch: 0.88,
            silhouetteMatch: 0.87
          },
          {
            itemId: 'item-2',
            score: 0.73,
            reasons: ['complementary colors', 'compatible style'],
            colorMatch: 0.68,
            styleMatch: 0.79,
            silhouetteMatch: 0.72
          }
        ],
        timestamp: '2026-01-31T06:42:00.000Z'
      }
    },
    modes: {
      similarity: 'Find visually similar items (threshold: 0.6-0.8)',
      duplicates: 'Find potential duplicates (threshold: 0.85+)'
    },
    useCases: [
      'Find items like this one',
      'Discover forgotten similar items',
      'Detect duplicate uploads',
      'Style consistency checking',
      'Alternative item suggestions'
    ]
  });
}
