// Vision Model Enhancements for ADHD Closet
// Advanced image analysis, similarity search, virtual try-on, and more
// All features powered by OpenRouter vision models

import { getOpenRouterClient } from './openrouter';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface MaterialAnalysis {
  primary: string;
  secondary?: string;
  confidence: number;
  properties: {
    breathable: boolean;
    stretchy: boolean;
    waterResistant: boolean;
    warmth: 'light' | 'medium' | 'heavy';
  };
}

export interface TextureAnalysis {
  type: string; // smooth, ribbed, fuzzy, knit, woven, distressed
  pattern: string; // woven, knit, printed, embroidered
  feel: 'soft' | 'rough' | 'smooth' | 'textured';
  confidence: number;
}

export interface ConditionAssessment {
  rating: 'new' | 'excellent' | 'good' | 'worn' | 'damaged';
  wearScore: number; // 0 = new, 1 = heavily worn
  issues: string[];
  confidence: number;
  recommendations: string[];
}

export interface PatternComplexity {
  level: 'simple' | 'moderate' | 'busy' | 'complex';
  score: number; // 0-1
  elements: string[]; // solid, stripes, florals, graphics, etc.
  visualWeight: 'minimal' | 'moderate' | 'heavy' | 'complex';
}

export interface QualityScore {
  overall: number; // 0-1
  sharpness: number;
  lighting: number;
  framing: number;
  background: number;
  suggestions: string[];
}

export interface SimilarityResult {
  itemId: string;
  score: number; // 0-1
  reasons: string[];
  colorMatch: number;
  styleMatch: number;
  silhouetteMatch: number;
}

export interface PatternClashAnalysis {
  hasClash: boolean;
  severity: 'none' | 'mild' | 'moderate' | 'severe';
  score: number; // 0 = perfect, 1 = extreme clash
  reason: string;
  suggestions: string[];
}

export interface BodyTypeAnalysis {
  type: 'slim' | 'average' | 'athletic' | 'curvy' | 'plus';
  proportions: {
    shoulders: 'narrow' | 'average' | 'broad';
    waist: 'defined' | 'straight' | 'undefined';
    hips: 'narrow' | 'average' | 'wide';
  };
  confidence: number;
}

// ============================================================================
// PHASE 1: ADVANCED IMAGE ANALYSIS
// ============================================================================

/**
 * Comprehensive item analysis including material, texture, condition, etc.
 */
export async function analyzeItemAdvanced(
  imageBase64: string
): Promise<{
  material: MaterialAnalysis;
  texture: TextureAnalysis;
  condition: ConditionAssessment;
  pattern: PatternComplexity;
  quality: QualityScore;
}> {
  const openrouter = getOpenRouterClient();
  
  const prompt = `Analyze this clothing item comprehensively and return JSON:

{
  "material": {
    "primary": "cotton|silk|leather|denim|polyester|wool|linen|synthetic|blend",
    "secondary": "optional secondary material",
    "confidence": 0.0-1.0,
    "properties": {
      "breathable": boolean,
      "stretchy": boolean,
      "waterResistant": boolean,
      "warmth": "light|medium|heavy"
    }
  },
  "texture": {
    "type": "smooth|ribbed|fuzzy|knit|woven|distressed|quilted",
    "pattern": "woven|knit|printed|embroidered|plain",
    "feel": "soft|rough|smooth|textured",
    "confidence": 0.0-1.0
  },
  "condition": {
    "rating": "new|excellent|good|worn|damaged",
    "wearScore": 0.0-1.0 (0=new, 1=heavily worn),
    "issues": ["pilling", "fading", "holes", "stains", "etc"],
    "confidence": 0.0-1.0,
    "recommendations": ["care suggestions"]
  },
  "pattern": {
    "level": "simple|moderate|busy|complex",
    "score": 0.0-1.0,
    "elements": ["solid", "stripes", "florals", "graphics"],
    "visualWeight": "minimal|moderate|heavy|complex"
  },
  "quality": {
    "overall": 0.0-1.0,
    "sharpness": 0.0-1.0,
    "lighting": 0.0-1.0,
    "framing": 0.0-1.0,
    "background": 0.0-1.0,
    "suggestions": ["retake in better light", "etc"]
  }
}

Be thorough and accurate. Return ONLY valid JSON.`;

  try {
    const response = await openrouter.chat({
      model: openrouter.config.visionModel,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
          ]
        }
      ],
      temperature: 0.3,
      max_tokens: 1500,
      response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Advanced analysis failed:', error);
    throw new Error('Failed to analyze item');
  }
}

