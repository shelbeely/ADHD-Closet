/**
 * Seasonal Intelligence
 * 
 * Smart suggestions based on current season and weather
 * ADHD-friendly: Auto-detects season, provides simple recommendations
 */

export type Season = 'spring' | 'summer' | 'fall' | 'winter';

export interface SeasonalRecommendation {
  season: Season;
  suggestedAccessories: string[];
  suggestedColors: string[];
  avoidCategories: string[];
  tips: string[];
}

/**
 * Detect current season based on month
 */
export function getCurrentSeason(): Season {
  const month = new Date().getMonth() + 1; // 1-12
  
  // Northern Hemisphere seasons
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'fall';
  return 'winter';
}

/**
 * Get seasonal recommendations
 */
export function getSeasonalRecommendations(season: Season = getCurrentSeason()): SeasonalRecommendation {
  const recommendations: Record<Season, SeasonalRecommendation> = {
    spring: {
      season: 'spring',
      suggestedAccessories: ['scarf', 'hat', 'sunglasses'],
      suggestedColors: ['#FFB6C1', '#90EE90', '#87CEEB', '#FFF5BA'], // Pastels
      avoidCategories: ['heavy-outerwear', 'winter-boots'],
      tips: [
        'Layer with light scarves',
        'Sunglasses for sunny days',
        'Light colors work well'
      ]
    },
    summer: {
      season: 'summer',
      suggestedAccessories: ['sunglasses', 'hat', 'belt', 'bag'],
      suggestedColors: ['#FFD700', '#FF6347', '#00CED1', '#FF69B4'], // Bright
      avoidCategories: ['outerwear', 'scarf', 'gloves'],
      tips: [
        'Sunglasses are essential',
        'Hats provide sun protection',
        'Bright colors welcome'
      ]
    },
    fall: {
      season: 'fall',
      suggestedAccessories: ['scarf', 'belt', 'hat', 'bag'],
      suggestedColors: ['#D2691E', '#8B4513', '#B8860B', '#2F4F4F'], // Earth tones
      avoidCategories: [],
      tips: [
        'Scarves add warmth and style',
        'Boots are practical',
        'Earth tones fit the season'
      ]
    },
    winter: {
      season: 'winter',
      suggestedAccessories: ['scarf', 'gloves', 'hat', 'belt'],
      suggestedColors: ['#000000', '#2F4F4F', '#8B0000', '#191970'], // Deep colors
      avoidCategories: ['sandals', 'shorts'],
      tips: [
        'Scarves and gloves keep you warm',
        'Layer accessories for depth',
        'Dark colors hide winter grime'
      ]
    }
  };
  
  return recommendations[season];
}

/**
 * Score item appropriateness for current season
 */
export function getSeasonalScore(
  itemCategory: string,
  itemSubType?: string | null,
  season: Season = getCurrentSeason()
): { score: number; reason: string } {
  const recommendations = getSeasonalRecommendations(season);
  
  // Check if category should be avoided
  if (recommendations.avoidCategories.some(avoid => 
    itemCategory.includes(avoid) || itemSubType?.includes(avoid)
  )) {
    return {
      score: 0.2,
      reason: `Not ideal for ${season}`
    };
  }
  
  // Check if accessory type is recommended
  if (itemCategory === 'accessories' && itemSubType) {
    if (recommendations.suggestedAccessories.includes(itemSubType)) {
      return {
        score: 1.0,
        reason: `Perfect for ${season}!`
      };
    }
  }
  
  // Default: neutral score
  return {
    score: 0.7,
    reason: `Works in ${season}`
  };
}

/**
 * Get seasonal emoji indicator
 */
export function getSeasonEmoji(season: Season): string {
  const emojis: Record<Season, string> = {
    spring: '🌸',
    summer: '☀️',
    fall: '🍂',
    winter: '❄️'
  };
  return emojis[season];
}

/**
 * Filter accessories by seasonal appropriateness
 */
export function filterBySeason(
  items: Array<{ category: string; accessoryType?: string | null; jewelryType?: string | null; shoeType?: string | null }>,
  season: Season = getCurrentSeason(),
  minScore: number = 0.5
): Array<typeof items[0] & { seasonalScore: number; seasonalReason: string }> {
  return items
    .map(item => {
      const subType = item.accessoryType || item.jewelryType || item.shoeType;
      const { score, reason } = getSeasonalScore(item.category, subType, season);
      return {
        ...item,
        seasonalScore: score,
        seasonalReason: reason
      };
    })
    .filter(item => item.seasonalScore >= minScore)
    .sort((a, b) => b.seasonalScore - a.seasonalScore);
}

/**
 * Get seasonal styling tip
 */
export function getSeasonalTip(season: Season = getCurrentSeason()): string {
  const recommendations = getSeasonalRecommendations(season);
  const tips = recommendations.tips;
  return tips[Math.floor(Math.random() * tips.length)];
}
