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
  modalities?: string[]; // For image generation: ['image', 'text']
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
  private config: Required<OpenRouterConfig>;

  constructor(config: OpenRouterConfig) {
    if (!config.apiKey) {
      throw new Error('OpenRouter API key is required');
    }

    this.config = {
      apiKey: config.apiKey,
      baseUrl: config.baseUrl || 'https://openrouter.ai/api/v1',
      imageModel: config.imageModel || 'black-forest-labs/flux-pro',
      visionModel: config.visionModel || 'anthropic/claude-3.5-sonnet',
      textModel: config.textModel || 'anthropic/claude-3.5-sonnet',
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

  async generateCatalogImage(imageBase64: string): Promise<string> {
    const prompt = `Transform this clothing item photo into a professional catalog image:
- Remove or replace background with neutral, clean background
- Center the garment with consistent padding
- Preserve all colors, patterns, and graphic details exactly
- No text overlays or watermarks
- Minimize wrinkles only if it doesn't change the garment's appearance
- Create crisp edges without halos
- Output should be square format, well-lit, and catalog-quality`;

    // OpenRouter uses modalities for image generation
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
      modalities: ['image', 'text'], // Enable image generation
      temperature: 0.3,
      max_tokens: 1000,
    });

    // Extract generated image from response
    // OpenRouter returns images in the message.images array or content
    const message = response.choices[0].message;
    
    // Check for images array (newer format)
    if (message.images && message.images.length > 0) {
      return message.images[0]; // URL or base64
    }
    
    // Fallback to content parsing
    return message.content;
  }

  async inferItemDetails(imageBase64: string, labelImageBase64?: string): Promise<any> {
    const systemPrompt = `You are an expert fashion cataloger specializing in emo/goth/alt styles. 
Analyze clothing items and provide structured data in JSON format.
Focus on accurate categorization, color identification, and relevant style tags.`;

    const userPrompt = `Analyze this clothing item and provide detailed information in JSON format:

Required fields:
- category: one of [tops, bottoms, dresses, outerwear, shoes, accessories, underwear_bras, jewelry]
- colors: array of named colors (e.g., ["black", "dark purple"])
- colorPalette: array of hex codes for dominant colors
- pattern: description (e.g., "solid", "striped", "floral", "graphic print")
- attributes: object with relevant attributes:
  - For tops: neckline, sleeveLength
  - For bottoms: rise, inseam, fit
  - For shoes: heelHeight, style
  - For accessories: type, material
- tags: array of style tags relevant to emo/goth/alt fashion
- confidence: object with confidence scores (0-1) for each field

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
    items: Array<{ id: string; category: string; tags: string[]; colors: string[] }>,
    constraints: {
      weather?: string;
      timeBudget?: 'quick' | 'normal';
      vibe?: 'dysphoria-safe' | 'confidence-boost' | 'dopamine' | 'neutral';
      occasion?: string;
    }
  ): Promise<any> {
    const systemPrompt = `You are a personal stylist specializing in emo/goth/alt fashion for ADHD users.
Generate outfit combinations that respect emotional constraints and style preferences.
Consider dysphoria-safe options, dopamine-boosting combinations, and confidence-building looks.`;

    const userPrompt = `Generate 1-5 outfit combinations from these available items:

${items.map(item => `- ${item.id}: ${item.category} (${item.colors.join(', ')}) [${item.tags.join(', ')}]`).join('\n')}

Constraints:
${constraints.weather ? `- Weather: ${constraints.weather}` : ''}
${constraints.timeBudget ? `- Time: ${constraints.timeBudget === 'quick' ? 'Quick to put on' : 'Normal'}` : ''}
${constraints.vibe ? `- Vibe: ${constraints.vibe}` : ''}
${constraints.occasion ? `- Occasion: ${constraints.occasion}` : ''}

Return JSON array with 1-5 outfits, each containing:
- items: array of {itemId, role} where role is the garment's function in outfit
- explanation: short 1-2 sentence explanation of why this outfit works
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
      modalities: ['image', 'text'],
      temperature: 0.5,
      max_tokens: 1000,
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
