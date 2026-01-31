// Comprehensive Attribute Definitions
// Type-safe attribute system with metadata

// ============================================================================
// TYPESCRIPT TYPES FOR ATTRIBUTES
// ============================================================================

export type RiseLevel = 'low' | 'mid' | 'high';
export type FitType = 'skinny' | 'slim' | 'straight' | 'wide' | 'bootcut' | 'flare' | 'relaxed';
export type HemlineType = 'full' | 'ankle' | 'cropped' | 'capri' | 'bermuda' | 'short';
export type NecklineType = 'crew' | 'v-neck' | 'scoop' | 'boat' | 'turtleneck' | 'off-shoulder' | 'halter' | 'square' | 'sweetheart';
export type SleeveLength = 'sleeveless' | 'short' | 'elbow' | 'three-quarter' | 'long';
export type SleeveFit = 'tight' | 'fitted' | 'regular' | 'loose' | 'bell' | 'puff';
export type VisualWeight = 'minimal' | 'moderate' | 'heavy' | 'complex';
export type SilhouetteType = 'fitted' | 'regular' | 'loose' | 'oversized' | 'boxy' | 'flowy' | 'structured';
export type WaistlineType = 'natural' | 'empire' | 'dropped' | 'high' | 'basque';
export type HeelHeight = 'flat' | 'low' | 'mid' | 'high' | 'ultra-high';
export type HeelThickness = 'none' | 'block' | 'stiletto' | 'wedge' | 'platform';
export type ToeboxShape = 'round' | 'pointed' | 'square' | 'almond' | 'open';
export type StructureType = 'structured' | 'semi-structured' | 'soft' | 'flexible';
export type OccasionType = 'casual' | 'work' | 'formal' | 'party' | 'athletic' | 'everyday';
export type MetalType = 'gold' | 'silver' | 'rose-gold' | 'platinum' | 'mixed' | 'costume';
export type JewelryStyle = 'minimalist' | 'statement' | 'delicate' | 'bold' | 'vintage' | 'modern';
export type CoverageLevel = 'minimal' | 'moderate' | 'full';
export type WarmthLevel = 'cool' | 'moderate' | 'warm' | 'extra-warm';
export type ComfortLevel = 'tight' | 'fitted' | 'comfortable' | 'loose' | 'very-loose';
export type FormalityLevel = 'casual' | 'business-casual' | 'business' | 'formal' | 'black-tie';

// ============================================================================
// ATTRIBUTE INTERFACES BY CATEGORY
// ============================================================================

export interface TopsAttributes {
  neckline?: NecklineType;
  sleeveLength?: SleeveLength;
  sleeveFit?: SleeveFit;
  visualWeight?: VisualWeight;
  silhouette?: SilhouetteType;
}

export interface BottomsAttributes {
  bottomsType?: string; // References BottomsType enum
  rise?: RiseLevel;
  inseam?: string; // e.g., "32 inches", "ankle length"
  fit?: FitType;
  hemline?: HemlineType;
  visualWeight?: VisualWeight;
  pocketStyle?: string; // e.g., "slash pockets", "patch pockets"
}

export interface DressesAttributes {
  neckline?: NecklineType;
  sleeveLength?: SleeveLength;
  waistline?: WaistlineType;
  hemline?: HemlineType;
  silhouette?: SilhouetteType;
}

export interface OuterwearAttributes {
  silhouette?: SilhouetteType;
  length?: 'cropped' | 'waist' | 'hip' | 'knee' | 'full';
  visualWeight?: VisualWeight;
}

export interface ShoesAttributes {
  shoeType?: string; // References ShoeType enum
  heelHeight?: HeelHeight;
  heelThickness?: HeelThickness;
  toeboxShape?: ToeboxShape;
  visualWeight?: VisualWeight;
}

export interface AccessoriesAttributes {
  accessoryType?: string; // References AccessoryType enum
  size?: 'small' | 'medium' | 'large' | 'oversized';
  material?: string;
  structure?: StructureType;
  visualWeight?: VisualWeight;
  occasion?: OccasionType;
}

