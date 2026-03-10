/**
 * Subscription & Tier Management
 * 
 * Handles subscription tiers, feature gates, and billing integration.
 */

import { prisma } from '@/app/lib/prisma';
import { config } from '@/app/lib/config';
import { SubscriptionTier } from '@prisma/client';

interface FeatureLimits {
  maxItems: number | null; // null = unlimited
  maxOutfits: number | null;
  aiGenerationsPerMonth: number | null;
  exportDataEnabled: boolean;
  adsEnabled: boolean;
  prioritySupport: boolean;
}

/**
 * Feature limits by subscription tier
 */
export const TIER_LIMITS: Record<SubscriptionTier, FeatureLimits> = {
  free: {
    maxItems: 50,
    maxOutfits: 20,
    aiGenerationsPerMonth: 10,
    exportDataEnabled: true,
    adsEnabled: false,
    prioritySupport: false,
  },
  ad_supported: {
    maxItems: null, // unlimited
    maxOutfits: null,
    aiGenerationsPerMonth: 100,
    exportDataEnabled: true,
    adsEnabled: true,
    prioritySupport: false,
  },
  premium: {
    maxItems: null,
    maxOutfits: null,
    aiGenerationsPerMonth: null, // unlimited
    exportDataEnabled: true,
    adsEnabled: false,
    prioritySupport: true,
  },
  self_hosted: {
    maxItems: null,
    maxOutfits: null,
    aiGenerationsPerMonth: null,
    exportDataEnabled: true,
    adsEnabled: false,
    prioritySupport: false,
  },
};

/**
 * Get user's subscription tier
 */
export async function getUserTier(userId: string): Promise<SubscriptionTier> {
  // In self-hosted mode, always return self_hosted
  if (config.isSelfHosted()) {
    return 'self_hosted';
  }
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionTier: true, subscriptionExpiry: true },
  });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Check if subscription has expired
  if (user.subscriptionExpiry && user.subscriptionExpiry < new Date()) {
    // Downgrade to free tier if expired
    await prisma.user.update({
      where: { id: userId },
      data: { subscriptionTier: 'free' },
    });
    return 'free';
  }
  
  return user.subscriptionTier;
}

/**
 * Check if user has access to a feature
 */
export async function hasFeatureAccess(
  userId: string,
  feature: keyof FeatureLimits
): Promise<boolean> {
  const tier = await getUserTier(userId);
  const limits = TIER_LIMITS[tier];
  
  const value = limits[feature];
  
  // For boolean features, return the value directly
  if (typeof value === 'boolean') {
    return value;
  }
  
  // For numeric limits, null means unlimited (always has access)
  return value === null || value > 0;
}

/**
 * Check if user is within their item limit
 */
export async function canAddItem(userId: string): Promise<boolean> {
  const tier = await getUserTier(userId);
  const limits = TIER_LIMITS[tier];
  
  if (limits.maxItems === null) {
    return true; // unlimited
  }
  
  const itemCount = await prisma.item.count({
    where: { userId },
  });
  
  return itemCount < limits.maxItems;
}

/**
 * Check if user is within their outfit limit
 */
export async function canAddOutfit(userId: string): Promise<boolean> {
  const tier = await getUserTier(userId);
  const limits = TIER_LIMITS[tier];
  
  if (limits.maxOutfits === null) {
    return true; // unlimited
  }
  
  const outfitCount = await prisma.outfit.count({
    where: { userId },
  });
  
  return outfitCount < limits.maxOutfits;
}

/**
 * Check if user can use AI generation this month
 */
export async function canUseAIGeneration(userId: string): Promise<boolean> {
  const tier = await getUserTier(userId);
  const limits = TIER_LIMITS[tier];
  
  if (limits.aiGenerationsPerMonth === null) {
    return true; // unlimited
  }
  
  // Count AI jobs this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const aiJobCount = await prisma.aIJob.count({
    where: {
      item: { userId },
      createdAt: { gte: startOfMonth },
      type: { in: ['generate_catalog_image', 'generate_outfit'] },
    },
  });
  
  return aiJobCount < limits.aiGenerationsPerMonth;
}

/**
 * Get usage stats for a user
 */
export async function getUserUsageStats(userId: string): Promise<{
  tier: SubscriptionTier;
  limits: FeatureLimits;
  usage: {
    items: number;
    outfits: number;
    aiGenerationsThisMonth: number;
  };
}> {
  const tier = await getUserTier(userId);
  const limits = TIER_LIMITS[tier];
  
  const [itemCount, outfitCount] = await Promise.all([
    prisma.item.count({ where: { userId } }),
    prisma.outfit.count({ where: { userId } }),
  ]);
  
  // Count AI jobs this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const aiJobCount = await prisma.aIJob.count({
    where: {
      item: { userId },
      createdAt: { gte: startOfMonth },
      type: { in: ['generate_catalog_image', 'generate_outfit'] },
    },
  });
  
  return {
    tier,
    limits,
    usage: {
      items: itemCount,
      outfits: outfitCount,
      aiGenerationsThisMonth: aiJobCount,
    },
  };
}

/**
 * Upgrade user to premium tier
 */
export async function upgradeToPremium(
  userId: string,
  stripeCustomerId: string,
  stripeSubscriptionId: string
): Promise<void> {
  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + 1); // 1 month from now
  
  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionTier: 'premium',
      stripeCustomerId,
      stripeSubscriptionId,
      subscriptionExpiry: expiryDate,
    },
  });
}

/**
 * Downgrade user to free tier
 */
export async function downgradeToFree(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionTier: 'free',
      subscriptionExpiry: null,
    },
  });
}

/**
 * Switch to ad-supported tier
 */
export async function switchToAdSupported(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionTier: 'ad_supported',
      adConsent: true, // Must consent to ads
    },
  });
}
