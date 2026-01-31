// API endpoint for virtual try-on
// POST /api/vision/try-on

import { NextRequest, NextResponse } from 'next/server';
import {
  overlayOutfitOnPhoto,
  detectBodyType,
  validateImageBase64,
  dataUrlToBase64
} from '@/app/lib/ai/visionEnhancements';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userPhotoBase64, outfitItems, bodyType = 'auto-detect' } = body;

    // Validate input
    if (!userPhotoBase64) {
      return NextResponse.json(
        { error: 'userPhotoBase64 is required' },
        { status: 400 }
      );
    }

    if (!outfitItems || !Array.isArray(outfitItems) || outfitItems.length === 0) {
      return NextResponse.json(
        { error: 'outfitItems array is required and must not be empty' },
        { status: 400 }
      );
    }

    // Convert data URLs to base64
    const cleanUserPhoto = userPhotoBase64.startsWith('data:')
      ? dataUrlToBase64(userPhotoBase64)
      : userPhotoBase64;

    const cleanOutfitItems = outfitItems.map((item: any) => ({
      ...item,
      imageBase64: item.imageBase64.startsWith('data:')
        ? dataUrlToBase64(item.imageBase64)
        : item.imageBase64
    }));

    // Validate images
    if (!validateImageBase64(cleanUserPhoto)) {
      return NextResponse.json(
        { error: 'Invalid user photo format' },
        { status: 400 }
      );
    }

    for (const item of cleanOutfitItems) {
      if (!validateImageBase64(item.imageBase64)) {
        return NextResponse.json(
          { error: `Invalid image format for ${item.category}` },
          { status: 400 }
        );
      }
    }

    try {
      // Detect body type if auto-detect is enabled
      let bodyTypeAnalysis;
      if (bodyType === 'auto-detect') {
        console.log('Detecting body type...');
        bodyTypeAnalysis = await detectBodyType(cleanUserPhoto);
      }

      // Generate virtual try-on
      console.log('Generating virtual try-on...');
      const resultImage = await overlayOutfitOnPhoto(
        cleanUserPhoto,
        cleanOutfitItems,
        bodyTypeAnalysis
      );

      return NextResponse.json({
        success: true,
        resultImage,
        bodyType: bodyTypeAnalysis,
        timestamp: new Date().toISOString()
      });

    } catch (tryOnError: any) {
      console.error('Virtual try-on error:', tryOnError);
      return NextResponse.json(
        {
          error: 'Try-on failed',
          message: tryOnError.message,
          details: 'The vision model encountered an error generating the try-on'
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
    endpoint: '/api/vision/try-on',
    method: 'POST',
    description: 'Virtual try-on: overlay outfit on user photo',
    parameters: {
      userPhotoBase64: {
        type: 'string',
        required: true,
        description: 'Base64 encoded photo of the user'
      },
      outfitItems: {
        type: 'array',
        required: true,
        description: 'Array of outfit items with imageBase64 and category'
      },
      bodyType: {
        type: 'string',
        required: false,
        default: 'auto-detect',
        options: ['auto-detect', 'slim', 'average', 'athletic', 'curvy', 'plus'],
        description: 'Body type for better fit visualization'
      }
    },
    example: {
      request: {
        userPhotoBase64: 'data:image/jpeg;base64,/9j/4AAQ...',
        outfitItems: [
          {
            imageBase64: 'data:image/jpeg;base64,/9j/4AAQ...',
            category: 'tops'
          },
          {
            imageBase64: 'data:image/jpeg;base64,/9j/4AAQ...',
            category: 'bottoms'
          }
        ],
        bodyType: 'auto-detect'
      },
      response: {
        success: true,
        resultImage: 'https://... or base64',
        bodyType: {
          type: 'average',
          proportions: {
            shoulders: 'average',
            waist: 'defined',
            hips: 'average'
          },
          confidence: 0.85
        },
        timestamp: '2026-01-31T06:42:00.000Z'
      }
    },
    notes: [
      'Processing time: 3-5 seconds',
      'User photos are not stored',
      'Privacy-focused: all processing is ephemeral',
      'Best results with clear, full-body photos'
    ]
  });
}
