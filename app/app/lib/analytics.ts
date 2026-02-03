/**
 * Analytics Tracking Service
 * 
 * Handles event tracking with privacy-preserving techniques.
 * Events are only tracked if:
 * 1. Running in hosted mode
 * 2. Analytics is enabled
 * 3. User has opted in (or event is anonymized)
 */

import { prisma } from '@/app/lib/prisma';
import { config } from '@/app/lib/config';
import { AnalyticsEventType, PrivacySetting } from '@prisma/client';
import crypto from 'crypto';

interface TrackEventOptions {
  userId?: string;
  eventType: AnalyticsEventType;
  eventData?: Record<string, any>;
  sessionId?: string;
  userAgent?: string;
  ipAddress?: string;
  forceAnonymous?: boolean;
}

/**
 * Hash sensitive data for privacy
 */
function hashSensitiveData(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
}

/**
 * Check if user has opted in to analytics
 */
async function hasAnalyticsConsent(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { analyticsOptIn: true, dataSharing: true },
  });
  
  if (!user) return false;
  
  // User must explicitly opt in OR have data sharing enabled
  return user.analyticsOptIn || user.dataSharing !== 'opt_out';
}

/**
 * Anonymize event data by removing PII
 */
function anonymizeEventData(data: Record<string, any>): Record<string, any> {
  const anonymized = { ...data };
  
  // Remove fields that might contain PII
  const piiFields = ['email', 'name', 'address', 'phone', 'ip', 'userId', 'username'];
  piiFields.forEach(field => {
    if (anonymized[field]) {
      delete anonymized[field];
    }
  });
  
  // Hash any IDs
  if (anonymized.itemId) {
    anonymized.itemId = hashSensitiveData(anonymized.itemId);
  }
  if (anonymized.outfitId) {
    anonymized.outfitId = hashSensitiveData(anonymized.outfitId);
  }
  
  return anonymized;
}

/**
 * Track an analytics event
 */
export async function trackEvent(options: TrackEventOptions): Promise<void> {
  // Skip if not in hosted mode or analytics disabled
  if (!config.isHosted() || !config.analytics.enabled) {
    return;
  }
  
  const {
    userId,
    eventType,
    eventData = {},
    sessionId,
    userAgent,
    ipAddress,
    forceAnonymous = false,
  } = options;
  
  // Check user consent if userId provided
  if (userId && !forceAnonymous) {
    const hasConsent = await hasAnalyticsConsent(userId);
    if (!hasConsent) {
      return; // User has not opted in, skip tracking
    }
  }
  
  // Prepare event data
  const isAnonymized = forceAnonymous || !userId;
  const finalEventData = isAnonymized ? anonymizeEventData(eventData) : eventData;
  
  // Hash IP address if provided
  const ipAddressHash = ipAddress && config.analytics.anonymizeIp
    ? hashSensitiveData(ipAddress)
    : undefined;
  
  try {
    await prisma.analyticsEvent.create({
      data: {
        userId: isAnonymized ? null : userId,
        eventType,
        eventData: finalEventData,
        sessionId,
        userAgent,
        ipAddressHash,
        isAnonymized,
      },
    });
  } catch (error) {
    // Log error but don't throw - analytics should never break app functionality
    console.error('Failed to track analytics event:', error);
  }
}

/**
 * Track page view
 */
export async function trackPageView(
  userId: string | undefined,
  page: string,
  sessionId?: string,
  userAgent?: string,
  ipAddress?: string
): Promise<void> {
  await trackEvent({
    userId,
    eventType: 'page_view',
    eventData: { page },
    sessionId,
    userAgent,
    ipAddress,
  });
}

/**
 * Track session start
 */
export async function trackSessionStart(
  userId: string | undefined,
  sessionId: string,
  userAgent?: string,
  ipAddress?: string
): Promise<void> {
  await trackEvent({
    userId,
    eventType: 'session_start',
    eventData: { timestamp: new Date().toISOString() },
    sessionId,
    userAgent,
    ipAddress,
  });
}

/**
 * Track item created
 */
export async function trackItemCreated(
  userId: string | undefined,
  itemId: string,
  category?: string,
  sessionId?: string
): Promise<void> {
  await trackEvent({
    userId,
    eventType: 'item_created',
    eventData: { itemId, category },
    sessionId,
  });
}

/**
 * Track outfit created
 */
export async function trackOutfitCreated(
  userId: string | undefined,
  outfitId: string,
  weather?: string,
  vibe?: string,
  sessionId?: string
): Promise<void> {
  await trackEvent({
    userId,
    eventType: 'outfit_created',
    eventData: { outfitId, weather, vibe },
    sessionId,
  });
}

/**
 * Track Panic Pick usage (ADHD-specific feature)
 */
export async function trackPanicPickUsed(
  userId: string | undefined,
  outfitId: string,
  timeToDecision?: number,
  sessionId?: string
): Promise<void> {
  await trackEvent({
    userId,
    eventType: 'panic_pick_used',
    eventData: { outfitId, timeToDecision },
    sessionId,
  });
}

/**
 * Track AI catalog generation
 */
export async function trackAICatalogGenerated(
  userId: string | undefined,
  itemId: string,
  success: boolean,
  confidenceScore?: number,
  sessionId?: string
): Promise<void> {
  await trackEvent({
    userId,
    eventType: 'ai_catalog_generated',
    eventData: { itemId, success, confidenceScore },
    sessionId,
  });
}

/**
 * Get aggregated analytics (admin only)
 * Returns anonymized, aggregated data
 */
export async function getAggregatedAnalytics(
  startDate: Date,
  endDate: Date
): Promise<Record<string, any>> {
  if (!config.isHosted() || !config.analytics.enabled) {
    return { error: 'Analytics not enabled' };
  }
  
  const events = await prisma.analyticsEvent.groupBy({
    by: ['eventType'],
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    _count: {
      id: true,
    },
  });
  
  return {
    period: { start: startDate, end: endDate },
    events: events.map(e => ({
      eventType: e.eventType,
      count: e._count.id,
    })),
  };
}
