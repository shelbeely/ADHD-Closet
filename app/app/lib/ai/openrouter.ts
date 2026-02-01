// OpenRouter API Client
// Server-side only - never expose API keys to client

interface OpenRouterConfig {
  apiKey: string;
  baseUrl?: string;
  imageModel?: string;
  visionModel?: string;
  textModel?: string;
}

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{ 
    type: string; 
    text?: string; 
    image_url?: { url: string };
    imageUrl?: { url: string }; // Alternative format
  }>;
  images?: string[]; // For response messages with generated images
}

interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: 'json_object' };
  image_config?: {
    aspect_ratio?: string;
    image_size?: string;
  };
}

interface OpenRouterResponse {
  id: string;
  model: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
      images?: string[]; // For image generation responses
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

class OpenRouterClient {
  public config: Required<OpenRouterConfig>;

  constructor(config: OpenRouterConfig) {
    if (!config.apiKey) {
      throw new Error('OpenRouter API key is required');
    }

    this.config = {
      apiKey: config.apiKey,
      baseUrl: config.baseUrl || 'https://openrouter.ai/api/v1',
      // Use a model that supports image generation
      imageModel: config.imageModel || 'google/gemini-3-pro-image-preview',
      visionModel: config.visionModel || 'google/gemini-3-pro-preview',
      textModel: config.textModel || 'google/gemini-3-flash-preview',
    };
  }

