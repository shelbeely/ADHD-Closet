// Attribute Validation using Zod
// Runtime validation with clear error messages

import { z } from 'zod';
import type { Category } from '@prisma/client';

// ============================================================================
// ZOD SCHEMAS FOR EACH ATTRIBUTE TYPE
// ============================================================================

const riseSchema = z.enum(['low', 'mid', 'high']);
const fitSchema = z.enum(['skinny', 'slim', 'straight', 'wide', 'bootcut', 'flare', 'relaxed']);
const hemlineSchema = z.enum(['full', 'ankle', 'cropped', 'capri', 'bermuda', 'short']);
const necklineSchema = z.enum(['crew', 'v-neck', 'scoop', 'boat', 'turtleneck', 'off-shoulder', 'halter', 'square', 'sweetheart']);
const sleeveLengthSchema = z.enum(['sleeveless', 'short', 'elbow', 'three-quarter', 'long']);
const sleeveFitSchema = z.enum(['tight', 'fitted', 'regular', 'loose', 'bell', 'puff']);
const visualWeightSchema = z.enum(['minimal', 'moderate', 'heavy', 'complex']);
const silhouetteSchema = z.enum(['fitted', 'regular', 'loose', 'oversized', 'boxy', 'flowy', 'structured']);
const waistlineSchema = z.enum(['natural', 'empire', 'dropped', 'high', 'basque']);
const heelHeightSchema = z.enum(['flat', 'low', 'mid', 'high', 'ultra-high']);
const heelThicknessSchema = z.enum(['none', 'block', 'stiletto', 'wedge', 'platform']);
const toeboxShapeSchema = z.enum(['round', 'pointed', 'square', 'almond', 'open']);
const structureSchema = z.enum(['structured', 'semi-structured', 'soft', 'flexible']);
const occasionSchema = z.enum(['casual', 'work', 'formal', 'party', 'athletic', 'everyday']);
const metalSchema = z.enum(['gold', 'silver', 'rose-gold', 'platinum', 'mixed', 'costume']);
const jewelryStyleSchema = z.enum(['minimalist', 'statement', 'delicate', 'bold', 'vintage', 'modern']);
const coverageSchema = z.enum(['minimal', 'moderate', 'full']);
const warmthSchema = z.enum(['cool', 'moderate', 'warm', 'extra-warm']);
const comfortLevelSchema = z.enum(['tight', 'fitted', 'comfortable', 'loose', 'very-loose']);
const formalitySchema = z.enum(['casual', 'business-casual', 'business', 'formal', 'black-tie']);

// ============================================================================
// CATEGORY-SPECIFIC SCHEMAS
// ============================================================================

export const topsAttributesSchema = z.object({
  neckline: necklineSchema.optional(),
  sleeveLength: sleeveLengthSchema.optional(),
  sleeveFit: sleeveFitSchema.optional(),
  visualWeight: visualWeightSchema.optional(),
  silhouette: silhouetteSchema.optional(),
}).passthrough(); // Allow additional properties

export const bottomsAttributesSchema = z.object({
  bottomsType: z.string().optional(),
  rise: riseSchema.optional(),
  inseam: z.string().optional(),
  fit: fitSchema.optional(),
  hemline: hemlineSchema.optional(),
  visualWeight: visualWeightSchema.optional(),
  pocketStyle: z.string().optional(),
}).passthrough();

export const dressesAttributesSchema = z.object({
  neckline: necklineSchema.optional(),
  sleeveLength: sleeveLengthSchema.optional(),
  waistline: waistlineSchema.optional(),
  hemline: hemlineSchema.optional(),
  silhouette: silhouetteSchema.optional(),
}).passthrough();

export const outerwearAttributesSchema = z.object({
  silhouette: silhouetteSchema.optional(),
  length: z.enum(['cropped', 'waist', 'hip', 'knee', 'full']).optional(),
  visualWeight: visualWeightSchema.optional(),
}).passthrough();