export interface JewelryAttributes {
  jewelryType?: string; // References JewelryType enum
  metal?: MetalType;
  gemstones?: string;
  style?: JewelryStyle;
  occasion?: OccasionType;
}

export interface SwimwearAttributes {
  style?: 'one-piece' | 'bikini' | 'tankini' | 'board-shorts' | 'rash-guard';
  coverage?: CoverageLevel;
  activity?: 'swimming' | 'surfing' | 'diving' | 'beach' | 'pool';
}

export interface ActivewearAttributes {
  activityType?: 'running' | 'yoga' | 'gym' | 'cycling' | 'hiking' | 'sports' | 'general';
  fit?: FitType;
  moistureWicking?: boolean;
  visualWeight?: VisualWeight;
}

export interface SleepwearAttributes {
  style?: 'pajamas' | 'nightgown' | 'robe' | 'sleep-shirt' | 'shorts-set';
  warmth?: WarmthLevel;
  season?: 'summer' | 'winter' | 'all-season';
}

export interface LoungewearAttributes {
  comfortLevel?: ComfortLevel;
  style?: 'sweatpants' | 'joggers' | 'hoodie' | 'robe' | 'casual';
  occasion?: 'home-only' | 'errands' | 'casual-outing';
}

export interface SuitsSetsAttributes {
  type?: 'matching-set' | 'two-piece' | 'three-piece' | 'coordinated';
  formality?: FormalityLevel;
  completeness?: 'complete' | 'top-only' | 'bottom-only';
}

// Union type for all attributes
export type ItemAttributes = 
  | TopsAttributes 
  | BottomsAttributes 
  | DressesAttributes 
  | OuterwearAttributes 
  | ShoesAttributes 
  | AccessoriesAttributes 
  | JewelryAttributes
  | SwimwearAttributes
  | ActivewearAttributes
  | SleepwearAttributes
  | LoungewearAttributes
  | SuitsSetsAttributes;

// ============================================================================
// ATTRIBUTE METADATA
// ============================================================================

export interface AttributeOption {
  value: string;
  label: string;
  icon?: string;
  description?: string;
}

export interface AttributeDefinition {
  key: string;
  label: string;
  type: 'select' | 'multiselect' | 'text' | 'boolean' | 'number';
  options?: AttributeOption[];
  helpText?: string;
  icon?: string;
  category?: string[];
  required?: boolean;
}

// ============================================================================
// ATTRIBUTE DEFINITIONS WITH METADATA
// ============================================================================

