'use client';

import { findBestColorHarmony, getHarmonyDescription } from '@/app/lib/colorHarmony';

interface ColorCompatibilityBadgeProps {
  itemColors: string[];
  outfitColors: string[];
  className?: string;
}

export default function ColorCompatibilityBadge({
  itemColors,
  outfitColors,
  className = ''
}: ColorCompatibilityBadgeProps) {
  // Use advanced color harmony detection
  const harmony = findBestColorHarmony(itemColors, outfitColors);
  
  // Don't show badge if score is too low
  if (harmony.score < 0.5) {
    return null;
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${className}`}>
      {/* Color harmony emoji */}
      <span className="text-sm">{harmony.emoji}</span>
      
      {/* Badge text with harmony type */}
      <span className="text-xs font-medium">
        {getHarmonyDescription(harmony.type)}
      </span>
    </div>
  );
}
