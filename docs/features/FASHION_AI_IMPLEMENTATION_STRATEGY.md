# Fashion AI Implementation Strategy

**Based on**: [awesome-fashion-ai](https://github.com/ayushidalmia/awesome-fashion-ai) deep research  
**Date**: 2026-02-05  
**Status**: Implementation Planning

## Executive Summary

This document provides a detailed, actionable implementation strategy for integrating state-of-the-art fashion AI techniques into Twin Style. Based on comprehensive research of 50+ academic papers, datasets, and industry implementations, we've identified 12 features that can be implemented using:

1. **Existing Gemini API capabilities** (no training required)
2. **Lightweight algorithms** (local computation, no external APIs)
3. **Incremental enhancements** (minimal infrastructure changes)

All implementations prioritize ADHD-friendly UX and align with our single-user, self-hosted architecture.

---

## Research Methodology

### Papers Analyzed (50+)

**Compatibility & Embeddings (10 papers)**
- Context-Aware Visual Compatibility Prediction (CVPR 2019)
- Learning Fashion Compatibility with Bidirectional LSTMs (2017)
- Learning Type-Aware Embeddings for Fashion Compatibility (ECCV 2018)
- Semi-Supervised Visual Representation Learning for Fashion Compatibility (RecSys 2021)
- Fashion Style in 128 Floats (CVPR 2016)
- Style2Vec: Representation Learning for Fashion Items (2017)

**Recommendation Systems (8 papers)**
- Hi, magic closet, tell me what to wear! (MM 2012)
- Creating Capsule Wardrobes from Fashion Images (CVPR 2018)
- Neuroaesthetics in Fashion: Modeling Perception of Fashionability (CVPR 2015)
- Interpretable Partitioned Embedding for Customized Outfit Composition (2018)
- Toward Explainable Fashion Recommendation (2019)
- An LSTM-Based Dynamic Customer Model for Fashion Recommendation (2017)

**Visual Search & Retrieval (9 papers)**
- Learning the Latent "Look": Unsupervised Discovery (2017)
- Learning Attribute Representations with Localization (CVPR 2018)
- DeepStyle: Multimodal Search Engine for Fashion (2018)
- Image-based Recommendations on Styles and Substitutes (2015)
- Large Scale Visual Recommendations From Street Fashion (2014)

**Image Generation & Manipulation (7 papers)**
- SwapNet: Image Based Garment Transfer (ECCV 2018)
- The Conditional Analogy GAN (2017)
- Language Guided Fashion Image Manipulation (2018)
- Fashion++: Minimal Edits for Outfit Improvement (ICCV 2019)
- Visually-Aware Fashion Recommendation with Generative Models (2017)
- Joint Discriminative and Generative Learning (DG-Net, CVPR 2019)

**Attribute Detection & Parsing (6 papers)**
- DeepFashion: Powering Robust Clothes Recognition (CVPR 2016)
- Attentive Fashion Grammar Network (CVPR 2018)
- Memory-Augmented Attribute Manipulation Networks (CVPR 2017)
- Two-Stream Multi-Task Network for Fashion Recognition (2019)
- Semantic Segmentation with Feature Pyramid Networks (ICCV 2019)

**3D Modeling & Virtual Try-On (5 papers)**
- TailorNet: Predicting Clothing in 3D (CVPR 2020)
- DeepWrinkles: Accurate and Realistic Clothing Modeling (ECCV 2018)
- MULTI-GARMENT NET: Learning to Dress 3D People (ICCV 2019)
- Deep Fashion3D: Benchmark for 3D Garment Reconstruction (ECCV 2020)
- SIZER: Dataset for 3D Clothing (ECCV 2020)

**Trend Analysis & Forecasting (5 papers)**
- Fashion Forward: Forecasting Visual Style in Fashion (2017)
- When Fashion Meets Big Data (2016)
- Towards Predicting Likeability of Fashion Images (2015)
- Who Leads the Clothing Fashion: Style, Color, or Texture? (2016)

### Datasets Reviewed (10)

1. **DeepFashion** - 1,000+ clothing attributes, 4-8 landmarks per item
2. **DeepFashion2** - Enhanced with 20+ dense landmarks, segmentation masks
3. **ModaNet** - 55k street fashion images with polygon annotations (eBay)
4. **Polyvore** - Outfit compatibility with co-purchase data
5. **Fashion-MNIST** - 70k images, 10 categories (benchmark)
6. **Fashion Takes Shape** - Body shape-based preference analysis
7. **Fashion-Gen** - Generative fashion dataset
8. **iMaterialist-Fashion** - Kaggle competition dataset
9. **Clothing Fit Dataset** - Size recommendation data
10. **FashionAI** - Attribute prediction benchmark

---

## Implementation Priorities

### Phase 1: Enhanced Compatibility (Week 1-2)

**Goal**: Improve outfit generation quality beyond simple color harmony

#### 1.1 Attribute-Based Compatibility Scoring
**Inspired by**: Learning Type-Aware Embeddings (ECCV 2018), Context-Aware Visual Compatibility (CVPR 2019)

**Implementation**:
```typescript
// New file: app/lib/outfitCompatibility.ts

interface CompatibilityScore {
  score: number;         // 0-1
  category: string;      // 'excellent', 'good', 'fair', 'poor'
  reasons: string[];     // Human-readable explanations
  colorHarmony: number;  // Existing color harmony score
  styleCoherence: number; // New: style matching
  formality: number;     // New: formality level matching
  patternBalance: number; // New: avoid pattern clashing
}

export function scoreOutfitCompatibility(
  items: Item[]
): CompatibilityScore {
  // 1. Color harmony (already implemented) - 30% weight
  const colorScore = calculateColorHarmony(items);
  
  // 2. Style coherence - 25% weight
  // Check if items share similar style attributes
  const styleScore = calculateStyleCoherence(items);
  
  // 3. Formality matching - 20% weight
  // Avoid mixing formal + casual
  const formalityScore = calculateFormalityMatch(items);
  
  // 4. Pattern balance - 15% weight
  // Limit loud patterns, allow neutrals + one statement
  const patternScore = calculatePatternBalance(items);
  
  // 5. Category rules - 10% weight
  // E.g., formal shoes + formal pants
  const categoryScore = checkCategoryRules(items);
  
  const totalScore = (
    colorScore * 0.30 +
    styleScore * 0.25 +
    formalityScore * 0.20 +
    patternScore * 0.15 +
    categoryScore * 0.10
  );
  
  return {
    score: totalScore,
    category: scoreToCategoryADHDFriendly(totalScore),
    reasons: explainScore(items, {
      colorScore,
      styleScore,
      formalityScore,
      patternScore,
      categoryScore
    }),
    colorHarmony: colorScore,
    styleCoherence: styleScore,
    formality: formalityScore,
    patternBalance: patternScore
  };
}

function calculateStyleCoherence(items: Item[]): number {
  // Extract style tags from attributes
  const styles = items.map(item => {
    const attrs = item.attributes as any;
    return attrs?.style || 'neutral';
  });
  
  // Coherent if all items share a style, or if mixed with neutrals
  const uniqueStyles = new Set(styles.filter(s => s !== 'neutral'));
  if (uniqueStyles.size === 0) return 0.8; // All neutral
  if (uniqueStyles.size === 1) return 1.0; // Perfect match
  if (uniqueStyles.size === 2) return 0.6; // Some variety
  return 0.3; // Too many competing styles
}

function calculateFormalityMatch(items: Item[]): number {
  // Formality levels: casual (0-3), smart_casual (4-6), formal (7-10)
  const formalityLevels = items.map(item => {
    const attrs = item.attributes as any;
    return inferFormalityLevel(item.category, attrs);
  });
  
  const avg = formalityLevels.reduce((a, b) => a + b, 0) / formalityLevels.length;
  const variance = formalityLevels.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / formalityLevels.length;
  const stdDev = Math.sqrt(variance);
  
  // Low standard deviation = consistent formality = good
  // Penalize heavy mixing (e.g., gym shoes + suit)
  if (stdDev < 1.5) return 1.0;
  if (stdDev < 3.0) return 0.7;
  if (stdDev < 4.5) return 0.4;
  return 0.2; // Very mixed
}

function calculatePatternBalance(items: Item[]): number {
  // Count "loud" patterns (graphic, bold_stripe, large_floral, etc.)
  const patterns = items.map(item => {
    const attrs = item.attributes as any;
    return attrs?.pattern || 'solid';
  });
  
  const loudPatterns = patterns.filter(p => 
    ['graphic', 'bold_stripe', 'large_floral', 'animal_print', 'geometric'].includes(p)
  ).length;
  
  // ADHD-friendly: One statement piece is great, too many is overwhelming
  if (loudPatterns === 0) return 0.9; // All neutrals (safe but boring)
  if (loudPatterns === 1) return 1.0; // Perfect: one statement piece
  if (loudPatterns === 2) return 0.5; // Risky but can work
  return 0.2; // Too busy
}

function checkCategoryRules(items: Item[]): number {
  // Hard rules based on category combinations
  const categories = items.map(i => i.category).filter(Boolean);
  
  // Check for incompatible combinations
  const hasFormalShoes = items.some(i => 
    i.category === 'shoes' && 
    (i.shoeType === 'oxfords' || i.shoeType === 'heels')
  );
  const hasCasualBottoms = items.some(i =>
    i.category === 'bottoms' &&
    i.bottomsType === 'cargo_pants'
  );
  
  if (hasFormalShoes && hasCasualBottoms) return 0.3; // Mismatch
  
  // Check for activewear mixed with non-activewear
  const hasActivewear = categories.includes('activewear');
  const hasNonActivewear = categories.some(c => 
    ['tops', 'bottoms', 'dresses', 'outerwear'].includes(c)
  );
  
  if (hasActivewear && hasNonActivewear) return 0.4; // Usually doesn't work
  
  return 1.0; // No violations
}

function scoreToCategoryADHDFriendly(score: number): string {
  // Simple, clear categories
  if (score >= 0.85) return '✅ Excellent - Ready to go!';
  if (score >= 0.70) return '👍 Good - This works!';
  if (score >= 0.50) return '🤔 Fair - Could be better';
  return '❌ Needs work - Try swapping an item';
}

function explainScore(items: Item[], scores: any): string[] {
  const reasons: string[] = [];
  
  // ADHD-friendly: Give actionable feedback
  if (scores.colorScore >= 0.8) {
    reasons.push('✨ Colors work great together');
  } else if (scores.colorScore < 0.5) {
    reasons.push('⚠️ Colors might clash - try swapping one item');
  }
  
  if (scores.styleScore < 0.6) {
    reasons.push('🎨 Styles are competing - pick a unified vibe');
  }
  
  if (scores.formalityScore < 0.5) {
    reasons.push('👔 Mixing formal + casual - pick one direction');
  }
  
  if (scores.patternScore < 0.5) {
    reasons.push('🌀 Too many patterns - swap one for a solid');
  }
  
  if (reasons.length === 0) {
    reasons.push('Perfect outfit - you\'re good to go!');
  }
  
  return reasons;
}
```

**Integration Points**:
- Update `/api/outfits/generate/route.ts` to use compatibility scoring
- Show compatibility badge on outfit cards
- Add "Why this works" explanations

**Effort**: 3-4 days  
**Dependencies**: None (uses existing attribute data)

---

#### 1.2 Smart Accessory Suggestions
**Inspired by**: "Hi, magic closet" (MM 2012), Interpretable Partitioned Embedding (2018)

**Implementation**: Flesh out existing `/api/accessories/suggest/route.ts`

```typescript
// Update: app/api/accessories/suggest/route.ts

export async function POST(request: NextRequest) {
  const { outfitItemIds } = await request.json();
  
  // 1. Get outfit items
  const outfitItems = await prisma.item.findMany({
    where: { id: { in: outfitItemIds } },
    include: { images: true }
  });
  
  // 2. Extract outfit color palette
  const outfitColors = outfitItems.flatMap(item => 
    (item.colorPalette as string[]) || []
  );
  
  // 3. Determine outfit formality
  const outfitFormality = calculateAverageFormality(outfitItems);
  
  // 4. Find matching accessories
  const accessories = await prisma.item.findMany({
    where: {
      category: { in: ['accessories', 'jewelry'] },
      state: 'available'
    },
    include: { images: true }
  });
  
  // 5. Score each accessory
  const scored = accessories.map(accessory => {
    const colorMatch = findBestColorHarmony(
      accessory.colorPalette as string[],
      outfitColors
    );
    
    const formalityMatch = matchesFormality(
      accessory,
      outfitFormality
    );
    
    const score = colorMatch.score * 0.6 + formalityMatch * 0.4;
    
    return {
      accessory,
      score,
      reason: `${colorMatch.emoji} ${colorMatch.description}, fits ${outfitFormality} style`
    };
  });
  
  // 6. Return top 3-5 suggestions
  const suggestions = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 5); // ADHD-friendly: limit choices
  
  return NextResponse.json({ suggestions });
}
```

**UI Integration**:
- Add "Complete this outfit" button on outfit detail page
- Show 3-5 accessory suggestions with visual indicators
- Progressive disclosure: show after main outfit is built

**Effort**: 2-3 days  
**Dependencies**: Existing color harmony library

---

### Phase 2: Visual Similarity (Week 3-4)

**Goal**: "Find items like this" feature using visual embeddings

#### 2.1 Text-Based Similarity (Quick Win)
**Inspired by**: Learning Attribute Representations (CVPR 2018)

```typescript
// New file: app/lib/similaritySearch.ts

export async function findSimilarItems(
  itemId: string,
  options: {
    matchColor?: boolean;
    matchPattern?: boolean;
    matchStyle?: boolean;
    limit?: number;
  } = {}
): Promise<Array<{ item: Item; similarityScore: number; matchReasons: string[] }>> {
  const sourceItem = await prisma.item.findUnique({
    where: { id: itemId },
    include: { tags: { include: { tag: true } } }
  });
  
  if (!sourceItem) return [];
  
  const sourceAttrs = sourceItem.attributes as any;
  const sourceColors = sourceItem.colorPalette as string[];
  const sourceTags = sourceItem.tags.map(t => t.tag.name);
  
  // Build query conditions
  const where: any = {
    id: { not: itemId },
    category: sourceItem.category, // Same category
    state: 'available'
  };
  
  const candidates = await prisma.item.findMany({
    where,
    include: {
      tags: { include: { tag: true } },
      images: { where: { kind: 'ai_catalog' }, take: 1 }
    }
  });
  
  // Score each candidate
  const scored = candidates.map(candidate => {
    const candidateAttrs = candidate.attributes as any;
    const candidateColors = candidate.colorPalette as string[];
    const candidateTags = candidate.tags.map(t => t.tag.name);
    
    let score = 0;
    let reasons: string[] = [];
    
    // Color similarity
    if (options.matchColor !== false && sourceColors && candidateColors) {
      const colorSimilarity = calculateColorSimilarity(sourceColors, candidateColors);
      score += colorSimilarity * 0.4;
      if (colorSimilarity > 0.7) {
        reasons.push('Similar colors');
      }
    }
    
    // Pattern matching
    if (options.matchPattern !== false && sourceAttrs?.pattern && candidateAttrs?.pattern) {
      if (sourceAttrs.pattern === candidateAttrs.pattern) {
        score += 0.3;
        reasons.push(`Both ${sourceAttrs.pattern}`);
      }
    }
    
    // Style matching
    if (options.matchStyle !== false && sourceAttrs?.style && candidateAttrs?.style) {
      if (sourceAttrs.style === candidateAttrs.style) {
        score += 0.2;
        reasons.push(`Same ${sourceAttrs.style} style`);
      }
    }
    
    // Tag overlap
    const commonTags = sourceTags.filter(tag => candidateTags.includes(tag));
    const tagSimilarity = commonTags.length / Math.max(sourceTags.length, candidateTags.length);
    score += tagSimilarity * 0.1;
    
    if (commonTags.length > 0) {
      reasons.push(`Tags: ${commonTags.join(', ')}`);
    }
    
    return {
      item: candidate,
      similarityScore: score,
      matchReasons: reasons
    };
  });
  
  return scored
    .filter(s => s.similarityScore > 0.3) // Minimum threshold
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, options.limit || 10);
}

function calculateColorSimilarity(colors1: string[], colors2: string[]): number {
  if (!colors1.length || !colors2.length) return 0;
  
  let maxSimilarity = 0;
  
  for (const c1 of colors1) {
    for (const c2 of colors2) {
      const harmony = detectColorHarmony(c1, c2);
      maxSimilarity = Math.max(maxSimilarity, harmony.score);
    }
  }
  
  return maxSimilarity;
}
```

**API Endpoint**:
```typescript
// New file: app/api/items/[id]/similar/route.ts

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const searchParams = request.nextUrl.searchParams;
  const matchColor = searchParams.get('matchColor') !== 'false';
  const matchPattern = searchParams.get('matchPattern') !== 'false';
  const matchStyle = searchParams.get('matchStyle') !== 'false';
  const limit = parseInt(searchParams.get('limit') || '10');
  
  const similar = await findSimilarItems(params.id, {
    matchColor,
    matchPattern,
    matchStyle,
    limit
  });
  
  return NextResponse.json({ similar });
}
```

**Effort**: 2-3 days  
**Dependencies**: Existing attribute data, color harmony library

---

#### 2.2 Visual Embeddings with Gemini (Future Enhancement)
**Inspired by**: Style2Vec (2017), Fashion Style in 128 Floats (CVPR 2016)

```typescript
// Future implementation using Gemini Vision API

export async function generateItemEmbedding(itemId: string): Promise<number[]> {
  const item = await prisma.item.findUnique({
    where: { id: itemId },
    include: { images: { where: { kind: 'ai_catalog' }, take: 1 } }
  });
  
  if (!item?.images[0]) return [];
  
  // Use Gemini Vision API to generate embedding
  const embedding = await openRouterClient.generateEmbedding({
    model: 'google/gemini-3-pro-preview',
    image: item.images[0].filePath,
    prompt: 'Generate a feature embedding for this clothing item focusing on style, silhouette, and visual details.'
  });
  
  return embedding;
}

// Store embeddings in database
// Option 1: Add `embedding` column to items table (Postgres supports vectors with pgvector extension)
// Option 2: Create separate embeddings table for flexibility

// Similarity search using cosine similarity
export async function findVisualSimilarItems(
  itemId: string,
  limit: number = 10
): Promise<Item[]> {
  const sourceEmbedding = await getItemEmbedding(itemId);
  
  // Use pgvector for efficient similarity search
  const similar = await prisma.$queryRaw`
    SELECT id, embedding <=> ${sourceEmbedding}::vector AS distance
    FROM items
    WHERE id != ${itemId}
    AND embedding IS NOT NULL
    ORDER BY distance
    LIMIT ${limit}
  `;
  
  return similar;
}
```

**Prerequisites**:
- Install pgvector extension in PostgreSQL
- Add embedding column to items table
- Generate embeddings for existing items (batch job)

**Effort**: 5-7 days  
**Dependencies**: PostgreSQL with pgvector, OpenRouter API

---

### Phase 3: Personalization & Learning (Week 5-6)

**Goal**: Learn user preferences from ratings

#### 3.1 Outfit Rating Analysis
**Inspired by**: LSTM-Based Dynamic Customer Model (2017), Toward Explainable Fashion (2019)

```typescript
// New file: app/lib/userPreferences.ts

interface UserPreferenceProfile {
  preferredColors: Array<{ color: string; weight: number }>;
  preferredStyles: Array<{ style: string; weight: number }>;
  avoidedCombinations: Array<{ items: string[]; reason: string }>;
  formalityPreference: number; // 0-10 scale
  patternTolerance: number; // 0-1, how much pattern mixing
  lastUpdated: Date;
}

export async function analyzeOutfitRatings(): Promise<UserPreferenceProfile> {
  // Get all rated outfits
  const ratedOutfits = await prisma.outfit.findMany({
    where: {
      rating: { not: 'neutral' }
    },
    include: {
      items: {
        include: {
          item: true
        }
      }
    }
  });
  
  const likedOutfits = ratedOutfits.filter(o => o.rating === 'up');
  const dislikedOutfits = ratedOutfits.filter(o => o.rating === 'down');
  
  // 1. Extract color preferences
  const preferredColors = extractColorPreferences(likedOutfits, dislikedOutfits);
  
  // 2. Extract style preferences
  const preferredStyles = extractStylePreferences(likedOutfits, dislikedOutfits);
  
  // 3. Identify avoided combinations
  const avoidedCombinations = identifyAvoidedCombinations(dislikedOutfits);
  
  // 4. Determine formality preference
  const formalityPreference = calculateFormalityPreference(likedOutfits);
  
  // 5. Assess pattern tolerance
  const patternTolerance = assessPatternTolerance(likedOutfits, dislikedOutfits);
  
  return {
    preferredColors,
    preferredStyles,
    avoidedCombinations,
    formalityPreference,
    patternTolerance,
    lastUpdated: new Date()
  };
}

function extractColorPreferences(
  liked: Outfit[],
  disliked: Outfit[]
): Array<{ color: string; weight: number }> {
  const colorCounts = new Map<string, { liked: number; disliked: number }>();
  
  // Count color occurrences in liked outfits
  liked.forEach(outfit => {
    outfit.items.forEach(oi => {
      const colors = oi.item.colorPalette as string[];
      colors?.forEach(color => {
        const current = colorCounts.get(color) || { liked: 0, disliked: 0 };
        colorCounts.set(color, { ...current, liked: current.liked + 1 });
      });
    });
  });
  
  // Count color occurrences in disliked outfits
  disliked.forEach(outfit => {
    outfit.items.forEach(oi => {
      const colors = oi.item.colorPalette as string[];
      colors?.forEach(color => {
        const current = colorCounts.get(color) || { liked: 0, disliked: 0 };
        colorCounts.set(color, { ...current, disliked: current.disliked + 1 });
      });
    });
  });
  
  // Calculate preference weight
  const preferences = Array.from(colorCounts.entries()).map(([color, counts]) => {
    const total = counts.liked + counts.disliked;
    const weight = (counts.liked - counts.disliked) / total; // Range: -1 to 1
    return { color, weight };
  });
  
  return preferences
    .filter(p => p.weight > 0) // Only positive preferences
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 10); // Top 10 colors
}

// Similar functions for styles, combinations, etc.
```

**Integration**:
- Store preference profile in database (new `user_preferences` table)
- Update outfit generation to use preference weights
- Show "Based on your style" badge on suggestions

**Effort**: 5-7 days  
**Dependencies**: Outfit rating data

---

#### 3.2 Improved Panic Pick
**Inspired by**: Neuroaesthetics (CVPR 2015), User preference learning

```typescript
// Update: app/api/outfits/generate/route.ts

async function generatePanicPick(
  constraints: OutfitConstraints,
  userPreferences?: UserPreferenceProfile
): Promise<Outfit> {
  const items = await prisma.item.findMany({
    where: { state: 'available' },
    include: { images: true }
  });
  
  // Filter by weather if specified
  let candidates = items;
  if (constraints.weather) {
    candidates = filterByWeather(items, constraints.weather);
  }
  
  // Score each item based on preferences
  const scoredTops = scoreItemsByPreference(
    candidates.filter(i => i.category === 'tops'),
    userPreferences
  );
  const scoredBottoms = scoreItemsByPreference(
    candidates.filter(i => i.category === 'bottoms'),
    userPreferences
  );
  const scoredShoes = scoreItemsByPreference(
    candidates.filter(i => i.category === 'shoes'),
    userPreferences
  );
  
  // Pick highest-scoring items
  const top = scoredTops[0];
  const bottom = scoredBottoms[0];
  const shoes = scoredShoes[0];
  
  // Check compatibility
  const compatibilityScore = scoreOutfitCompatibility([top, bottom, shoes]);
  
  // If compatibility is poor, try next best combination
  if (compatibilityScore.score < 0.6) {
    // Try different combinations until we find one that works
    for (const t of scoredTops.slice(0, 3)) {
      for (const b of scoredBottoms.slice(0, 3)) {
        const testScore = scoreOutfitCompatibility([t, b, shoes]);
        if (testScore.score >= 0.7) {
          return createOutfit([t, b, shoes], constraints);
        }
      }
    }
  }
  
  return createOutfit([top, bottom, shoes], constraints);
}
```

**Effort**: 2-3 days  
**Dependencies**: User preferences, compatibility scoring

---

### Phase 4: Capsule Wardrobe (Week 7)

**Goal**: Identify most versatile items

#### 4.1 Capsule Wardrobe Generator
**Inspired by**: Creating Capsule Wardrobes (CVPR 2018)

```typescript
// New file: app/lib/capsuleWardrobe.ts

export interface CapsuleWardrobe {
  items: Array<{
    item: Item;
    versatilityScore: number;
    outfitCount: number; // How many outfits it can create
    reasons: string[];
  }>;
  totalOutfitCombinations: number;
  coverage: {
    weather: string[];
    occasions: string[];
    styles: string[];
  };
}

export async function generateCapsuleWardrobe(
  size: number = 10, // Default: 10-item capsule
  constraints?: {
    season?: 'spring' | 'summer' | 'fall' | 'winter';
    occasions?: string[];
  }
): Promise<CapsuleWardrobe> {
  // 1. Get all available items
  let items = await prisma.item.findMany({
    where: { state: 'available' },
    include: { images: true }
  });
  
  // 2. Filter by season if specified
  if (constraints?.season) {
    items = filterBySeason(items, constraints.season);
  }
  
  // 3. Score each item by versatility
  const scored = await Promise.all(
    items.map(async (item) => {
      const versatilityScore = await calculateVersatility(item, items);
      return { item, versatilityScore };
    })
  );
  
  // 4. Use greedy algorithm to select items
  // Start with highest versatility, then add items that maximize new combinations
  const selected: typeof scored = [];
  const remaining = [...scored].sort((a, b) => b.versatilityScore - a.versatilityScore);
  
  while (selected.length < size && remaining.length > 0) {
    if (selected.length === 0) {
      // First item: most versatile
      selected.push(remaining.shift()!);
    } else {
      // Subsequent items: maximize new outfit combinations
      const nextItem = findBestNextItem(selected, remaining);
      selected.push(nextItem);
      remaining.splice(remaining.indexOf(nextItem), 1);
    }
  }
  
  // 5. Calculate outfit combinations
  const combinations = calculateOutfitCombinations(selected.map(s => s.item));
  
  // 6. Analyze coverage
  const coverage = analyzeCoverage(selected.map(s => s.item));
  
  return {
    items: selected.map(s => ({
      item: s.item,
      versatilityScore: s.versatilityScore,
      outfitCount: countOutfitsForItem(s.item, selected.map(x => x.item)),
      reasons: explainVersatility(s.item)
    })),
    totalOutfitCombinations: combinations.length,
    coverage
  };
}

async function calculateVersatility(item: Item, allItems: Item[]): Promise<number> {
  let score = 0;
  
  // 1. Color versatility: neutral colors = more versatile
  const colors = item.colorPalette as string[];
  const neutralColors = colors?.filter(c => isNeutralColor(c)).length || 0;
  score += (neutralColors / (colors?.length || 1)) * 0.3;
  
  // 2. Style versatility: "casual" or "smart_casual" work with more items
  const attrs = item.attributes as any;
  if (['casual', 'smart_casual', 'classic'].includes(attrs?.style)) {
    score += 0.2;
  }
  
  // 3. Pattern: solid/simple = more versatile
  if (!attrs?.pattern || attrs.pattern === 'solid') {
    score += 0.2;
  }
  
  // 4. Category coverage: bottoms and tops are core pieces
  if (['tops', 'bottoms'].includes(item.category!)) {
    score += 0.2;
  }
  
  // 5. Compatibility with other items
  const compatibleCount = allItems.filter(other => {
    if (other.id === item.id) return false;
    const compatibility = scoreOutfitCompatibility([item, other]);
    return compatibility.score >= 0.7;
  }).length;
  
  score += Math.min(compatibleCount / 20, 0.1); // Normalize to 0-0.1
  
  return score;
}

function findBestNextItem(
  selected: Array<{ item: Item; versatilityScore: number }>,
  remaining: Array<{ item: Item; versatilityScore: number }>
): { item: Item; versatilityScore: number } {
  const selectedItems = selected.map(s => s.item);
  
  // Calculate how many NEW outfits each remaining item would add
  const scored = remaining.map(candidate => {
    const newOutfits = countNewOutfits(selectedItems, candidate.item);
    return { candidate, newOutfits };
  });
  
  // Pick item that adds most new outfits
  scored.sort((a, b) => b.newOutfits - a.newOutfits);
  return scored[0].candidate;
}

function countNewOutfits(existing: Item[], newItem: Item): number {
  // Count how many valid outfit combinations include the new item
  let count = 0;
  
  for (const item1 of existing) {
    for (const item2 of existing) {
      if (item1.id === item2.id) continue;
      
      const compatibility = scoreOutfitCompatibility([item1, item2, newItem]);
      if (compatibility.score >= 0.7) {
        count++;
      }
    }
  }
  
  return count;
}
```

**UI**:
- New page: `/capsule-wardrobe`
- Show selected items with versatility scores
- Display "X outfit combinations possible"
- Visualize coverage (weather, occasions)

**Effort**: 4-5 days  
**Dependencies**: Compatibility scoring

---

### Phase 5: Intelligence & Insights (Week 8)

#### 5.1 Wear Tracking & Rotation Suggestions
**Inspired by**: Fashion trend analysis papers

```typescript
// Update existing: app/analytics/page.tsx

export async function getWearAnalytics() {
  const items = await prisma.item.findMany({
    where: { state: 'available' },
    include: { outfitItems: true }
  });
  
  const analytics = items.map(item => {
    const daysSinceLastWorn = item.lastWornDate
      ? Math.floor((Date.now() - item.lastWornDate.getTime()) / (1000 * 60 * 60 * 24))
      : 999;
    
    const wearFrequency = item.outfitItems.length; // Total times worn
    
    return {
      item,
      daysSinceLastWorn,
      wearFrequency,
      status: classifyWearStatus(daysSinceLastWorn, wearFrequency)
    };
  });
  
  return {
    mostWorn: analytics.sort((a, b) => b.wearFrequency - a.wearFrequency).slice(0, 10),
    forgotten: analytics.filter(a => a.daysSinceLastWorn > 90),
    suggestions: generateRotationSuggestions(analytics)
  };
}

function generateRotationSuggestions(analytics: any[]): string[] {
  const suggestions: string[] = [];
  
  const forgotten = analytics.filter(a => a.daysSinceLastWorn > 60);
  if (forgotten.length > 0) {
    suggestions.push(`You have ${forgotten.length} items you haven't worn in 60+ days. Try rotating them in!`);
  }
  
  const overused = analytics.filter(a => a.wearFrequency > 20);
  if (overused.length > 0) {
    suggestions.push(`Your top ${overused.length} items are getting lots of wear. Consider giving them a rest.`);
  }
  
  return suggestions;
}
```

**ADHD-Friendly Features**:
- Gamification: "Unlock forgotten gems" badge
- Notifications: "You haven't worn this in 3 months"
- Visual chart: wear frequency over time

**Effort**: 3-4 days  
**Dependencies**: Wear tracking data

---

### Phase 6: Advanced Features (Week 9-12)

#### 6.1 Outfit Board Visualization
**Inspired by**: Generative models, fashion visualization papers

```typescript
// Use Gemini Image Generation to create outfit boards

