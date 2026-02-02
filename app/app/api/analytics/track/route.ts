/**
 * Analytics Event Tracking API
 * 
 * POST /api/analytics/track
 * Tracks analytics events with privacy controls
 */

import { NextRequest, NextResponse } from 'next/server';
import { trackEvent } from '@/app/lib/analytics';
import { config } from '@/app/lib/config';
import { z } from 'zod';
import { AnalyticsEventType } from '@prisma/client';

// Validation schema
const TrackEventSchema = z.object({
  eventType: z.nativeEnum(AnalyticsEventType),
  eventData: z.record(z.any()).optional(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  // Return 404 if analytics not enabled
  if (!config.isHosted() || !config.analytics.enabled) {
    return NextResponse.json(
      { error: 'Analytics not available' },
      { status: 404 }
    );
  }
  
  try {
    const body = await request.json();
    const validated = TrackEventSchema.parse(body);
    
    // Get user agent and IP for context
    const userAgent = request.headers.get('user-agent') || undefined;
    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      undefined;
    
    await trackEvent({
      ...validated,
      userAgent,
      ipAddress,
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    );
  }
}

// OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