export const shoesAttributesSchema = z.object({
  shoeType: z.string().optional(),
  heelHeight: heelHeightSchema.optional(),
  heelThickness: heelThicknessSchema.optional(),
  toeboxShape: toeboxShapeSchema.optional(),
  visualWeight: visualWeightSchema.optional(),
}).passthrough();

export const accessoriesAttributesSchema = z.object({
  accessoryType: z.string().optional(),
  size: z.enum(['small', 'medium', 'large', 'oversized']).optional(),
  material: z.string().optional(),
  structure: structureSchema.optional(),
  visualWeight: visualWeightSchema.optional(),
  occasion: z.array(occasionSchema).optional(),
}).passthrough();

export const jewelryAttributesSchema = z.object({
  jewelryType: z.string().optional(),
  metal: metalSchema.optional(),
  gemstones: z.string().optional(),
  style: jewelryStyleSchema.optional(),
  occasion: z.array(occasionSchema).optional(),
}).passthrough();

export const swimwearAttributesSchema = z.object({
  style: z.enum(['one-piece', 'bikini', 'tankini', 'board-shorts', 'rash-guard']).optional(),
  coverage: coverageSchema.optional(),
  activity: z.enum(['swimming', 'surfing', 'diving', 'beach', 'pool']).optional(),
}).passthrough();

export const activewearAttributesSchema = z.object({
  activityType: z.array(z.enum(['running', 'yoga', 'gym', 'cycling', 'hiking', 'sports', 'general'])).optional(),
  fit: fitSchema.optional(),
  moistureWicking: z.boolean().optional(),
  visualWeight: visualWeightSchema.optional(),
}).passthrough();

export const sleepwearAttributesSchema = z.object({
  style: z.enum(['pajamas', 'nightgown', 'robe', 'sleep-shirt', 'shorts-set']).optional(),
  warmth: warmthSchema.optional(),
  season: z.enum(['summer', 'winter', 'all-season']).optional(),
}).passthrough();

export const loungewearAttributesSchema = z.object({
  comfortLevel: comfortLevelSchema.optional(),
  style: z.enum(['sweatpants', 'joggers', 'hoodie', 'robe', 'casual']).optional(),
  occasion: z.enum(['home-only', 'errands', 'casual-outing']).optional(),
}).passthrough();

export const suitsSetsAttributesSchema = z.object({
  type: z.enum(['matching-set', 'two-piece', 'three-piece', 'coordinated']).optional(),
  formality: formalitySchema.optional(),
  completeness: z.enum(['complete', 'top-only', 'bottom-only']).optional(),
}).passthrough();

// ============================================================================
// CATEGORY TO SCHEMA MAPPING
// ============================================================================

const categorySchemaMap: Record<string, z.ZodTypeAny> = {
  tops: topsAttributesSchema,
  bottoms: bottomsAttributesSchema,
  dresses: dressesAttributesSchema,
  outerwear: outerwearAttributesSchema,
  shoes: shoesAttributesSchema,
  accessories: accessoriesAttributesSchema,
  underwear_bras: z.object({}).passthrough(), // Minimal attributes
  jewelry: jewelryAttributesSchema,
  swimwear: swimwearAttributesSchema,
  activewear: activewearAttributesSchema,
  sleepwear: sleepwearAttributesSchema,
  loungewear: loungewearAttributesSchema,
  suits_sets: suitsSetsAttributesSchema,
};

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

export interface ValidationResult {
  success: boolean;
  data?: any;
  error?: {
    message: string;
    issues: Array<{
      path: string[];
      message: string;
    }>;
  };
}

/**
 * Validate attributes for a specific category
 */