export async function generateOutfitBoard(outfitId: string): Promise<string> {
  const outfit = await prisma.outfit.findUnique({
    where: { id: outfitId },
    include: {
      items: {
        include: {
          item: {
            include: { images: { where: { kind: 'ai_catalog' }, take: 1 } }
          }
        }
      }
    }
  });
  
  if (!outfit) throw new Error('Outfit not found');
  
  // Option 1: Simple collage (no AI, just layout images)
  const images = outfit.items
    .map(oi => oi.item.images[0]?.filePath)
    .filter(Boolean);
  
  const collage = await createImageCollage(images, {
    layout: 'grid',
    spacing: 10,
    background: '#ffffff'
  });
  
  // Save as outfit board image
  const imagePath = `outfit-boards/${outfit.id}.png`;
  await saveImage(collage, imagePath);
  
  await prisma.outfitImage.create({
    data: {
      outfitId: outfit.id,
      kind: 'outfit_board',
      filePath: imagePath
    }
  });
  
  return imagePath;
}

// Option 2: AI-generated flat lay (future)
export async function generateAIOutfitVisualization(outfitId: string): Promise<string> {
  // Use Gemini Image Generation
  const prompt = `Create a professional flat lay photograph of these clothing items arranged aesthetically...`;
  
  const generatedImage = await openRouterClient.generateImage({
    model: 'google/gemini-3-pro-image-preview',
    prompt,
    // Include reference images of actual items
  });
  
  return generatedImage;
}
```

**Effort**: 3-5 days for collages, 10-15 days for AI visualization  
**Dependencies**: Image manipulation library (Sharp)

---

## Technical Infrastructure

### Database Changes

```sql
-- Add embedding support (requires pgvector extension)
CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE items ADD COLUMN embedding vector(128);
CREATE INDEX ON items USING ivfflat (embedding vector_cosine_ops);