export const attributeDefinitions: Record<string, AttributeDefinition> = {
  // Tops & Dresses
  neckline: {
    key: 'neckline',
    label: 'Neckline',
    type: 'select',
    icon: '👔',
    category: ['tops', 'dresses'],
    helpText: 'Shape of the neckline',
    options: [
      { value: 'crew', label: 'Crew Neck', description: 'Round, close to neck' },
      { value: 'v-neck', label: 'V-Neck', description: 'V-shaped opening' },
      { value: 'scoop', label: 'Scoop Neck', description: 'Wide, U-shaped' },
      { value: 'boat', label: 'Boat Neck', description: 'Wide, horizontal' },
      { value: 'turtleneck', label: 'Turtleneck', description: 'High, folded collar' },
      { value: 'off-shoulder', label: 'Off-Shoulder', description: 'Sits below shoulders' },
      { value: 'halter', label: 'Halter', description: 'Ties behind neck' },
      { value: 'square', label: 'Square Neck', description: 'Square-shaped opening' },
      { value: 'sweetheart', label: 'Sweetheart', description: 'Heart-shaped' },
    ],
  },
  
  sleeveLength: {
    key: 'sleeveLength',
    label: 'Sleeve Length',
    type: 'select',
    icon: '👕',
    category: ['tops', 'dresses', 'outerwear'],
    helpText: 'Length of the sleeves',
    options: [
      { value: 'sleeveless', label: 'Sleeveless', icon: '🚫' },
      { value: 'short', label: 'Short Sleeve' },
      { value: 'elbow', label: 'Elbow Length' },
      { value: 'three-quarter', label: '3/4 Length' },
      { value: 'long', label: 'Long Sleeve' },
    ],
  },
  
  sleeveFit: {
    key: 'sleeveFit',
    label: 'Sleeve Fit',
    type: 'select',
    icon: '💪',
    category: ['tops', 'dresses'],
    helpText: 'How the sleeves fit',
    options: [
      { value: 'tight', label: 'Tight' },
      { value: 'fitted', label: 'Fitted' },
      { value: 'regular', label: 'Regular' },
      { value: 'loose', label: 'Loose' },
      { value: 'bell', label: 'Bell Sleeve' },
      { value: 'puff', label: 'Puff Sleeve' },
    ],
  },
  
  // Bottoms specific
  rise: {
    key: 'rise',
    label: 'Rise',
    type: 'select',
    icon: '📏',
    category: ['bottoms'],
    helpText: 'Where the waistband sits',
    options: [
      { value: 'low', label: 'Low Rise', description: 'Below natural waist' },
      { value: 'mid', label: 'Mid Rise', description: 'At natural waist' },
      { value: 'high', label: 'High Rise', description: 'Above natural waist' },
    ],
  },
  
  fit: {
    key: 'fit',
    label: 'Fit',
    type: 'select',
    icon: '👖',
    category: ['bottoms', 'activewear'],
    helpText: 'How the item fits through the leg or body',
    options: [
      { value: 'skinny', label: 'Skinny', description: 'Very fitted throughout' },
      { value: 'slim', label: 'Slim', description: 'Close-fitting' },
      { value: 'straight', label: 'Straight', description: 'Straight from hip to hem' },
      { value: 'wide', label: 'Wide Leg', description: 'Loose through leg' },
      { value: 'bootcut', label: 'Bootcut', description: 'Slightly flared at ankle' },
      { value: 'flare', label: 'Flare', description: 'Flared from knee' },
      { value: 'relaxed', label: 'Relaxed', description: 'Comfortable, loose fit' },
    ],
  },
  
  hemline: {
    key: 'hemline',
    label: 'Hemline',
    type: 'select',
    icon: '📐',
    category: ['bottoms', 'dresses'],
    helpText: 'Length of the garment',
    options: [
      { value: 'full', label: 'Full Length' },
      { value: 'ankle', label: 'Ankle Length' },
      { value: 'cropped', label: 'Cropped' },
      { value: 'capri', label: 'Capri' },
      { value: 'bermuda', label: 'Bermuda' },
      { value: 'short', label: 'Short' },
    ],
  },
  
  // Dresses specific
  waistline: {
    key: 'waistline',
    label: 'Waistline',
    type: 'select',
    icon: '💃',
    category: ['dresses'],
    helpText: 'Where the waist seam sits',
    options: [
      { value: 'natural', label: 'Natural Waist' },
      { value: 'empire', label: 'Empire (High)' },
      { value: 'dropped', label: 'Dropped (Low)' },
      { value: 'high', label: 'High Waist' },
      { value: 'basque', label: 'Basque' },
    ],
  },
  
  // Universal attributes
  silhouette: {
    key: 'silhouette',
    label: 'Silhouette',
    type: 'select',
    icon: '🎨',
    category: ['tops', 'dresses', 'outerwear'],
    helpText: 'Overall shape and fit',
    options: [
      { value: 'fitted', label: 'Fitted', description: 'Close to body' },
      { value: 'regular', label: 'Regular', description: 'Standard fit' },
      { value: 'loose', label: 'Loose', description: 'Relaxed fit' },
      { value: 'oversized', label: 'Oversized', description: 'Intentionally large' },
      { value: 'boxy', label: 'Boxy', description: 'Square shape' },
      { value: 'flowy', label: 'Flowy', description: 'Drapes softly' },
      { value: 'structured', label: 'Structured', description: 'Holds shape' },
    ],
  },
  
  visualWeight: {
    key: 'visualWeight',
    label: 'Visual Weight',
    type: 'select',
    icon: '⚖️',
    category: ['tops', 'bottoms', 'outerwear', 'shoes', 'accessories', 'activewear'],
    helpText: 'How visually heavy/bold the item appears',
    options: [
      { value: 'minimal', label: 'Minimal', icon: '⚪', description: 'Light, simple' },
      { value: 'moderate', label: 'Moderate', icon: '◐', description: 'Balanced' },
      { value: 'heavy', label: 'Heavy', icon: '⚫', description: 'Bold, substantial' },
      { value: 'complex', label: 'Complex', icon: '🌀', description: 'Very detailed' },
    ],
  },
  
  // Shoes specific
  heelHeight: {
    key: 'heelHeight',
    label: 'Heel Height',
    type: 'select',
    icon: '👠',
    category: ['shoes'],
    helpText: 'Height of the heel',
    options: [
      { value: 'flat', label: 'Flat (0-1")', description: 'No heel' },
      { value: 'low', label: 'Low (1-2")', description: 'Small heel' },
      { value: 'mid', label: 'Mid (2-3")', description: 'Medium heel' },
      { value: 'high', label: 'High (3-4")', description: 'High heel' },
      { value: 'ultra-high', label: 'Ultra High (4"+)', description: 'Very high' },
    ],
  },
  
  heelThickness: {
    key: 'heelThickness',
    label: 'Heel Type',
    type: 'select',
    icon: '👟',
    category: ['shoes'],
    helpText: 'Style of the heel',
    options: [
      { value: 'none', label: 'None/Flat' },
      { value: 'block', label: 'Block Heel' },
      { value: 'stiletto', label: 'Stiletto' },
      { value: 'wedge', label: 'Wedge' },
      { value: 'platform', label: 'Platform' },
    ],
  },
  
  toeboxShape: {
    key: 'toeboxShape',
    label: 'Toe Shape',
    type: 'select',
    icon: '🦶',
    category: ['shoes'],
    helpText: 'Shape of the toe area',
    options: [
      { value: 'round', label: 'Round Toe' },
      { value: 'pointed', label: 'Pointed Toe' },
      { value: 'square', label: 'Square Toe' },
      { value: 'almond', label: 'Almond Toe' },
      { value: 'open', label: 'Open Toe' },
    ],
  },
  
  // Accessories
  structure: {
    key: 'structure',
    label: 'Structure',
    type: 'select',
    icon: '👜',
    category: ['accessories'],
    helpText: 'How structured the item is',
    options: [
      { value: 'structured', label: 'Structured', description: 'Holds shape' },
      { value: 'semi-structured', label: 'Semi-Structured', description: 'Some structure' },
      { value: 'soft', label: 'Soft', description: 'Flexible, no structure' },
      { value: 'flexible', label: 'Flexible', description: 'Very flexible' },
    ],
  },
  
  occasion: {
    key: 'occasion',
    label: 'Occasion',
    type: 'multiselect',
    icon: '🎉',
    category: ['accessories', 'jewelry'],
    helpText: 'Best occasions for wearing',
    options: [
      { value: 'casual', label: 'Casual' },
      { value: 'work', label: 'Work/Professional' },
      { value: 'formal', label: 'Formal' },
      { value: 'party', label: 'Party/Night Out' },
      { value: 'athletic', label: 'Athletic' },
      { value: 'everyday', label: 'Everyday' },
    ],
  },
  
  // Jewelry specific
  metal: {
    key: 'metal',
    label: 'Metal Type',
    type: 'select',
    icon: '✨',
    category: ['jewelry'],
    helpText: 'Type of metal',
    options: [
      { value: 'gold', label: 'Gold' },
      { value: 'silver', label: 'Silver' },
      { value: 'rose-gold', label: 'Rose Gold' },
      { value: 'platinum', label: 'Platinum' },
      { value: 'mixed', label: 'Mixed Metals' },
      { value: 'costume', label: 'Costume Jewelry' },
    ],
  },
  
  jewelryStyle: {
    key: 'jewelryStyle',
    label: 'Jewelry Style',
    type: 'select',
    icon: '💎',
    category: ['jewelry'],
    helpText: 'Style of the jewelry',
    options: [
      { value: 'minimalist', label: 'Minimalist', description: 'Simple, subtle' },
      { value: 'statement', label: 'Statement', description: 'Bold, eye-catching' },
      { value: 'delicate', label: 'Delicate', description: 'Fine, dainty' },
      { value: 'bold', label: 'Bold', description: 'Chunky, prominent' },
      { value: 'vintage', label: 'Vintage', description: 'Classic, ornate' },
      { value: 'modern', label: 'Modern', description: 'Contemporary design' },
    ],
  },
  
  // Activewear
  activityType: {
    key: 'activityType',
    label: 'Activity Type',
    type: 'multiselect',
    icon: '🏃',
    category: ['activewear'],
    helpText: 'Best for which activities',
    options: [
      { value: 'running', label: 'Running' },
      { value: 'yoga', label: 'Yoga/Pilates' },
      { value: 'gym', label: 'Gym/Weights' },
      { value: 'cycling', label: 'Cycling' },
      { value: 'hiking', label: 'Hiking' },
      { value: 'sports', label: 'Sports' },
      { value: 'general', label: 'General Fitness' },
    ],
  },
  
  moistureWicking: {
    key: 'moistureWicking',
    label: 'Moisture-Wicking',
    type: 'boolean',
    icon: '💧',
    category: ['activewear'],
    helpText: 'Has moisture-wicking properties',
  },
  
  // Sleepwear
  warmth: {
    key: 'warmth',
    label: 'Warmth Level',
    type: 'select',
    icon: '🌡️',
    category: ['sleepwear'],
    helpText: 'How warm the item is',
    options: [
      { value: 'cool', label: 'Cool', description: 'Lightweight, breathable' },
      { value: 'moderate', label: 'Moderate', description: 'All-season' },
      { value: 'warm', label: 'Warm', description: 'Cozy, insulating' },
      { value: 'extra-warm', label: 'Extra Warm', description: 'Very warm' },
    ],
  },
  
  // Loungewear
  comfortLevel: {
    key: 'comfortLevel',
    label: 'Comfort Level',
    type: 'select',
    icon: '🛋️',
    category: ['loungewear'],
    helpText: 'How comfortable/loose',
    options: [
      { value: 'tight', label: 'Tight' },
      { value: 'fitted', label: 'Fitted' },
      { value: 'comfortable', label: 'Comfortable' },
      { value: 'loose', label: 'Loose' },
      { value: 'very-loose', label: 'Very Loose' },
    ],
  },
  
  // Suits & Sets
  formality: {
    key: 'formality',
    label: 'Formality Level',
    type: 'select',
    icon: '👔',
    category: ['suits_sets'],
    helpText: 'Level of formality',
    options: [
      { value: 'casual', label: 'Casual' },
      { value: 'business-casual', label: 'Business Casual' },
      { value: 'business', label: 'Business' },
      { value: 'formal', label: 'Formal' },
      { value: 'black-tie', label: 'Black Tie' },
    ],
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get attribute definitions for a specific category
 */
export function getAttributesForCategory(category: string): AttributeDefinition[] {
  return Object.values(attributeDefinitions).filter(
    attr => attr.category?.includes(category)
  );
}

/**
 * Get attribute definition by key
 */
export function getAttributeDefinition(key: string): AttributeDefinition | undefined {
  return attributeDefinitions[key];
}

/**
 * Validate attribute value against definition
 */
export function isValidAttributeValue(key: string, value: any): boolean {
  const definition = getAttributeDefinition(key);
  if (!definition) return false;
  
  if (definition.type === 'boolean') {
    return typeof value === 'boolean';
  }
  
  if (definition.type === 'select' && definition.options) {
    return definition.options.some(opt => opt.value === value);
  }
  
  if (definition.type === 'multiselect' && definition.options) {
    if (!Array.isArray(value)) return false;
    return value.every(v => definition.options!.some(opt => opt.value === v));
  }
  
  return true;
}
