/**
 * Style Profile Learning
 * 
 * Tracks user preferences to improve suggestions over time
 * ADHD-friendly: Learns in background, no setup required
 * 
 * Stores in localStorage:
 * - Favorite colors
 * - Preferred categories
 * - Accessory usage patterns
 * - Style tags frequency
 */

interface StyleChoice {
  itemId: string;
  category: string;
  colors: string[];
  tags: string[];
  timestamp: number;
}

interface StyleProfile {
  choices: StyleChoice[];
  favoriteColors: Record<string, number>; // color -> frequency
  preferredCategories: Record<string, number>; // category -> frequency
  commonTags: Record<string, number>; // tag -> frequency
  lastUpdated: number;
}

const STORAGE_KEY = 'adhd-closet-style-profile';
const MAX_CHOICES = 100; // Keep last 100 choices

/**
 * Get current style profile
 */
export function getStyleProfile(): StyleProfile {
  if (typeof window === 'undefined') {
    return createEmptyProfile();
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading style profile:', error);
  }
  
  return createEmptyProfile();
}

/**
 * Create empty profile
 */
function createEmptyProfile(): StyleProfile {
  return {
    choices: [],
    favoriteColors: {},
    preferredCategories: {},
    commonTags: {},
    lastUpdated: Date.now()
  };
}

/**
 * Record a style choice
 */
export function recordStyleChoice(
  itemId: string,
  category: string,
  colors: string[] = [],
  tags: string[] = []
): void {
  if (typeof window === 'undefined') return;
  
  const profile = getStyleProfile();
  
  // Add new choice
  const choice: StyleChoice = {
    itemId,
    category,
    colors,
    tags,
    timestamp: Date.now()
  };
  
  profile.choices.push(choice);
  
  // Keep only last MAX_CHOICES
  if (profile.choices.length > MAX_CHOICES) {
    profile.choices = profile.choices.slice(-MAX_CHOICES);
  }
  
  // Update color frequencies
  colors.forEach(color => {
    profile.favoriteColors[color] = (profile.favoriteColors[color] || 0) + 1;
  });
  
  // Update category frequencies
  profile.preferredCategories[category] = (profile.preferredCategories[category] || 0) + 1;
  
  // Update tag frequencies
  tags.forEach(tag => {
    profile.commonTags[tag] = (profile.commonTags[tag] || 0) + 1;
  });
  
  profile.lastUpdated = Date.now();
  
  // Save
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error('Error saving style profile:', error);
  }
}

/**
 * Get user's favorite colors (top 5)
 */
export function getFavoriteColors(): string[] {
  const profile = getStyleProfile();
  return Object.entries(profile.favoriteColors)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([color]) => color);
}

/**
 * Get preferred categories (sorted by frequency)
 */
export function getPreferredCategories(): string[] {
  const profile = getStyleProfile();
  return Object.entries(profile.preferredCategories)
    .sort(([, a], [, b]) => b - a)
    .map(([category]) => category);
}

/**
 * Get common style tags (top 10)
 */
export function getCommonTags(): string[] {
  const profile = getStyleProfile();
  return Object.entries(profile.commonTags)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([tag]) => tag);
}

/**
 * Calculate preference score for an item
 * Higher score = more aligned with user's style
 */
export function calculatePreferenceScore(
  itemCategory: string,
  itemColors: string[] = [],
  itemTags: string[] = []
): number {
  const profile = getStyleProfile();
  
  // If no profile data, return neutral
  if (profile.choices.length < 5) {
    return 0.5;
  }
  
  let score = 0;
  let factors = 0;
  
  // Category preference (weight: 0.4)
  const categoryCount = profile.preferredCategories[itemCategory] || 0;
  const maxCategoryCount = Math.max(...Object.values(profile.preferredCategories));
  if (maxCategoryCount > 0) {
    score += (categoryCount / maxCategoryCount) * 0.4;
    factors += 0.4;
  }
  
  // Color preference (weight: 0.4)
  if (itemColors.length > 0) {
    const colorScores = itemColors.map(color => profile.favoriteColors[color] || 0);
    const avgColorScore = colorScores.reduce((a, b) => a + b, 0) / colorScores.length;
    const maxColorCount = Math.max(...Object.values(profile.favoriteColors), 1);
    score += (avgColorScore / maxColorCount) * 0.4;
    factors += 0.4;
  }
  
  // Tag preference (weight: 0.2)
  if (itemTags.length > 0) {
    const tagScores = itemTags.map(tag => profile.commonTags[tag] || 0);
    const avgTagScore = tagScores.reduce((a, b) => a + b, 0) / tagScores.length;
    const maxTagCount = Math.max(...Object.values(profile.commonTags), 1);
    score += (avgTagScore / maxTagCount) * 0.2;
    factors += 0.2;
  }
  
  // Normalize to 0-1
  return factors > 0 ? score / factors : 0.5;
}

/**
 * Get personalized suggestion boost
 * Returns multiplier (0.8 - 1.2) based on how well item matches profile
 */
export function getPersonalizationBoost(
  itemCategory: string,
  itemColors: string[] = [],
  itemTags: string[] = []
): number {
  const preferenceScore = calculatePreferenceScore(itemCategory, itemColors, itemTags);
  
  // Convert 0-1 score to 0.8-1.2 multiplier
  // 0.5 (neutral) = 1.0 (no change)
  // 1.0 (perfect match) = 1.2 (20% boost)
  // 0.0 (no match) = 0.8 (20% penalty)
  return 0.8 + (preferenceScore * 0.4);
}

/**
 * Get style insights for user
 */
export function getStyleInsights(): {
  topColor: string | null;
  topCategory: string | null;
  topTags: string[];
  totalChoices: number;
  recentTrend: string;
} {
  const profile = getStyleProfile();
  
  const favoriteColors = getFavoriteColors();
  const preferredCategories = getPreferredCategories();
  const commonTags = getCommonTags();
  
  // Detect recent trend (last 10 choices)
  const recentChoices = profile.choices.slice(-10);
  const recentCategories = recentChoices.map(c => c.category);
  const mostRecentCategory = recentCategories[recentCategories.length - 1];
  
  let recentTrend = 'Building your style profile';
  if (recentChoices.length >= 5) {
    const categoryCount = recentCategories.filter(c => c === mostRecentCategory).length;
    if (categoryCount >= 3) {
      recentTrend = `Loving ${mostRecentCategory} lately!`;
    }
  }
  
  return {
    topColor: favoriteColors[0] || null,
    topCategory: preferredCategories[0] || null,
    topTags: commonTags.slice(0, 3),
    totalChoices: profile.choices.length,
    recentTrend
  };
}

/**
 * Clear style profile (for testing or user request)
 */
export function clearStyleProfile(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing style profile:', error);
  }
}