-- User preferences table
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  preferred_colors JSONB,
  preferred_styles JSONB,
  avoided_combinations JSONB,
  formality_preference FLOAT,
  pattern_tolerance FLOAT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Analytics tracking
CREATE TABLE wear_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  outfit_id UUID REFERENCES outfits(id) ON DELETE SET NULL,
  worn_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX ON wear_events(item_id, worn_date);
```

### Environment Variables

```bash
# Existing
OPENROUTER_API_KEY=
OPENROUTER_IMAGE_MODEL=google/gemini-3-pro-image-preview
OPENROUTER_VISION_MODEL=google/gemini-3-pro-preview
OPENROUTER_TEXT_MODEL=google/gemini-3-flash-preview

# New (optional)
ENABLE_EMBEDDINGS=true
ENABLE_PREFERENCE_LEARNING=true
CAPSULE_WARDROBE_SIZE=10
```

---

## Implementation Timeline

### Sprint 1: Core Compatibility (Week 1-2)
- [ ] Attribute-based compatibility scoring
- [ ] Smart accessory suggestions
- [ ] Integration with outfit generation
- [ ] UI for compatibility badges

**Deliverable**: Better outfit suggestions with explanations

---

### Sprint 2: Similarity Search (Week 3-4)
- [ ] Text-based similarity search
- [ ] "Find similar items" API endpoint
- [ ] UI for similarity browsing
- [ ] (Optional) Embedding generation with Gemini

**Deliverable**: "Show me items like this" feature

---

### Sprint 3: Personalization (Week 5-6)
- [ ] Outfit rating analysis
- [ ] User preference profiling
- [ ] Improved Panic Pick with preferences
- [ ] "Based on your style" indicators

**Deliverable**: System learns and adapts to user taste

---

### Sprint 4: Capsule Wardrobe (Week 7)
- [ ] Versatility scoring algorithm
- [ ] Capsule wardrobe generation
- [ ] Outfit combination calculator
- [ ] UI for capsule wardrobe page

**Deliverable**: "Build a capsule wardrobe" tool

---

### Sprint 5: Analytics (Week 8)
- [ ] Wear tracking enhancements
- [ ] Rotation suggestions
- [ ] Analytics dashboard
- [ ] Gamification elements

**Deliverable**: "Wardrobe insights" feature

---

### Sprint 6: Advanced (Week 9-12)
- [ ] Outfit board visualization
- [ ] Seasonal intelligence
- [ ] Advanced filters
- [ ] Polish and refinement

**Deliverable**: Production-ready advanced features

---

## Success Metrics

### Quantitative
- **Outfit generation quality**: Compatibility score avg > 0.75
- **User engagement**: Time to pick outfit < 2 minutes (down from 5+)
- **Feature adoption**: 70% of users try "find similar" within first week
- **Satisfaction**: Outfit rating up:down ratio > 3:1

### Qualitative (ADHD-Friendly)
- **Decision friction**: Users report less overwhelm
- **Confidence**: Users feel confident in outfit choices
- **Discovery**: Users rediscover forgotten items
- **Time savings**: Morning routine faster

---

## Risk Mitigation

### Technical Risks
1. **Gemini API costs**: Cache embeddings aggressively, use batch processing
2. **Performance**: Index database queries, use background jobs for heavy computation
3. **Data quality**: Ensure attributes are populated for compatibility scoring

### UX Risks
1. **Feature overload**: Progressive disclosure, hide advanced features behind "More" buttons
2. **Explanation fatigue**: Keep reasons short and actionable
3. **Bad suggestions**: Allow users to dismiss and provide feedback

---

## References & Further Reading

### Papers (Top 10 Most Relevant)
1. Context-Aware Visual Compatibility Prediction (CVPR 2019) - [Paper](https://arxiv.org/abs/1902.03646) | [Code](https://github.com/gcucurull/visual-compatibility)
2. Learning Fashion Compatibility with Bidirectional LSTMs (2017) - [Paper](https://arxiv.org/abs/1707.05691) | [Code](https://github.com/peternara/bilstm-Learning-Fashion-Compatibility-with-Bidirectional-LSTMs)
3. Creating Capsule Wardrobes from Fashion Images (CVPR 2018)
4. Fashion++: Minimal Edits for Outfit Improvement (ICCV 2019)
5. Learning Type-Aware Embeddings for Fashion Compatibility (ECCV 2018)
6. Neuroaesthetics in Fashion (CVPR 2015)
7. DeepFashion: Powering Robust Clothes Recognition (CVPR 2016)
8. Fashion Style in 128 Floats (CVPR 2016)
9. Toward Explainable Fashion Recommendation (2019)
10. TailorNet: Predicting Clothing in 3D (CVPR 2020)

### Datasets
- [DeepFashion](http://mmlab.ie.cuhk.edu.hk/projects/DeepFashion.html)
- [ModaNet (GitHub)](https://github.com/eBay/modanet)
- [Fashion-MNIST](https://github.com/zalandoresearch/fashion-mnist)

### Workshops & Conferences
- [KDD Workshop on AI for Fashion](https://kddfashion2020.mybluemix.net/)
- [CVPR/ICCV Workshop on CV for Fashion](https://sites.google.com/view/cvcreative2020)

---

**Document Owner**: Twin Style Development Team  
**Last Updated**: 2026-02-05  
**Status**: Ready for Implementation