  private async makeRequest(
    endpoint: string,
    body: any,
    retries = 3
  ): Promise<any> {
    const url = `${this.config.baseUrl}${endpoint}`;

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`,
            'HTTP-Referer': process.env.PUBLIC_BASE_URL || 'http://localhost:3000',
            'X-Title': 'Wardrobe AI Closet',
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(`OpenRouter API error (${response.status}): ${error}`);
        }

        return await response.json();
      } catch (error) {
        console.error(`OpenRouter request attempt ${attempt + 1} failed:`, error);
        
        if (attempt === retries - 1) {
          throw error;
        }
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  /**
   * Extract image from OpenRouter response
   * Handles multiple response formats
   */
  private extractImageFromResponse(message: any, context: string = 'image generation'): string {
    // Format 1: images array
    if (message.images && message.images.length > 0) {
      return message.images[0];
    }
    
    // Format 2: content with image URL or base64
    if (typeof message.content === 'string') {
      // Check if content is a URL or base64 image
      if (message.content.startsWith('http') || message.content.startsWith('data:image/')) {
        return message.content;
      }
      
      // Try to extract image URL from text
      const urlMatch = message.content.match(/https?:\/\/[^\s]+\.(jpg|jpeg|png|webp)/i);
      if (urlMatch) {
        return urlMatch[0];
      }
    }
    
    // If no image found, throw descriptive error
    throw new Error(
      `No image generated for ${context}. ` +
      `The model may not support image-to-image generation. ` +
      `Current model: ${this.config.imageModel}. ` +
      `Response: ${JSON.stringify(message).substring(0, 200)}. ` +
      `Try using: 'google/gemini-3-pro-image-preview'`
    );
  }

  /**
   * Public chat method for external use (e.g., visionEnhancements)
   */
  async chat(request: OpenRouterRequest): Promise<OpenRouterResponse> {
    return this.makeRequest('/chat/completions', request);
  }

  async generateCatalogImage(imageBase64: string): Promise<string> {
    const prompt = `Transform this clothing item photo into a professional catalog image:
- Remove or replace background with neutral, clean background
- Center the garment with consistent padding
- Preserve all colors, patterns, and graphic details exactly
- No text overlays or watermarks
- Minimize wrinkles only if it doesn't change the garment's appearance
- Create crisp edges without halos
- Output should be square format, well-lit, and catalog-quality`;

    const response = await this.makeRequest('/chat/completions', {
      model: this.config.imageModel,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
            },
          ],
        },
      ],
      temperature: 0.3,
      max_tokens: 4096,
      image_config: {
        aspect_ratio: '1:1',
        image_size: '1024x1024',
      },
    });

    return this.extractImageFromResponse(response.choices[0].message, 'catalog image generation');
  }

  async inferItemDetails(imageBase64: string, labelImageBase64?: string): Promise<any> {
    const systemPrompt = `You are an expert fashion cataloger specializing in emo/goth/alt styles. 
Analyze clothing items and provide structured data in JSON format.
Focus on accurate categorization, color identification, relevant style tags, and licensed merchandise detection.`;

    const userPrompt = `Analyze this clothing item and provide detailed information in JSON format:

Required fields:
- category: one of [tops, bottoms, dresses, outerwear, shoes, accessories, underwear_bras, jewelry, swimwear, activewear, sleepwear, loungewear, suits_sets]
- subType: specific sub-type based on category:
  - For accessories: one of [purse, bag, backpack, belt, hat, scarf, gloves, sunglasses, watch, other]
  - For jewelry: one of [necklace, earrings, bracelet, ring, anklet, brooch, other]
  - For shoes: one of [sneakers, boots, sandals, heels, flats, loafers, oxfords, platforms, other]
  - For bottoms: one of [jeans, dress_pants, casual_pants, cargo_pants, shorts, skirt, leggings, joggers, other]
  - For other categories: null
- colors: array of named colors (e.g., ["black", "dark purple"])
- colorPalette: array of hex codes for dominant colors
- pattern: description (e.g., "solid", "striped", "floral", "graphic print")
- attributes: object with relevant attributes:
  - For tops: neckline (crew, v-neck, scoop, boat, square, halter, off-shoulder, turtleneck), sleeveLength (sleeveless, short, 3/4, long), sleeveFit (fitted, loose, puff, bell), visualWeight (minimal, moderate, heavy, complex), silhouette (fitted, loose, oversized, boxy)
  - For bottoms: rise (low, mid, high), inseam, fit (skinny, slim, straight, wide, bootcut, flare), hemline (raw, cuffed, distressed), visualWeight (minimal, moderate, heavy), pocketStyle (description)
  - For dresses: neckline, sleeveLength, waistline (natural, empire, dropped, none), hemline, silhouette (fitted, A-line, shift, bodycon, flowy)
  - For outerwear: silhouette, length (cropped, hip, mid-thigh, knee, long), visualWeight
  - For shoes: heelHeight, heelThickness (none, slim, chunky, wedge), toeboxShape (rounded, almond, pointed, square), visualWeight (minimal, moderate, heavy), shoeType (from subType)
  - For accessories: accessoryType (from subType), size (small, medium, large), material, structure (structured, unstructured, semi-structured), visualWeight (minimal, moderate, heavy), occasion (casual, formal, both)
  - For jewelry: jewelryType (from subType), metal (gold, silver, rose gold, bronze, mixed, none), gemstones (yes/no), style (delicate, statement, chunky, minimalist), occasion (everyday, formal, special)
  - For swimwear: style (one-piece, two-piece, bikini, tankini, boardshorts, rash-guard), coverage (minimal, moderate, full), activity (swimming, surfing, beach, pool)
  - For activewear: activityType (gym, running, yoga, cycling, sports), fit (compression, fitted, loose), moisture-wicking (yes/no), visualWeight (minimal, moderate)
  - For sleepwear: style (pajamas, nightgown, robe, sleep-shirt, shorts-set), warmth (light, medium, heavy), season (summer, winter, all-season)
  - For loungewear: comfort-level (ultra-comfy, relaxed, presentable), style (sweats, joggers, lounge-set, casual), occasion (home-only, casual-outing)
  - For suits_sets: type (two-piece, three-piece, co-ord, matching-set), formality (casual, business-casual, formal), completeness (complete-set, mix-and-match)
- fitNotes: brief description of how the item fits and its proportions (e.g., "Oversized fit creates volume contrast", "High neckline flattens bust area", "Low rise may segment torso")
- pairingTips: array of 1-2 suggestions for what items work well with this piece (e.g., "Pairs well with high-waisted bottoms", "Best with minimal jewelry", "Works as statement piece")
- tags: array of style tags relevant to emo/goth/alt fashion

**Licensed Merchandise Detection:**
Carefully examine the item for band logos, movie/TV characters, game graphics, anime art, comic book characters, sports team logos, or other licensed designs:
- isLicensedMerch: boolean - true if this appears to be official licensed merchandise (band merch, movie/TV merch, game merch, etc.), false if generic/no franchise
- franchise: string or null - If licensed merch detected, provide the specific band name, movie title, TV show name, game title, anime name, comic name, sports team, or brand. Examples: "My Chemical Romance", "Star Wars", "The Legend of Zelda", "Naruto", "Marvel", "Manchester United". Leave null if not licensed merch.
- franchiseType: one of [band, movie, tv_show, game, anime, comic, sports, brand, other] or null - Type of franchise detected. Use "band" for music groups, "movie" for films, "tv_show" for TV series, "game" for video games, "anime" for anime series, "comic" for comic books/graphic novels, "sports" for sports teams, "brand" for fashion/lifestyle brands with logo prominence, "other" for licensed content that doesn't fit categories. Leave null if not licensed merch.

Examples of franchise detection:
- T-shirt with "Slipknot" logo and band artwork → isLicensedMerch: true, franchise: "Slipknot", franchiseType: "band"
- Hoodie with Baby Yoda/Grogu → isLicensedMerch: true, franchise: "The Mandalorian", franchiseType: "tv_show"
- Shirt with Mario graphics → isLicensedMerch: true, franchise: "Super Mario Bros", franchiseType: "game"
- Plain black t-shirt with no logos → isLicensedMerch: false, franchise: null, franchiseType: null

- confidence: object with confidence scores (0-1) for each field, including franchise detection

${labelImageBase64 ? 'Also analyze the label image to extract:' : ''}
${labelImageBase64 ? '- brand: brand name' : ''}
${labelImageBase64 ? '- sizeText: size information' : ''}
${labelImageBase64 ? '- materials: materials/fabric composition' : ''}

Return ONLY valid JSON, no additional text.`;

    const messages: OpenRouterMessage[] = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: [
          { type: 'text', text: userPrompt },
          {
            type: 'image_url',
            image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
          },
        ],
      },
    ];

    if (labelImageBase64) {
      messages[1].content = [
        ...(messages[1].content as any[]),
        {
          type: 'image_url',
          image_url: { url: `data:image/jpeg;base64,${labelImageBase64}` },
        },
      ];
    }

    const response: OpenRouterResponse = await this.makeRequest('/chat/completions', {
      model: this.config.visionModel,
      messages,
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    return JSON.parse(content);
  }

  async generateOutfits(
    items: Array<{ id: string; category: string; tags: string[]; colors: string[]; attributes?: any }>,
    constraints: {
      weather?: string;
      timeBudget?: 'quick' | 'normal';
      vibe?: 'dysphoria-safe' | 'confidence-boost' | 'dopamine' | 'neutral';
      occasion?: string;
      fitPrinciples?: string | string[]; // e.g., "balanced visual weight", "proportional silhouette"
    }
  ): Promise<any> {
    const systemPrompt = `You are a personal stylist specializing in emo/goth/alt fashion for ADHD users.
Generate outfit combinations that respect emotional constraints and style preferences.
Consider dysphoria-safe options, dopamine-boosting combinations, and confidence-building looks.
Apply fit and proportion principles: visual weight balance, harmonious necklines, proportional silhouettes, and minimal awkward horizontal segmentation.`;

    const userPrompt = `Generate 1-5 outfit combinations from these available items:

${items.map(item => `- ${item.id}: ${item.category} (${item.colors.join(', ')}) [${item.tags.join(', ')}] ${item.attributes ? `{${Object.entries(item.attributes).map(([k,v]) => `${k}:${v}`).join(', ')}}` : ''}`).join('\n')}

Constraints:
${constraints.weather ? `- Weather: ${constraints.weather}` : ''}
${constraints.timeBudget ? `- Time: ${constraints.timeBudget === 'quick' ? 'Quick to put on' : 'Normal'}` : ''}
${constraints.vibe ? `- Vibe: ${constraints.vibe}` : ''}
${constraints.occasion ? `- Occasion: ${constraints.occasion}` : ''}
${constraints.fitPrinciples ? `- Fit Principles: ${Array.isArray(constraints.fitPrinciples) ? constraints.fitPrinciples.join(', ') : constraints.fitPrinciples}` : ''}

IMPORTANT: Use an Orchestrated/Generative UI approach:
- Include accessories (purses, bags, jewelry) when they enhance the outfit
- Suggest shoes that match the occasion and weather
- Add jewelry strategically (e.g., statement necklace for simple outfits, minimal jewelry for busy patterns)
- Consider visual weight: add accessories to balance minimal outfits, keep minimal for complex/heavy pieces
- Match accessory colors to outfit palette (complementary or coordinating)
- For ADHD-friendly experience: each outfit should feel "complete" without overwhelming choices

Return JSON array with 1-5 outfits, each containing:
- items: array of {itemId, role} where role is the garment's function in outfit (include role: 'accessory', 'jewelry', 'shoes')
- explanation: short 1-2 sentence explanation of why this outfit works
- accessorySuggestions: object with:
  - included: array of accessory/jewelry items included in outfit with brief reason
  - optional: array of alternative accessory suggestions if user wants to swap
  - reasoning: brief explanation of accessory choices (e.g., "Minimal jewelry to let graphic tee be focal point")
- fitAnalysis: object with:
  - visualWeightBalance: brief assessment of how visual weight is distributed
  - proportionHarmony: assessment of how proportions work together
  - silhouetteDefinition: how the silhouette is defined
  - horizontalLines: note on body segmentation (good or awkward)
  - score: 0-1 score for overall fit harmony
- fitTips: array of 1-2 brief tips for improving fit or understanding what works
- swaps: optional array of {itemId, reason} for alternative pieces
- confidence: 0-1 score for how well this matches constraints

Order outfits by confidence score (best first).
Return ONLY valid JSON, no additional text.`;

    const response: OpenRouterResponse = await this.makeRequest('/chat/completions', {
      model: this.config.textModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    return JSON.parse(content);
  }

  async generateOutfitVisualization(
    itemImagesBase64: Array<{ id: string; base64: string; category: string }>,
    visualizationType: 'outfit_board' | 'person_wearing',
    outfitContext?: {
      weather?: string;
      vibe?: string;
      occasion?: string;
      explanation?: string;
    }
  ): Promise<string> {
    const contextDescription = outfitContext ? `
Context for this outfit:
${outfitContext.weather ? `- Weather: ${outfitContext.weather}` : ''}
${outfitContext.vibe ? `- Vibe: ${outfitContext.vibe}` : ''}
${outfitContext.occasion ? `- Occasion: ${outfitContext.occasion}` : ''}
${outfitContext.explanation ? `- Why it works: ${outfitContext.explanation}` : ''}
` : '';

    let prompt: string;
    if (visualizationType === 'outfit_board') {
      prompt = `Create a professional outfit board / flat lay showing these clothing items arranged aesthetically:

${itemImagesBase64.map((item, idx) => `${idx + 1}. ${item.category}`).join('\n')}
${contextDescription}

Style guidelines:
- Arrange items in a visually pleasing flat lay composition
- Use a clean, neutral background (white or light gray)
- Maintain consistent lighting and perspective
- Items should be neatly arranged and clearly visible
- Create a cohesive, magazine-quality aesthetic
- Preserve the colors and details of each item exactly as shown
- The layout should feel balanced and intentional`;
    } else {
      prompt = `Create a realistic visualization of a person wearing this complete outfit:

${itemImagesBase64.map((item, idx) => `${idx + 1}. ${item.category}`).join('\n')}
${contextDescription}

Style guidelines:
- Show a full-body view of a person wearing all these items together
- Use natural, flattering lighting
- Maintain outfit consistency with the provided items
- Preserve colors, patterns, and details exactly as shown in the reference images
- The person should have a neutral expression and pose
- Background should be simple and not distract from the outfit
- Create a realistic, fashion catalog quality image
- Ensure all items are visible and styled appropriately`;
    }

    // Build content array with prompt and all item images
    const contentArray: any[] = [{ type: 'text', text: prompt }];
    
    for (const item of itemImagesBase64) {
      contentArray.push({
        type: 'image_url',
        image_url: { url: `data:image/jpeg;base64,${item.base64}` },
      });
    }

    // Use Gemini or compatible image generation model via OpenRouter
    const response = await this.makeRequest('/chat/completions', {
      model: this.config.imageModel,
      messages: [
        {
          role: 'user',
          content: contentArray,
        },
      ],
      temperature: 0.5,
      max_tokens: 4096,
      image_config: {
        aspect_ratio: '1:1',
        image_size: '1024x1024',
      },
    });

    // Extract generated image from response
    const message = response.choices[0].message;
    
    // Check for images array (newer format)
    if (message.images && message.images.length > 0) {
      return message.images[0]; // URL or base64
    }
    
    // Fallback to content parsing
    return message.content;
  }


  /**
   * Generate a matching item to complement a reference piece
   * @param referenceImageBase64 - Item to match with (e.g., a top)
   * @param targetCategory - What to generate (e.g., "bottoms", "accessories")
   * @param styleNotes - Additional style guidance
   */
  async generateMatchingItem(
    referenceImageBase64: string,
    targetCategory: string,
    styleNotes?: string
  ): Promise<string> {
    const prompt = `Generate a ${targetCategory} item that perfectly complements and matches this reference piece:

Style matching requirements:
- Extract and match the color palette from the reference
- Match the aesthetic and style level (casual/formal/edgy/etc.)
- Coordinate patterns (solid with pattern, or complementary patterns)
- Match the visual weight appropriately
- Ensure colors harmonize (complementary, analogous, or matching tones)
${styleNotes ? `- Additional guidance: ${styleNotes}` : ''}

Output:
- Professional catalog-quality image
- Clean, neutral background
- Well-lit and clearly visible
- Realistic fabric textures
- The item should look like it belongs to the same outfit`;

    const response = await this.makeRequest('/chat/completions', {
      model: this.config.imageModel,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${referenceImageBase64}` },
            },
          ],
        },
      ],
      temperature: 0.6,
      max_tokens: 4096,
      image_config: {
        aspect_ratio: '1:1',
        image_size: '1024x1024',
      },
    });

    return this.extractImageFromResponse(response.choices[0].message, 'matching item generation');
  }

  /**
   * Apply style transfer from a reference image/mood board
   * @param itemImageBase64 - Item to restyle
   * @param styleReferenceBase64 - Image with desired aesthetic/style
   * @param transferStrength - How much to transform (0.3-0.9)
   */
  async applyStyleTransfer(
    itemImageBase64: string,
    styleReferenceBase64: string,
    transferStrength: number = 0.6
  ): Promise<string> {
    const strengthDescription = transferStrength < 0.5 
      ? 'subtle inspiration' 
      : transferStrength < 0.7 
        ? 'moderate transformation' 
        : 'strong transformation';

    const prompt = `Apply the aesthetic and styling from the style reference to this clothing item:

Style transfer guidance (${strengthDescription}):
- Adopt the color palette and tones from the style reference
- Match the overall vibe, mood, and aesthetic
- Incorporate similar patterns, textures, or design elements
- Maintain the base garment type and general fit
- The result should feel like it belongs in the style reference's aesthetic
- Strength: ${(transferStrength * 100).toFixed(0)}% transformation

Output:
- Professional catalog quality
- Clean background
- Preserve garment wearability
- Realistic and cohesive result`;

    const response = await this.makeRequest('/chat/completions', {
      model: this.config.imageModel,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'text', text: 'Item to transform:' },
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${itemImageBase64}` },
            },
            { type: 'text', text: 'Style reference to match:' },
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${styleReferenceBase64}` },
            },
          ],
        },
      ],
      temperature: 0.5 + (transferStrength * 0.3),
      max_tokens: 4096,
      image_config: {
        aspect_ratio: '1:1',
        image_size: '1024x1024',
      },
    });

    return this.extractImageFromResponse(response.choices[0].message, 'style transfer');
  }


  /**
   * Generate outfit variations with a specific context/occasion
   * @param itemImagesBase64 - Array of outfit item images to use as base
   * @param targetContext - Target occasion/setting
   * @param maintainPieces - Which pieces to keep unchanged
   */
  async generateOutfitContextVariation(
    itemImagesBase64: Array<{ id: string; base64: string; category: string }>,
    targetContext: string,
    maintainPieces?: string[]
  ): Promise<string> {
    const maintainedPieces = maintainPieces && maintainPieces.length > 0
      ? `Keep these pieces unchanged: ${maintainPieces.join(', ')}`
      : 'You may adapt any pieces as needed';

    const prompt = `Adapt this outfit for: ${targetContext}

Reference outfit pieces:
${itemImagesBase64.map((item, idx) => `${idx + 1}. ${item.category} (ID: ${item.id})`).join('\n')}

Adaptation guidelines:
- Transform the outfit to be appropriate for: ${targetContext}
- ${maintainedPieces}
- Maintain the overall color harmony and aesthetic
- Adjust formality, coverage, or style as needed
- Preserve the wearer's personal style
- Result should be a cohesive, wearable outfit

Output:
- Show complete outfit suitable for the context
- Professional visualization quality
- Clean background
- All items clearly visible`;

    const contentArray: any[] = [{ type: 'text', text: prompt }];
    for (const item of itemImagesBase64) {
      contentArray.push({
        type: 'image_url',
        image_url: { url: `data:image/jpeg;base64,${item.base64}` },
      });
    }

    const response = await this.makeRequest('/chat/completions', {
      model: this.config.imageModel,
      messages: [
        {
          role: 'user',
          content: contentArray,
        },
      ],
      temperature: 0.6,
      max_tokens: 4096,
      image_config: {
        aspect_ratio: '1:1',
        image_size: '1024x1024',
      },
    });

    return this.extractImageFromResponse(response.choices[0].message, 'image generation');
  }

  /**
   * Generate a coordinated set (matching pieces)
   * @param anchorImageBase64 - The piece to build around
   * @param setType - Type of set to create
   */
  async generateCoordinatedSet(
    anchorImageBase64: string,
    setType: 'two-piece' | 'three-piece' | 'complete-outfit'
  ): Promise<string> {
    const setGuidance = {
      'two-piece': 'Generate one matching piece (top+bottom or jacket+dress)',
      'three-piece': 'Generate two coordinating pieces (top+bottom+layer or similar)',
      'complete-outfit': 'Generate a full outfit with all necessary pieces',
    };

    const prompt = `Create a coordinated ${setType} set based on this anchor piece:

Set requirements:
- ${setGuidance[setType]}
- Match or complement the color palette
- Coordinate patterns and textures
- Match the style level and aesthetic
- Ensure visual balance and harmony
- All pieces should look intentionally coordinated

Output:
- Show all pieces in a flat lay / outfit board style
- Professional catalog quality
- Clean, neutral background
- All items clearly visible and well-arranged
- Should look like a cohesive, ready-to-wear set`;

    const response = await this.makeRequest('/chat/completions', {
      model: this.config.imageModel,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${anchorImageBase64}` },
            },
          ],
        },
      ],
      temperature: 0.5,
      max_tokens: 4096,
      image_config: {
        aspect_ratio: '1:1',
        image_size: '1024x1024',
      },
    });

    return this.extractImageFromResponse(response.choices[0].message, 'coordinated set generation');
  }
}

// Singleton instance
let openRouterClient: OpenRouterClient | null = null;

export function getOpenRouterClient(): OpenRouterClient {
  if (!openRouterClient) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error('OPENROUTER_API_KEY environment variable is required');
    }

    openRouterClient = new OpenRouterClient({
      apiKey,
      baseUrl: process.env.OPENROUTER_BASE_URL,
      imageModel: process.env.OPENROUTER_IMAGE_MODEL,
      visionModel: process.env.OPENROUTER_VISION_MODEL,
      textModel: process.env.OPENROUTER_TEXT_MODEL,
    });
  }

  return openRouterClient;
}

export default OpenRouterClient;