/**
 * Detect material type from image
 */
export async function detectMaterial(imageBase64: string): Promise<MaterialAnalysis> {
  const analysis = await analyzeItemAdvanced(imageBase64);
  return analysis.material;
}

/**
 * Analyze texture details
 */
export async function detectTexture(imageBase64: string): Promise<TextureAnalysis> {
  const analysis = await analyzeItemAdvanced(imageBase64);
  return analysis.texture;
}

/**
 * Assess item condition
 */
export async function assessCondition(imageBase64: string): Promise<ConditionAssessment> {
  const analysis = await analyzeItemAdvanced(imageBase64);
  return analysis.condition;
}

/**
 * Score photo quality
 */
export async function assessPhotoQuality(imageBase64: string): Promise<QualityScore> {
  const analysis = await analyzeItemAdvanced(imageBase64);
  return analysis.quality;
}

/**
 * Remove background from item image
 */
export async function removeBackground(imageBase64: string): Promise<string> {
  const openrouter = getOpenRouterClient();
  
  const prompt = `Remove the background from this clothing item image and return a clean product photo with transparent or white background. Preserve all item details, colors, and textures exactly. Center the item with consistent padding.`;

  try {
    const response = await openrouter.chat({
      model: openrouter.config.imageModel,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
          ]
        }
      ],
      temperature: 0.2,
      max_tokens: 1000
    });

    // Extract generated image
    const message = response.choices[0].message;
    if (message.images && message.images.length > 0) {
      return message.images[0];
    }
    return message.content;
  } catch (error) {
    console.error('Background removal failed:', error);
    throw new Error('Failed to remove background');
  }
}

/**
 * Analyze pattern complexity
 */
export async function analyzePatternComplexity(imageBase64: string): Promise<PatternComplexity> {
  const analysis = await analyzeItemAdvanced(imageBase64);
  return analysis.pattern;
}

// ============================================================================
// PHASE 2: SMART OUTFIT MATCHING
// ============================================================================

/**
 * Find visually similar items
 */
export async function findSimilarByImage(
  targetImageBase64: string,
  candidateItems: Array<{ id: string; imageBase64: string; category?: string }>,
  options: { threshold?: number; limit?: number; sameCategory?: boolean } = {}
): Promise<SimilarityResult[]> {
  const { threshold = 0.6, limit = 5, sameCategory = false } = options;
  const openrouter = getOpenRouterClient();

  const prompt = `Compare the TARGET item with each CANDIDATE item and return similarity scores in JSON:

{
  "similarities": [
    {
      "candidateIndex": 0,
      "score": 0.0-1.0 (1.0 = identical, 0.0 = completely different),
      "reasons": ["similar color", "similar style", "etc"],
      "colorMatch": 0.0-1.0,
      "styleMatch": 0.0-1.0,
      "silhouetteMatch": 0.0-1.0
    }
  ]
}

Focus on: color similarity, style, silhouette, pattern type, visual weight.
Return ONLY valid JSON.`;

  try {
    const contentArray: any[] = [{ type: 'text', text: prompt }];
    contentArray.push({ type: 'text', text: 'TARGET item:' });
    contentArray.push({
      type: 'image_url',
      image_url: { url: `data:image/jpeg;base64,${targetImageBase64}` }
    });

    for (let i = 0; i < Math.min(candidateItems.length, 20); i++) {
      contentArray.push({ type: 'text', text: `CANDIDATE ${i}:` });
      contentArray.push({
        type: 'image_url',
        image_url: { url: `data:image/jpeg;base64,${candidateItems[i].imageBase64}` }
      });
    }

    const response = await openrouter.chat({
      model: openrouter.config.visionModel,
      messages: [{ role: 'user', content: contentArray }],
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0].message.content);
    const similarities: SimilarityResult[] = result.similarities
      .map((sim: any, idx: number) => ({
        itemId: candidateItems[sim.candidateIndex]?.id,
        score: sim.score,
        reasons: sim.reasons,
        colorMatch: sim.colorMatch,
        styleMatch: sim.styleMatch,
        silhouetteMatch: sim.silhouetteMatch
      }))
      .filter((sim: SimilarityResult) => sim.score >= threshold)
      .sort((a: SimilarityResult, b: SimilarityResult) => b.score - a.score)
      .slice(0, limit);

    return similarities;
  } catch (error) {
    console.error('Similarity search failed:', error);
    return [];
  }
}

