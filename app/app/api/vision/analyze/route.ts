// API endpoint for advanced vision analysis
// POST /api/vision/analyze

import { NextRequest, NextResponse } from 'next/server';
import {
  analyzeItemAdvanced,
  detectMaterial,
  detectTexture,
  assessCondition,
  assessPhotoQuality,
  analyzePatternComplexity,
  validateImageBase64,
  dataUrlToBase64
} from '@/app/lib/ai/visionEnhancements';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageBase64, features = ['all'] } = body;

    // Validate input
    if (!imageBase64) {
      return NextResponse.json(
        { error: 'imageBase64 is required' },
        { status: 400 }
      );
    }

    // Convert data URL to base64 if needed
    const cleanBase64 = imageBase64.startsWith('data:')
      ? dataUrlToBase64(imageBase64)
      : imageBase64;

    // Validate base64
    if (!validateImageBase64(cleanBase64)) {
      return NextResponse.json(
        { error: 'Invalid image format' },
        { status: 400 }
      );
    }

    // Determine which features to analyze
    const analyzeAll = features.includes('all');
    const results: any = {};

    try {
      if (analyzeAll) {
        // Run comprehensive analysis
        const analysis = await analyzeItemAdvanced(cleanBase64);
        return NextResponse.json({
          success: true,
          ...analysis,
          timestamp: new Date().toISOString()
        });
      }

      // Run specific feature analyses
      if (features.includes('material')) {
        results.material = await detectMaterial(cleanBase64);
      }

      if (features.includes('texture')) {
        results.texture = await detectTexture(cleanBase64);
      }

      if (features.includes('condition')) {
        results.condition = await assessCondition(cleanBase64);
      }

      if (features.includes('quality')) {
        results.quality = await assessPhotoQuality(cleanBase64);
      }

      if (features.includes('pattern')) {
        results.pattern = await analyzePatternComplexity(cleanBase64);
      }

      return NextResponse.json({
        success: true,
        ...results,
        timestamp: new Date().toISOString()
      });

    } catch (analysisError: any) {
      console.error('Vision analysis error:', analysisError);
      return NextResponse.json(
        {
          error: 'Analysis failed',
          message: analysisError.message,
          details: 'The vision model encountered an error during analysis'
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
    endpoint: '/api/vision/analyze',
    method: 'POST',
    description: 'Advanced vision analysis for clothing items',
    parameters: {
      imageBase64: {
        type: 'string',
        required: true,
        description: 'Base64 encoded image or data URL'
      },
      features: {
        type: 'array',
        required: false,
        default: ['all'],
        options: ['all', 'material', 'texture', 'condition', 'quality', 'pattern'],
        description: 'Which features to analyze'
      }
    },
    example: {
      request: {
        imageBase64: 'data:image/jpeg;base64,/9j/4AAQ...',
        features: ['material', 'texture', 'condition']
      },
      response: {
        success: true,
        material: {
          primary: 'cotton',
          secondary: 'polyester',
          confidence: 0.92,
          properties: {
            breathable: true,
            stretchy: false,
            waterResistant: false,
            warmth: 'medium'
          }
        },
        texture: {
          type: 'ribbed',
          pattern: 'knit',
          feel: 'soft',
          confidence: 0.88
        },
        condition: {
          rating: 'good',
          wearScore: 0.2,
          issues: ['minor pilling'],
          confidence: 0.85,
          recommendations: ['gentle wash', 'avoid dryer']
        },
        timestamp: '2026-01-31T06:42:00.000Z'
      }
    },
    features: {
      material: 'Detect fabric type (cotton, silk, leather, etc.)',
      texture: 'Analyze texture (smooth, ribbed, fuzzy, etc.)',
      condition: 'Assess wear and condition (new, good, worn, damaged)',
      quality: 'Score photo quality and provide improvement suggestions',
      pattern: 'Analyze pattern complexity and visual weight',
      all: 'Run comprehensive analysis (all features)'
    }
  });
}
