/**
 * Subscription Management API
 * 
 * GET /api/subscription - Get user's subscription status and usage
 * POST /api/subscription - Update subscription tier
 */

import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/app/lib/config';
import { getUserUsageStats, switchToAdSupported } from '@/app/lib/subscription';
import { z } from 'zod';

const UpdateSubscriptionSchema = z.object({
  userId: z.string(),
  tier: z.enum(['free', 'ad_supported', 'premium']),
});

export async function GET(request: NextRequest) {
  // Only available in hosted mode
  if (!config.isHosted()) {
    return NextResponse.json(
      { error: 'Subscriptions not available in self-hosted mode' },
      { status: 404 }
    );
  }
  
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId required' },
        { status: 400 }
      );
    }
    
    const stats = await getUserUsageStats(userId);
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Subscription fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Only available in hosted mode with subscriptions enabled
  if (!config.isHosted() || !config.subscription.enabled) {
    return NextResponse.json(
      { error: 'Subscription management not available' },
      { status: 404 }
    );
  }
  
  try {
    const body = await request.json();
    const validated = UpdateSubscriptionSchema.parse(body);
    
    // Handle tier changes
    if (validated.tier === 'ad_supported') {
      await switchToAdSupported(validated.userId);
    }
    // Premium upgrades would be handled by Stripe webhook
    // Free downgrades would also typically be handled by webhooks
    
    const stats = await getUserUsageStats(validated.userId);
    
    return NextResponse.json({
      success: true,
      subscription: stats,
    });
  } catch (error) {
    console.error('Subscription update error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    );
  }
}