/**
 * Detect pattern clashes between two items
 */
export async function detectPatternClash(
  image1Base64: string,
  image2Base64: string
): Promise<PatternClashAnalysis> {
  const openrouter = getOpenRouterClient();

  const prompt = `Analyze if these two clothing items have pattern clashes when worn together. Return JSON:

{
  "hasClash": boolean,
  "severity": "none|mild|moderate|severe",
  "score": 0.0-1.0 (0=perfect harmony, 1=extreme clash),
  "reason": "why they clash or don't clash",
  "suggestions": ["wear solid instead", "separate with neutral layer", "etc"]
}

Consider: pattern types, scale, colors, visual weight, competing focal points.
Return ONLY valid JSON.`;

  try {
    const response = await openrouter.chat({
      model: openrouter.config.visionModel,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'text', text: 'Item 1:' },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${image1Base64}` } },
            { type: 'text', text: 'Item 2:' },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${image2Base64}` } }
          ]
        }
      ],
      temperature: 0.3,
      max_tokens: 800,
      response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Pattern clash detection failed:', error);
    return {
      hasClash: false,
      severity: 'none',
      score: 0,
      reason: 'Unable to analyze',
      suggestions: []
    };
  }
}

/**
 * Calculate visual weight from image
 */
export async function calculateVisualWeight(imageBase64: string): Promise<{
  weight: 'minimal' | 'moderate' | 'heavy' | 'complex';
  score: number;
  factors: string[];
}> {
  const pattern = await analyzePatternComplexity(imageBase64);
  return {
    weight: pattern.visualWeight,
    score: pattern.score,
    factors: pattern.elements
  };
}

/**
 * Analyze texture compatibility between items
 */
