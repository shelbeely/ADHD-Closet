/**
 * Subscription Tier Card
 * 
 * Displays subscription tier information and upgrade options
 */

'use client';

import { SubscriptionTier } from '@prisma/client';

interface TierCardProps {
  tier: SubscriptionTier;
  isCurrentTier?: boolean;
  itemCount?: number;
  itemLimit?: number | null;
  outfitCount?: number;
  outfitLimit?: number | null;
  aiGenerationsUsed?: number;
  aiGenerationsLimit?: number | null;
  onUpgrade?: () => void;
}

const TIER_INFO = {
  free: {
    name: 'Free',
    price: '$0',
    color: 'gray',
    features: [
      '50 items max',
      '20 outfits max',
      '10 AI generations/month',
      'Basic features',
      'Data export',
    ],
  },
  ad_supported: {
    name: 'Ad-Supported',
    price: '$0',
    color: 'blue',
    features: [
      'Unlimited items',
      'Unlimited outfits',
      '100 AI generations/month',
      'All features',
      'Shows ads',
      'Data export',
    ],
  },
  premium: {
    name: 'Premium',
    price: '$5/mo',
    color: 'purple',
    features: [
      'Unlimited items',
      'Unlimited outfits',
      'Unlimited AI generations',
      'All features',
      'Ad-free experience',
      'Priority support',
      'Data export',
    ],
  },
  self_hosted: {
    name: 'Self-Hosted',
    price: 'Free',
    color: 'green',
    features: [
      'Unlimited items',
      'Unlimited outfits',
      'Unlimited AI',
      'All features',
      'No ads',
      'Full privacy control',
      'Your own infrastructure',
    ],
  },
};

export function TierCard({
  tier,
  isCurrentTier = false,
  itemCount,
  itemLimit,
  outfitCount,
  outfitLimit,
  aiGenerationsUsed,
  aiGenerationsLimit,
  onUpgrade,
}: TierCardProps) {
  const info = TIER_INFO[tier];
  
  const getUsageText = (used?: number, limit?: number | null) => {
    if (limit === null || limit === undefined) return 'Unlimited';
    if (used === undefined) return `Up to ${limit}`;
    return `${used} / ${limit}`;
  };
  
  return (
    <div className={`
      rounded-xl border-2 p-6 
      ${isCurrentTier ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20' : 'border-gray-200 dark:border-gray-800'}
    `}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold">{info.name}</h3>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
            {info.price}
          </p>
        </div>
        {isCurrentTier && (
          <span className="px-3 py-1 bg-purple-600 text-white text-sm font-medium rounded-full">
            Current Plan
          </span>
        )}
      </div>
      
      {/* Usage Stats (if current tier) */}
      {isCurrentTier && itemCount !== undefined && (
        <div className="mb-4 p-4 bg-white dark:bg-gray-900 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Items:</span>
            <span className="font-medium">{getUsageText(itemCount, itemLimit)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Outfits:</span>
            <span className="font-medium">{getUsageText(outfitCount, outfitLimit)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">AI this month:</span>
            <span className="font-medium">{getUsageText(aiGenerationsUsed, aiGenerationsLimit)}</span>
          </div>
        </div>
      )}
      
      {/* Features */}
      <ul className="space-y-2 mb-6">
        {info.features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <span className="text-green-500 mt-0.5">✓</span>
            <span className="text-gray-700 dark:text-gray-300">{feature}</span>
          </li>
        ))}
      </ul>
      
      {/* Action Button */}
      {!isCurrentTier && onUpgrade && (
        <button
          onClick={onUpgrade}
          className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors"
        >
          {tier === 'premium' ? 'Upgrade to Premium' : 'Switch to this Plan'}
        </button>
      )}
    </div>
  );
}
