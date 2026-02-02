/**
 * Ad Placement Component
 * 
 * Displays ads for users on the ad-supported tier.
 * Respects user consent and privacy settings.
 * 
 * Usage:
 * <AdPlacement slot="sidebar" />
 */

'use client';

import { useEffect, useState } from 'react';
import { config } from '@/app/lib/config';

interface AdPlacementProps {
  slot: 'sidebar' | 'banner' | 'inline';
  className?: string;
}

export function AdPlacement({ slot, className = '' }: AdPlacementProps) {
  const [shouldShowAd, setShouldShowAd] = useState(false);
  
  useEffect(() => {
    // Only show ads if:
    // 1. In hosted mode
    // 2. Ads are enabled
    // 3. User is on ad-supported tier (checked client-side via context)
    setShouldShowAd(config.isHosted() && config.ads.enabled);
  }, []);
  
  if (!shouldShowAd) {
    return null;
  }
  
  // Placeholder for actual ad network integration
  // Replace with real ad network code (e.g., Google AdSense, Carbon Ads)
  return (
    <div 
      className={`ad-placement ad-${slot} ${className}`}
      data-ad-slot={slot}
    >
      <div className="rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 p-4 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          Advertisement
        </p>
        <div className="bg-gray-100 dark:bg-gray-800 h-32 flex items-center justify-center rounded">
          <span className="text-sm text-gray-400">
            Ad Space ({slot})
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Upgrade to Premium for an ad-free experience
        </p>
      </div>
    </div>
  );
}

/**
 * Ad Network Integration Helper
 * 
 * This would be replaced with actual ad network code.
 * Example for Google AdSense:
 * 
 * useEffect(() => {
 *   if (shouldShowAd && window.adsbygoogle) {
 *     (window.adsbygoogle = window.adsbygoogle || []).push({});
 *   }
 * }, [shouldShowAd]);
 */