export async function analyzeTextureCompatibility(
  itemImages: Array<{ imageBase64: string; category: string }>
): Promise<{
  compatible: boolean;
  score: number;
  reasons: string[];
  suggestions: string[];
}> {
  const openrouter = getOpenRouterClient();

  const prompt = `Analyze if these clothing items have compatible textures when worn together. Return JSON:

{
  "compatible": boolean,
  "score": 0.0-1.0 (1.0=perfect harmony, 0.0=incompatible),
  "reasons": ["smooth with textured works well", "etc"],
  "suggestions": ["add textured accessory", "etc"]
}

Consider: texture contrast, tactile variety, visual interest.
Return ONLY valid JSON.`;

  try {
    const contentArray: any[] = [{ type: 'text', text: prompt }];
    for (const item of itemImages) {
      contentArray.push({ type: 'text', text: `${item.category}:` });
      contentArray.push({
        type: 'image_url',
        image_url: { url: `data:image/jpeg;base64,${item.imageBase64}` }
      });
    }

    const response = await openrouter.chat({
      model: openrouter.config.visionModel,
      messages: [{ role: 'user', content: contentArray }],
      temperature: 0.3,
      max_tokens: 1000,
      response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Texture compatibility failed:', error);
    return {
      compatible: true,
      score: 0.5,
      reasons: ['Unable to analyze'],
      suggestions: []
    };
  }
}

/**
 * Score style compatibility between items
 */
export async function scoreStyleCompatibility(
  itemImages: Array<{ imageBase64: string; category: string; tags?: string[] }>
): Promise<{
  score: number;
  compatible: boolean;
  styleProfile: string;
  reasons: string[];
}> {
  const openrouter = getOpenRouterClient();

  const prompt = `Analyze if these clothing items have compatible styles when worn together. Return JSON:

{
  "score": 0.0-1.0 (1.0=perfect style match),
  "compatible": boolean,
  "styleProfile": "emo|goth|alt|grunge|punk|casual|formal|etc",
  "reasons": ["all pieces fit emo aesthetic", "etc"]
}

Consider: aesthetic consistency, formality level, subculture style markers.
Return ONLY valid JSON.`;

  try {
    const contentArray: any[] = [{ type: 'text', text: prompt }];
    for (const item of itemImages) {
      contentArray.push({ type: 'text', text: `${item.category}:` });
      contentArray.push({
        type: 'image_url',
        image_url: { url: `data:image/jpeg;base64,${item.imageBase64}` }
      });
    }

    const response = await openrouter.chat({
      model: openrouter.config.visionModel,
      messages: [{ role: 'user', content: contentArray }],
      temperature: 0.3,
      max_tokens: 1000,
      response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Style compatibility failed:', error);
    return {
      score: 0.5,
      compatible: true,
      styleProfile: 'mixed',
      reasons: ['Unable to analyze']
    };
  }
}

// ============================================================================
// PHASE 3: VIRTUAL TRY-ON & VISUALIZATION
// ============================================================================

/**
 * Detect body type from user photo
 */
export async function detectBodyType(photoBase64: string): Promise<BodyTypeAnalysis> {
  const openrouter = getOpenRouterClient();

  const prompt = `Analyze body type and proportions from this photo. Return JSON:

{
  "type": "slim|average|athletic|curvy|plus",
  "proportions": {
    "shoulders": "narrow|average|broad",
    "waist": "defined|straight|undefined",
    "hips": "narrow|average|wide"
  },
  "confidence": 0.0-1.0
}

Be respectful and objective. Focus on proportions for outfit fit.
Return ONLY valid JSON.`;

  try {
    const response = await openrouter.chat({
      model: openrouter.config.visionModel,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${photoBase64}` } }
          ]
        }
      ],
      temperature: 0.2,
      max_tokens: 500,
      response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Body type detection failed:', error);
    return {
      type: 'average',
      proportions: { shoulders: 'average', waist: 'straight', hips: 'average' },
      confidence: 0.3
    };
  }
}

/**
 * Overlay outfit on user photo (virtual try-on)
 */
export async function overlayOutfitOnPhoto(
  userPhotoBase64: string,
  outfitItems: Array<{ imageBase64: string; category: string }>,
  bodyType?: BodyTypeAnalysis
): Promise<string> {
  const openrouter = getOpenRouterClient();

  const prompt = `Create a realistic visualization of the person in this photo wearing these outfit items. 

${bodyType ? `Body type: ${bodyType.type}, shoulders: ${bodyType.proportions.shoulders}, waist: ${bodyType.proportions.waist}` : ''}

Guidelines:
- Overlay the outfit items naturally on the person
- Respect body proportions and maintain realistic fit
- Preserve the person's pose and lighting
- Items should look like they're actually being worn
- Maintain colors and details of original items
- Create a cohesive, realistic result

Return the composite image showing the person wearing the outfit.`;

  try {
    const contentArray: any[] = [
      { type: 'text', text: prompt },
      { type: 'text', text: 'Person photo:' },
      { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${userPhotoBase64}` } }
    ];

    for (const item of outfitItems) {
      contentArray.push({ type: 'text', text: `${item.category}:` });
      contentArray.push({
        type: 'image_url',
        image_url: { url: `data:image/jpeg;base64,${item.imageBase64}` }
      });
    }

    const response = await openrouter.chat({
      model: openrouter.config.imageModel,
      messages: [{ role: 'user', content: contentArray }],
      temperature: 0.5,
      max_tokens: 1000,
      image_config: { aspect_ratio: '1:1', image_size: '1024x1024' }
    });

    const message = response.choices[0].message;
    if (message.images && message.images.length > 0) {
      return message.images[0];
    }
    return message.content;
  } catch (error) {
    console.error('Virtual try-on failed:', error);
    throw new Error('Failed to generate virtual try-on');
  }
}


// ============================================================================
// PHASE 4: SMART CATALOGING & ORGANIZATION
// ============================================================================

/**
 * Auto-crop and frame item for consistent catalog
 */
export async function autoCropItem(imageBase64: string): Promise<string> {
  const openrouter = getOpenRouterClient();

  const prompt = `Crop and frame this clothing item for a professional catalog:
- Center the item with consistent padding
- Remove excess background
- Square aspect ratio
- Maintain all item details
- Create clean, catalog-quality result`;

  try {
    const response = await openrouter.chat({
      model: openrouter.config.imageModel,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
          ]
        }
      ],
      temperature: 0.2,
      max_tokens: 500
    });

    const message = response.choices[0].message;
    if (message.images && message.images.length > 0) {
      return message.images[0];
    }
    return message.content;
  } catch (error) {
    console.error('Auto-crop failed:', error);
    throw new Error('Failed to auto-crop item');
  }
}

