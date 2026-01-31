'use client';

import { useState, useEffect } from 'react';
import { getCurrentSeason, getSeasonalRecommendations, getSeasonEmoji, getSeasonalTip } from '@/app/lib/seasonalIntelligence';

/**
 * Seasonal Banner
 * 
 * Shows current season with smart tips
 * ADHD-friendly: Auto-updates, can be dismissed, brief tips
 */

interface SeasonalBannerProps {
  className?: string;
}

export default function SeasonalBanner({ className = '' }: SeasonalBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [season, setSeason] = useState(getCurrentSeason());
  const [tip, setTip] = useState('');
  
  useEffect(() => {
    const currentSeason = getCurrentSeason();
    setSeason(currentSeason);
    setTip(getSeasonalTip(currentSeason));
    
    // Check if banner was dismissed today
    const dismissedDate = localStorage.getItem('seasonal-banner-dismissed');
    const today = new Date().toDateString();
    if (dismissedDate === today) {
      setDismissed(true);
    }
  }, []);
  
  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('seasonal-banner-dismissed', new Date().toDateString());
  };
  
  if (dismissed) {
    return null;
  }
  
  const recommendations = getSeasonalRecommendations(season);
  const seasonEmoji = getSeasonEmoji(season);

  return (
    <div className={`bg-surface-container-low rounded-2xl p-4 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          {/* Season Header */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{seasonEmoji}</span>
            <h3 className="text-title-medium font-semibold text-on-surface capitalize">
              {season} Style
            </h3>
          </div>
          
          {/* Tip */}
          <p className="text-body-medium text-on-surface-variant mb-3">
            💡 {tip}
          </p>
          
          {/* Suggested Accessories */}
          <div className="flex flex-wrap gap-2">
            {recommendations.suggestedAccessories.slice(0, 3).map((accessory) => (
              <span
                key={accessory}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-label-small font-medium"
              >
                {accessory}
              </span>
            ))}
          </div>
        </div>
        
        {/* Dismiss Button */}
        <button
          onClick={handleDismiss}
          className="p-1 rounded-full hover:bg-surface-variant/50 transition-colors text-on-surface-variant"
          aria-label="Dismiss seasonal tip"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

/**
 * Seasonal Badge - Compact version for item cards
 */
interface SeasonalBadgeProps {
  score: number;
  reason: string;
  size?: 'small' | 'medium';
  className?: string;
}

export function SeasonalBadge({
  score,
  reason,
  size = 'small',
  className = ''
}: SeasonalBadgeProps) {
  // Only show if score is notable (very good or very bad)
  if (score > 0.4 && score < 0.9) {
    return null;
  }
  
  const season = getCurrentSeason();
  const emoji = getSeasonEmoji(season);
  const isGood = score >= 0.9;
  
  const sizeClasses = size === 'small' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  const colorClasses = isGood
    ? 'bg-tertiary/20 text-tertiary'
    : 'bg-error/10 text-error';

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full ${sizeClasses} ${colorClasses} ${className}`}
      title={reason}
    >
      <span className={size === 'small' ? 'text-xs' : 'text-sm'}>
        {emoji}
      </span>
      {size === 'medium' && (
        <span className="font-medium whitespace-nowrap">
          {isGood ? 'Seasonal' : 'Off-season'}
        </span>
      )}
    </div>
  );
}
