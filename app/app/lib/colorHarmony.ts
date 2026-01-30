/**
 * Color Harmony Utilities
 * 
 * Provides advanced color matching beyond exact matches:
 * - Complementary colors (opposite on color wheel)
 * - Analogous colors (adjacent on color wheel)
 * - Triadic colors (evenly spaced)
 * - Split-complementary colors
 * 
 * ADHD-friendly: Returns simple scores and visual indicators
 */

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface HSL {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

export type ColorHarmonyType = 
  | 'exact'           // Same color
  | 'complementary'   // Opposite on color wheel
  | 'analogous'       // Adjacent colors
  | 'triadic'         // 120° apart
  | 'split-complementary' // Base + two adjacent to complement
  | 'neutral-match'   // Both have neutrals
  | 'no-match';

export interface ColorHarmonyResult {
  type: ColorHarmonyType;
  score: number; // 0-1
  description: string;
  emoji: string;
  colorPairs: Array<[string, string]>; // Matching pairs
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): RGB | null {
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  // Handle short form (#fff)
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  
  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Convert RGB to HSL
 */
function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (diff !== 0) {
    s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min);
    
    switch (max) {
      case r:
        h = ((g - b) / diff + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / diff + 2) / 6;
        break;
      case b:
        h = ((r - g) / diff + 4) / 6;
        break;
    }
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

/**
 * Convert hex to HSL
 */
function hexToHsl(hex: string): HSL | null {
  const rgb = hexToRgb(hex);
  return rgb ? rgbToHsl(rgb) : null;
}

/**
 * Check if color is neutral (black, white, gray)
 */
function isNeutral(hsl: HSL): boolean {
  // Low saturation = neutral
  return hsl.s < 20 || hsl.l < 15 || hsl.l > 85;
}

/**
 * Calculate angular difference on color wheel (0-180)
 */
function hueDifference(h1: number, h2: number): number {
  const diff = Math.abs(h1 - h2);
  return Math.min(diff, 360 - diff);
}

/**
 * Detect color harmony between two hex colors
 */
export function detectColorHarmony(hex1: string, hex2: string): ColorHarmonyResult {
  const hsl1 = hexToHsl(hex1);
  const hsl2 = hexToHsl(hex2);
  
  if (!hsl1 || !hsl2) {
    return {
      type: 'no-match',
      score: 0,
      description: 'Invalid color format',
      emoji: '❌',
      colorPairs: []
    };
  }
  
  // Check for exact match (within 5° hue, similar saturation/lightness)
  const hueDiff = hueDifference(hsl1.h, hsl2.h);
  const satDiff = Math.abs(hsl1.s - hsl2.s);
  const lightDiff = Math.abs(hsl1.l - hsl2.l);
  
  if (hueDiff < 5 && satDiff < 10 && lightDiff < 15) {
    return {
      type: 'exact',
      score: 1.0,
      description: 'Perfect color match',
      emoji: '🎨',
      colorPairs: [[hex1, hex2]]
    };
  }
  
  // Check for neutral match
  if (isNeutral(hsl1) && isNeutral(hsl2)) {
    return {
      type: 'neutral-match',
      score: 0.85,
      description: 'Neutral colors work together',
      emoji: '⚫',
      colorPairs: [[hex1, hex2]]
    };
  }
  
  // One neutral + any color = always works
  if (isNeutral(hsl1) || isNeutral(hsl2)) {
    return {
      type: 'neutral-match',
      score: 0.8,
      description: 'Neutral pairs with anything',
      emoji: '⚪',
      colorPairs: [[hex1, hex2]]
    };
  }
  
  // Complementary (opposite on color wheel, ~180°)
  if (hueDiff >= 150 && hueDiff <= 210) {
    return {
      type: 'complementary',
      score: 0.9,
      description: 'Complementary colors create contrast',
      emoji: '🔄',
      colorPairs: [[hex1, hex2]]
    };
  }
  
  // Analogous (adjacent colors, 0-60°)
  if (hueDiff <= 60) {
    return {
      type: 'analogous',
      score: 0.85,
      description: 'Analogous colors blend harmoniously',
      emoji: '🌈',
      colorPairs: [[hex1, hex2]]
    };
  }
  
  // Triadic (120° apart)
  if (hueDiff >= 100 && hueDiff <= 140) {
    return {
      type: 'triadic',
      score: 0.75,
      description: 'Triadic harmony creates balance',
      emoji: '🔺',
      colorPairs: [[hex1, hex2]]
    };
  }
  
  // Split-complementary (150° and 210° from base)
  if ((hueDiff >= 135 && hueDiff <= 165) || (hueDiff >= 195 && hueDiff <= 225)) {
    return {
      type: 'split-complementary',
      score: 0.7,
      description: 'Split-complementary adds variety',
      emoji: '🎭',
      colorPairs: [[hex1, hex2]]
    };
  }
  
  // No clear harmony
  return {
    type: 'no-match',
    score: 0.3,
    description: 'Colors may clash',
    emoji: '⚠️',
    colorPairs: []
  };
}

/**
 * Find best color harmony between item colors and outfit colors
 */
export function findBestColorHarmony(
  itemColors: string[],
  outfitColors: string[]
): ColorHarmonyResult {
  if (itemColors.length === 0 || outfitColors.length === 0) {
    return {
      type: 'no-match',
      score: 0,
      description: 'No colors to compare',
      emoji: '❌',
      colorPairs: []
    };
  }
  
  let bestHarmony: ColorHarmonyResult = {
    type: 'no-match',
    score: 0,
    description: 'No harmony found',
    emoji: '❌',
    colorPairs: []
  };
  
  // Check all combinations
  for (const itemColor of itemColors) {
    for (const outfitColor of outfitColors) {
      const harmony = detectColorHarmony(itemColor, outfitColor);
      if (harmony.score > bestHarmony.score) {
        bestHarmony = harmony;
      }
    }
  }
  
  return bestHarmony;
}

/**
 * Get color harmony description for UI
 */
export function getHarmonyDescription(type: ColorHarmonyType): string {
  switch (type) {
    case 'exact':
      return 'Perfect match';
    case 'complementary':
      return 'Bold contrast';
    case 'analogous':
      return 'Harmonious blend';
    case 'triadic':
      return 'Balanced trio';
    case 'split-complementary':
      return 'Creative mix';
    case 'neutral-match':
      return 'Classic pairing';
    case 'no-match':
      return 'May clash';
  }
}

/**
 * Get ADHD-friendly explanation
 */
export function getHarmonyExplanation(type: ColorHarmonyType): string {
  switch (type) {
    case 'exact':
      return 'Same color = always works!';
    case 'complementary':
      return 'Opposite colors = eye-catching contrast';
    case 'analogous':
      return 'Neighbor colors = smooth transition';
    case 'triadic':
      return 'Three-way balance = vibrant look';
    case 'split-complementary':
      return 'Sophisticated combo = interesting style';
    case 'neutral-match':
      return 'Neutrals go with everything';
    case 'no-match':
      return 'These might compete for attention';
  }
}