export function validateAttributes(
  category: string,
  attributes: any
): ValidationResult {
  const schema = categorySchemaMap[category];
  
  if (!schema) {
    return {
      success: false,
      error: {
        message: `Unknown category: ${category}`,
        issues: [{ path: ['category'], message: 'Category not recognized' }],
      },
    };
  }
  
  const result = schema.safeParse(attributes);
  
  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }
  
  return {
    success: false,
    error: {
      message: 'Attribute validation failed',
      issues: result.error.issues.map(issue => ({
        path: issue.path.map(String),
        message: issue.message,
      })),
    },
  };
}

/**
 * Validate a single attribute value
 */
export function validateAttributeValue(
  attributeKey: string,
  value: any
): ValidationResult {
  const schemas: Record<string, z.ZodTypeAny> = {
    rise: riseSchema,
    fit: fitSchema,
    hemline: hemlineSchema,
    neckline: necklineSchema,
    sleeveLength: sleeveLengthSchema,
    sleeveFit: sleeveFitSchema,
    visualWeight: visualWeightSchema,
    silhouette: silhouetteSchema,
    waistline: waistlineSchema,
    heelHeight: heelHeightSchema,
    heelThickness: heelThicknessSchema,
    toeboxShape: toeboxShapeSchema,
    structure: structureSchema,
    occasion: z.array(occasionSchema),
    metal: metalSchema,
    jewelryStyle: jewelryStyleSchema,
    coverage: coverageSchema,
    warmth: warmthSchema,
    comfortLevel: comfortLevelSchema,
    formality: formalitySchema,
  };
  
  const schema = schemas[attributeKey];
  
  if (!schema) {
    // Unknown attribute, accept it (for forward compatibility)
    return { success: true, data: value };
  }
  
  const result = schema.safeParse(value);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  return {
    success: false,
    error: {
      message: `Invalid value for ${attributeKey}`,
      issues: result.error.issues.map(issue => ({
        path: [attributeKey],
        message: issue.message,
      })),
    },
  };
}

/**
 * Get human-readable error message from validation result
 */
export function getValidationErrorMessage(result: ValidationResult): string {
  if (result.success) return '';
  
  if (!result.error) return 'Validation failed';
  
  const { issues } = result.error;
  
  if (issues.length === 0) return result.error.message;
  
  if (issues.length === 1) {
    const issue = issues[0];
    return `${issue.path.join('.')}: ${issue.message}`;
  }
  
  return `${issues.length} validation errors: ${issues.map(i => i.path.join('.')).join(', ')}`;
}

/**
 * Sanitize attributes by removing invalid values
 */
export function sanitizeAttributes(
  category: string,
  attributes: any
): any {
  const result = validateAttributes(category, attributes);
  
  if (result.success) {
    return result.data;
  }
  
  // If validation fails, try to salvage valid attributes
  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(attributes || {})) {
    const valueResult = validateAttributeValue(key, value);
    if (valueResult.success) {
      sanitized[key] = valueResult.data;
    }
  }
  
  return sanitized;
}

/**
 * Check if attributes are complete for a category
 */
export function areAttributesComplete(
  category: string,
  attributes: any
): { complete: boolean; missing: string[] } {
  const result = validateAttributes(category, attributes);
  
  if (!result.success) {
    return {
      complete: false,
      missing: result.error?.issues.map(i => i.path.join('.')) || [],
    };
  }
  
  // Check for recommended attributes (category-specific)
  const recommended: Record<string, string[]> = {
    tops: ['neckline', 'sleeveLength', 'visualWeight'],
    bottoms: ['rise', 'fit', 'visualWeight'],
    dresses: ['neckline', 'sleeveLength', 'hemline'],
    shoes: ['heelHeight', 'toeboxShape'],
    accessories: ['structure', 'visualWeight'],
    jewelry: ['metal', 'style'],
  };
  
  const missing: string[] = [];
  const recommendedAttrs = recommended[category] || [];
  
  for (const attr of recommendedAttrs) {
    if (!attributes || !(attr in attributes)) {
      missing.push(attr);
    }
  }
  
  return {
    complete: missing.length === 0,
    missing,
  };
}
