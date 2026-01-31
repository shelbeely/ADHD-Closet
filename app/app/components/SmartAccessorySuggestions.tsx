'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { findBestColorHarmony } from '@/app/lib/colorHarmony';
import { getSeasonalScore, getCurrentSeason } from '@/app/lib/seasonalIntelligence';
import { getPersonalizationBoost, recordStyleChoice } from '@/app/lib/styleProfile';
import { SeasonalBadge } from './SeasonalBanner';
import { StyleMatchBadge } from './StyleProfileWidget';

interface AccessorySuggestion {
  id: string;
  title: string;
  category: 'accessories' | 'jewelry' | 'shoes';
  subType?: string;
  imageUrl?: string;
  reason: string;
  confidenceScore: number;
  colorMatch: boolean;
}

interface SmartAccessorySuggestionsProps {
  outfitItems: Array<{ id: string; category: string; colorPalette?: string[] }>;
  onAddAccessory: (accessoryId: string) => void;
  className?: string;
}

export default function SmartAccessorySuggestions({
  outfitItems,
  onAddAccessory,
  className = ''
}: SmartAccessorySuggestionsProps) {
  const [suggestions, setSuggestions] = useState<AccessorySuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch smart suggestions based on current outfit items
    async function fetchSuggestions() {
      if (outfitItems.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/accessories/suggest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            outfitItems: outfitItems.map(item => ({
              id: item.id,
              category: item.category,
              colorPalette: item.colorPalette
            }))
          })
        });

        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.suggestions || []);
          setError(null);
        } else {
          setError('Unable to load suggestions');
        }
      } catch (error: any) {
        console.error('Failed to fetch accessory suggestions:', {
          message: error?.message,
          stack: error?.stack,
          error
        });
        setError('Unable to load suggestions');
      } finally {
        setLoading(false);
      }
    }

    fetchSuggestions();
  }, [outfitItems]);

  if (loading) {
    return (
      <div className={`bg-surface-container-low rounded-2xl p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">✨</span>
          <h3 className="text-label-large font-medium text-on-surface">Complete the Look</h3>
        </div>
        <p className="text-body-small text-on-surface-variant">Finding perfect accessories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-surface-container-low rounded-2xl p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">✨</span>
          <h3 className="text-label-large font-medium text-on-surface">Complete the Look</h3>
        </div>
        <p className="text-body-small text-error">{error}</p>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  const handleAddAccessory = (accessory: AccessorySuggestion) => {
    // Record style choice for learning
    recordStyleChoice(
      accessory.id,
      accessory.category,
      outfitItems.flatMap(item => item.colorPalette || []),
      []
    );
    
    onAddAccessory(accessory.id);
  };

  return (
    <div className={`bg-surface-container-low rounded-2xl p-4 ${className}`}>
      {/* Header - ADHD-friendly with clear icon and title */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">✨</span>
          <h3 className="text-label-large font-medium text-on-surface">Complete the Look</h3>
        </div>
        <span className="text-label-small text-on-surface-variant">
          AI-powered
        </span>
      </div>

      {/* Brief explanation - reduces cognitive load */}
      <p className="text-body-small text-on-surface-variant mb-4">
        Smart accessory picks that match your outfit
      </p>

      {/* Suggestion cards - Progressive disclosure */}
      <div className="grid grid-cols-1 gap-3">
        {displaySuggestions.map((suggestion) => {
          // Calculate enhanced scores
          const itemColors = []; // Would come from suggestion if available
          const colorHarmony = findBestColorHarmony(itemColors, outfitColors);
          const seasonalScore = getSeasonalScore(suggestion.category, suggestion.subType);
          const styleBoost = getPersonalizationBoost(suggestion.category, itemColors, []);
          
          return (
          <button
            key={suggestion.id}
            className="w-full text-left bg-surface-container rounded-xl p-3 hover:bg-surface-container-high transition-colors duration-200 cursor-pointer group"
            onClick={() => handleAddAccessory(suggestion)}
            aria-label={`Add ${suggestion.title || suggestion.category} to outfit - ${suggestion.reason}`}
          >
            <div className="flex gap-3 items-start">
              {/* Thumbnail */}
              {suggestion.imageUrl && (
                <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-surface-variant">
                  <Image
                    src={suggestion.imageUrl}
                    alt={suggestion.title || 'Accessory'}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-title-small text-on-surface font-medium truncate">
                      {suggestion.title || `${suggestion.category} ${suggestion.subType || ''}`}
                    </p>
                    <p className="text-body-small text-on-surface-variant mt-1">
                      {suggestion.reason}
                    </p>
                  </div>

                  {/* Visual indicators - ADHD-friendly */}
                  <div className="flex flex-col gap-1 items-end flex-shrink-0">
                    {suggestion.colorMatch && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-tertiary/10 text-tertiary rounded-full text-label-small">
                        {colorHarmony.emoji} {colorHarmony.type === 'exact' ? 'Match' : 'Harmony'}
                      </span>
                    )}
                    {suggestion.confidenceScore > 0.8 && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-secondary/10 text-secondary rounded-full text-label-small">
                        ⭐ Top pick
                      </span>
                    )}
                    {styleBoost > 1.1 && (
                      <StyleMatchBadge score={styleBoost - 0.8} size="small" />
                    )}
                    {seasonalScore.score > 0.9 && (
                      <SeasonalBadge score={seasonalScore.score} reason={seasonalScore.reason} size="small" />
                    )}
                  </div>
                </div>

                {/* Add button on hover - clear call to action */}
                <button
                  className="mt-2 px-3 py-1.5 bg-primary text-on-primary rounded-full text-label-small font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddAccessory(suggestion);
                  }}
                >
                  + Add to outfit
                </button>
              </div>
            </div>
          </button>
        );
        })}
      </div>

      {/* Progressive disclosure - show more button */}
      {suggestions.length > 3 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-3 py-2 text-primary text-label-large font-medium hover:bg-primary/10 rounded-lg transition-colors duration-200"
          aria-label={expanded ? 'Show fewer accessory suggestions' : `Show ${suggestions.length - 3} more accessory suggestions`}
        >
          {expanded ? 'Show less' : `Show ${suggestions.length - 3} more`}
        </button>
      )}
    </div>
  );
}