/**
 * Detect multiple items in a single image
 */
export async function detectMultipleItems(imageBase64: string): Promise<{
  count: number;
  items: Array<{
    category: string;
    boundingBox: { x: number; y: number; width: number; height: number };
    confidence: number;
  }>;
}> {
  const openrouter = getOpenRouterClient();

  const prompt = `Detect all clothing items in this image and return JSON:

{
  "count": number,
  "items": [
    {
      "category": "tops|bottoms|shoes|etc",
      "boundingBox": {"x": 0.0-1.0, "y": 0.0-1.0, "width": 0.0-1.0, "height": 0.0-1.0},
      "confidence": 0.0-1.0
    }
  ]
}

Detect each separate clothing item. Return ONLY valid JSON.`;

  try {
    const response = await openrouter.chat({
      model: openrouter.config.visionModel,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
          ]
        }
      ],
      temperature: 0.2,
      max_tokens: 1000,
      response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Multi-item detection failed:', error);
    return { count: 1, items: [] };
  }
}

/**
 * Find duplicate items by visual similarity
 */
export async function findDuplicates(
  imageBase64: string,
  existingItems: Array<{ id: string; imageBase64: string }>
): Promise<Array<{ itemId: string; similarity: number }>> {
  const similarItems = await findSimilarByImage(imageBase64, existingItems, {
    threshold: 0.85, // High threshold for duplicates
    limit: 3
  });

  return similarItems.map(item => ({
    itemId: item.itemId,
    similarity: item.score
  }));
}

/**
 * Detect seasonal appropriateness
 */
export async function detectSeasonalAppropriateness(imageBase64: string): Promise<{
  seasons: Array<'spring' | 'summer' | 'fall' | 'winter'>;
  primary: 'spring' | 'summer' | 'fall' | 'winter';
  confidence: number;
  reasons: string[];
}> {
  const openrouter = getOpenRouterClient();

  const prompt = `Analyze which seasons this clothing item is appropriate for. Return JSON:

{
  "seasons": ["spring", "summer", "fall", "winter"],
  "primary": "summer|winter|etc",
  "confidence": 0.0-1.0,
  "reasons": ["lightweight fabric", "warm material", "etc"]
}

Consider: fabric weight, coverage, material warmth, style.
Return ONLY valid JSON.`;

  try {
    const response = await openrouter.chat({
      model: openrouter.config.visionModel,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
          ]
        }
      ],
      temperature: 0.3,
      max_tokens: 600,
      response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Seasonal detection failed:', error);
    return {
      seasons: ['spring', 'summer', 'fall', 'winter'],
      primary: 'summer',
      confidence: 0.3,
      reasons: ['Unable to analyze']
    };
  }
}

/**
 * Batch process multiple items
 */
export async function batchAnalyzeItems(
  images: Array<{ id: string; imageBase64: string }>
): Promise<Array<{
  id: string;
  material: MaterialAnalysis;
  texture: TextureAnalysis;
  condition: ConditionAssessment;
  quality: QualityScore;
}>> {
  const results = [];
  
  for (const image of images) {
    try {
      const analysis = await analyzeItemAdvanced(image.imageBase64);
      results.push({
        id: image.id,
        ...analysis
      });
    } catch (error) {
      console.error(`Batch analysis failed for ${image.id}:`, error);
    }
  }
  
  return results;
}

// ============================================================================
// HELPER UTILITIES
// ============================================================================

/**
 * Validate image base64 format
 */
export function validateImageBase64(imageBase64: string): boolean {
  if (!imageBase64 || typeof imageBase64 !== 'string') return false;
  // Check if it's a valid base64 string
  const base64Regex = /^[A-Za-z0-9+/]+={0,2}$/;
  return base64Regex.test(imageBase64);
}

/**
 * Convert data URL to base64
 */
export function dataUrlToBase64(dataUrl: string): string {
  return dataUrl.split(',')[1] || dataUrl;
}

/**
 * Convert base64 to data URL
 */
export function base64ToDataUrl(base64: string, mimeType: string = 'image/jpeg'): string {
  if (base64.startsWith('data:')) return base64;
  return `data:${mimeType};base64,${base64}`;
}
