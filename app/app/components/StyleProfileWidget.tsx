'use client';

import { useState, useEffect } from 'react';
import { getStyleInsights, getFavoriteColors } from '@/app/lib/styleProfile';

/**
 * Style Profile Widget
 * 
 * Shows user's style preferences learned over time
 * ADHD-friendly: Brief, visual, encouraging
 */

interface StyleProfileWidgetProps {
  className?: string;
}

export default function StyleProfileWidget({ className = '' }: StyleProfileWidgetProps) {
  const [insights, setInsights] = useState<ReturnType<typeof getStyleInsights> | null>(null);
  const [favoriteColors, setFavoriteColors] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const profileInsights = getStyleInsights();
    setInsights(profileInsights);
    setFavoriteColors(getFavoriteColors());
  }, []);

  if (!insights || insights.totalChoices < 3) {
    return null; // Don't show until we have some data
  }

  return (
    <div className={`bg-surface-container-low rounded-2xl p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎨</span>
          <h3 className="text-label-large font-medium text-on-surface">
            Your Style
          </h3>
        </div>
        <span className="text-label-small text-on-surface-variant">
          {insights.totalChoices} choices
        </span>
      </div>

      {/* Recent Trend */}
      <p className="text-body-small text-on-surface-variant mb-3">
        {insights.recentTrend}
      </p>

      {/* Quick Stats */}
      <div className="space-y-2">
        {/* Favorite Color */}
        {favoriteColors.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-label-small text-on-surface-variant min-w-[80px]">
              Top colors:
            </span>
            <div className="flex gap-1">
              {favoriteColors.slice(0, 5).map((color, idx) => (
                <div
                  key={idx}
                  className="w-6 h-6 rounded-full border-2 border-outline-variant"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        )}

        {/* Top Category */}
        {insights.topCategory && (
          <div className="flex items-center gap-2">
            <span className="text-label-small text-on-surface-variant min-w-[80px]">
              Go-to:
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-primary/10 text-primary text-label-small font-medium capitalize">
              {insights.topCategory}
            </span>
          </div>
        )}

        {/* Top Tags */}
        {isExpanded && insights.topTags.length > 0 && (
          <div className="flex items-start gap-2">
            <span className="text-label-small text-on-surface-variant min-w-[80px]">
              Style tags:
            </span>
            <div className="flex flex-wrap gap-1">
              {insights.topTags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex px-2 py-0.5 rounded-full bg-surface-variant text-on-surface-variant text-label-small"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Expand/Collapse */}
      {insights.topTags.length > 0 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-3 text-primary text-label-small font-medium hover:underline"
        >
          {isExpanded ? 'Show less' : 'Show more'}
        </button>
      )}

      {/* Encouraging Note */}
      <p className="text-body-small text-on-surface-variant mt-3 italic">
        💜 Suggestions improve as you use the app
      </p>
    </div>
  );
}

/**
 * Style Match Badge - Shows how well item matches user's profile
 */
interface StyleMatchBadgeProps {
  score: number; // 0-1
  size?: 'small' | 'medium';
  className?: string;
}

export function StyleMatchBadge({
  score,
  size = 'small',
  className = ''
}: StyleMatchBadgeProps) {
  // Only show for high matches
  if (score < 0.7) {
    return null;
  }

  const sizeClasses = size === 'small' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  
  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full bg-secondary/20 text-secondary ${sizeClasses} ${className}`}
      title={`${Math.round(score * 100)}% match with your style`}
    >
      <span className={size === 'small' ? 'text-xs' : 'text-sm'}>💜</span>
      {size === 'medium' && (
        <span className="font-medium whitespace-nowrap">Your style</span>
      )}
    </div>
  );
}
