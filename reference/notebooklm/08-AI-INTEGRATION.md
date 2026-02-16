# Twin Style - AI Integration and Workflows

## AI Provider: OpenRouter

**Website**: https://openrouter.ai/  
**Why OpenRouter**: Single API for multiple AI models, no vendor lock-in, pay-per-use pricing

### API Configuration

```bash
# Required environment variable
OPENROUTER_API_KEY="sk-or-v1-..."

# Model configuration (optional, defaults provided)
OPENROUTER_IMAGE_MODEL="google/gemini-3-pro-image-preview"
OPENROUTER_VISION_MODEL="google/gemini-3-pro-preview"
OPENROUTER_TEXT_MODEL="google/gemini-3-flash-preview"
```

## AI Models Used

### 1. Image Generation Model

**Current**: `google/gemini-3-pro-image-preview`  
**Purpose**: Generate catalog-style images from photos  
**Pricing**: ~$0.04 per image  
**Speed**: ~10-30 seconds

**Input**: Original photo (any quality, background, angle)  
**Output**: Clean, centered, professional catalog image (1024x1024)

**Alternatives**:
- `openai/dall-e-3`: Alternative image generation model
- `stability-ai/stable-diffusion-xl`: Alternative image generation model

**Model Selection Guide**: https://shelbeely.github.io/ADHD-Closet/features/MODEL_SELECTION/

### 2. Vision Model (OCR + Analysis)

**Current**: `google/gemini-3-pro-preview`  
**Purpose**: Analyze images for category, colors, attributes  
**Pricing**: ~$0.002 per prompt token, ~$0.012 per completion token  
**Speed**: ~5-15 seconds

**Capabilities**:
- Category detection (tops, bottoms, dresses, etc.)
- Color extraction (named colors + hex palette)
- Pattern recognition (solid, striped, graphic, etc.)
- Attribute inference (neckline, sleeve length, etc.)
- OCR for label text (brand, size, materials)

**Alternatives**:
- `google/gemini-3-flash-preview`: Faster, more cost-effective version

**Vision Model Guide**: https://shelbeely.github.io/ADHD-Closet/features/VISION_MODEL_GUIDE/

### 3. Text Generation Model

**Current**: `google/gemini-3-flash-preview`  
**Purpose**: Generate outfit combinations and explanations  
**Pricing**: ~$0.0005 per prompt token, ~$0.003 per completion token  
**Speed**: ~5-10 seconds

**Capabilities**:
- Outfit combination suggestions
- Styling explanations
- Swap recommendations
- Constraint-based filtering
- Natural language responses

**Alternatives**:
- `google/gemini-3-pro-preview`: Higher quality reasoning

## AI Job Queue System

### BullMQ + Redis

**Queue Implementation**: BullMQ 5.x  
**Backend**: Redis 7+  
**Concurrency**: 3 parallel workers  
**Retry Strategy**: Exponential backoff, max 3 attempts

### Job Types

#### 1. generate_catalog_image

**Trigger**: Upload `original_main` or `original_back` image  
**Input**: 
```json
{
  "itemId": "uuid",
  "imageId": "uuid",
  "imagePath": "images/item-id/image-id.jpg"
}
```

**Process**:
1. Read image from disk
2. Convert to base64
3. Call image generation model
4. Download generated image
5. Save as `ai_catalog` ImageAsset
6. Generate thumbnail (512px WebP)

**Output**:
```json
{
  "imageId": "uuid",
  "filePath": "images/item-id/catalog-id.webp",
  "width": 1024,
  "height": 1024
}
```

**Estimated Time**: 10-30 seconds  
**Estimated Cost**: ~$0.04

#### 2. infer_item

**Trigger**: Item has images, needs categorization  
**Input**:
```json
{
  "itemId": "uuid",
  "imageIds": ["uuid1", "uuid2"]
}
```

**Process**:
1. Load item images
2. Convert to base64
3. Build vision prompt
4. Call vision model
5. Parse structured response
6. Update Item with inferred data

**Prompt Structure**:
```
Analyze this clothing item and return JSON with:
{
  "category": "tops|bottoms|dresses|...",
  "colors": ["black", "white"],
  "colorPalette": ["#000000", "#FFFFFF"],
  "pattern": "solid|striped|graphic|...",
  "attributes": {
    "neckline": "crew",
    "sleeve_length": "short",
    ...
  },
  "tags": ["goth", "band-tee"],
  "confidence": 0.92
}

Style context: emo/goth/alt fashion
```

**Output**:
```json
{
  "category": "tops",
  "colors": ["black", "white"],
  "colorPalette": ["#000000", "#FFFFFF", "#333333"],
  "pattern": "graphic",
  "attributes": {
    "neckline": "crew",
    "sleeve_length": "short",
    "fit": "regular"
  },
  "tags": ["goth", "band-tee", "graphic"],
  "confidence": 0.92
}
```

**Estimated Time**: 5-15 seconds  
**Estimated Cost**: ~$0.01

#### 3. extract_label

**Trigger**: Upload `label_brand` or `label_care` image  
**Input**:
```json
{
  "itemId": "uuid",
  "imageIds": ["label-uuid"]
}
```

**Process**:
1. Load label images
2. Convert to base64
3. Build OCR prompt
4. Call vision model with OCR focus
5. Parse text extraction
6. Update Item with label data

**Prompt Structure**:
```
Read text from this clothing label and extract:
{
  "brand": "Brand Name",
  "size": "M",
  "materials": "100% Cotton",
  "care": "Machine wash cold",
  "confidence": 0.88
}
```

**Output**:
```json
{
  "brand": "Killstar",
  "size": "M",
  "materials": "100% Cotton",
  "care": "Machine wash cold, tumble dry low",
  "confidence": 0.88
}
```

**Estimated Time**: 5-10 seconds  
**Estimated Cost**: ~$0.01

#### 4. generate_outfit

**Trigger**: User requests outfit generation  
**Input**:
```json
{
  "constraints": {
    "weather": "cool",
    "vibe": "confidence_boost",
    "occasion": "concert",
    "timeAvailable": "normal"
  },
  "availableItems": ["item-uuid-1", "item-uuid-2", ...]
}
```

**Process**:
1. Load available items with attributes
2. Build outfit generation prompt
3. Call text generation model
4. Parse outfit suggestions
5. Validate item combinations
6. Create Outfit and OutfitItem records

**Prompt Structure**:
```
Generate 3 outfit combinations from these items for:
- Weather: Cool (50-69°F)
- Vibe: Confidence boost
- Occasion: Concert
- Time: Normal (15+ min to get ready)

Style: Emo/goth/alt aesthetic

Items available:
[List of items with categories, colors, attributes]

Return JSON array:
[
  {
    "items": {
      "top": "item-uuid-1",
      "bottom": "item-uuid-2",
      "shoes": "item-uuid-3",
      "outerwear": "item-uuid-4"
    },
    "explanation": "Why this outfit works...",
    "swapSuggestions": "Alternative pieces...",
    "confidence": 0.95
  }
]

Rules:
- Max 3 outfits
- Always include: top/dress, bottom, shoes
- Optional: outerwear, accessories
- Consider weather constraints
- Match style aesthetic
- Explain color/pattern harmony
```

**Output**:
```json
{
  "outfits": [
    {
      "items": {
        "top": "item-uuid-1",
        "bottom": "item-uuid-2",
        "shoes": "item-uuid-3",
        "outerwear": "item-uuid-4"
      },
      "explanation": "Black band tee with ripped jeans creates a classic punk look. Leather jacket adds edge and warmth. Platform boots complete the concert-ready outfit with comfort and style.",
      "swapSuggestions": "Swap platforms for combat boots for more mobility, or remove jacket if venue is warm.",
      "confidence": 0.95
    }
  ]
}
```

**Estimated Time**: 10-20 seconds  
**Estimated Cost**: ~$0.001

### Job Lifecycle

```
Queued → Running → Succeeded
                 → Failed (retry if attempts < 3)
                 → Needs Review (AI uncertain)
```

**Status Flow**:
```typescript
enum AIJobStatus {
  queued        // Waiting for worker
  running       // Currently processing
  succeeded     // Completed successfully
  failed        // Failed after retries
  needs_review  // AI uncertain, human review needed
}
```

**Worker Configuration**:
```typescript
const worker = new Worker('ai-jobs', processJob, {
  connection: redis,
  concurrency: 3,  // Process 3 jobs in parallel
  limiter: {
    max: 10,       // Max 10 jobs per minute
    duration: 60000,
  },
  settings: {
    maxStalledCount: 2,
    stalledInterval: 30000,
  },
});
```

### Job Monitoring

**Database Tracking**: All jobs logged in `AIJob` table

```typescript
model AIJob {
  id              String       @id @default(uuid())
  type            AIJobType
  status          AIJobStatus
  
  itemId          String?
  outfitId        String?
  
  inputRefs       Json?        // Input parameters
  outputJson      Json?        // Parsed AI response
  confidenceJson  Json?        // Confidence scores
  modelName       String?      // Model used
  rawResponse     String?      // Full API response
  error           String?      // Error message if failed
  
  attempts        Int          @default(0)
  maxAttempts     Int          @default(3)
  
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
  completedAt     DateTime?
}
```

**Viewing Jobs**:
```bash
# Via API
curl http://localhost:3000/api/ai/jobs

# Via Prisma Studio
npm run prisma:studio

# Via Redis CLI
docker exec -it wardrobe-redis redis-cli
KEYS bull:ai-jobs:*
```

**Optional Bull Board Dashboard**:
```bash
# Install Bull Board
npm install @bull-board/api @bull-board/express

# Access at http://localhost:3000/admin/queues
```

## Prompt Engineering

### Image Generation Prompts

**Catalog Image Prompt Template**:
```
Create a professional catalog-style product photo of this [ITEM_CATEGORY]:

Requirements:
- Square format (1024x1024)
- Center the item with consistent padding
- Neutral background (white or light gray)
- Preserve all colors and patterns accurately
- Show complete item clearly
- Professional lighting
- No text or watermarks
- Clean, minimalist style

Style reference: Professional e-commerce product photography
```

### Vision Analysis Prompts

**Categorization Prompt Template**:
```
Analyze this clothing item photo and extract detailed information.

Return strict JSON format:
{
  "category": "tops|bottoms|dresses|outerwear|shoes|accessories|underwear_bras|jewelry|swimwear|activewear|sleepwear|loungewear|suits_sets",
  "colors": ["primary_color", "secondary_color"],
  "colorPalette": ["#HEX1", "#HEX2", "#HEX3"],
  "pattern": "solid|striped|plaid|graphic|floral|abstract|animal_print|geometric",
  "attributes": {
    // Category-specific attributes
  },
  "tags": ["style_keyword_1", "style_keyword_2"],
  "confidence": 0.0-1.0
}

Style context: Emo/goth/alt fashion aesthetic
Brand aesthetic: Killstar, Disturbia, Blackcraft, Hot Topic

Instructions:
- Be specific with colors (use common color names)
- Extract hex values from visible colors
- Identify pattern type accurately
- Include relevant style tags
- Provide confidence score for overall analysis
```

**OCR Label Extraction Prompt**:
```
Read and extract text from this clothing label.

Return JSON:
{
  "brand": "Brand name",
  "size": "Size text",
  "materials": "Material composition",
  "care": "Care instructions",
  "confidence": 0.0-1.0
}

Instructions:
- Extract exact text as shown
- Combine multiple label photos if provided
- Note if text is unclear or partially visible
- Provide confidence for each field
```

### Outfit Generation Prompts

**Outfit Combination Prompt Template**:
```
Generate [NUM] outfit combinations for a [USER_STYLE] wardrobe.

Context:
- Weather: [WEATHER] ([TEMP_RANGE])
- Vibe: [VIBE_DESCRIPTION]
- Occasion: [OCCASION]
- Time available: [TIME_CONSTRAINT]
- Style aesthetic: Emo/goth/alt

Available items:
[FORMATTED_ITEM_LIST]

Return JSON array (max [NUM] outfits):
[
  {
    "items": {
      "top": "item-id",        // or "dress"
      "bottom": "item-id",     // omit if dress
      "shoes": "item-id",
      "outerwear": "item-id",  // optional
      "accessory": "item-id"   // optional
    },
    "explanation": "Why this outfit works (2-3 sentences)",
    "swapSuggestions": "Alternative pieces to consider",
    "confidence": 0.0-1.0
  }
]

Rules:
1. Always include top/dress, shoes
2. Include bottom unless dress
3. Consider weather constraints
4. Match color harmony principles
5. Balance proportions
6. Respect style aesthetic
7. Explain WHY combination works
8. Rank by confidence (best first)
```

## Error Handling

### AI API Errors

**Common Errors**:
- `RATE_LIMIT`: Too many requests
- `INVALID_API_KEY`: API key issue
- `MODEL_NOT_FOUND`: Model unavailable
- `CONTEXT_LENGTH_EXCEEDED`: Input too large
- `TIMEOUT`: Request took too long

**Handling Strategy**:
```typescript
try {
  const response = await openRouterAPI.generate(prompt);
  return response.data;
} catch (error) {
  if (error.code === 'RATE_LIMIT') {
    // Retry with exponential backoff
    await wait(retryDelay);
    return retry();
  }
  if (error.code === 'TIMEOUT') {
    // Mark job for retry
    throw new JobRetryError(error.message);
  }
  // Log and fail job
  logger.error('AI API Error:', error);
  throw new JobFailedError(error.message);
}
```

### Response Validation

**JSON Parsing**:
```typescript
try {
  const parsed = JSON.parse(aiResponse);
  const validated = responseSchema.parse(parsed);
  return validated;
} catch (error) {
  // Invalid response, mark for review
  await markJobForReview(jobId, {
    error: 'Invalid AI response format',
    rawResponse: aiResponse,
  });
  throw new JobNeedsReviewError();
}
```

### Confidence Thresholds

**Auto-Accept**: confidence ≥ 0.90  
**Review Required**: confidence < 0.70  
**User Decision**: 0.70 ≤ confidence < 0.90

```typescript
if (result.confidence >= 0.90) {
  await autoApplyResult(result);
} else if (result.confidence >= 0.70) {
  await flagForUserReview(result);
} else {
  await markAsNeedsReview(result, 'Low confidence');
}
```

## Cost Management

### Current Pricing (Approximate)

| Operation | Model | Cost per Call | Typical Monthly (100 items) |
|-----------|-------|---------------|----------------------------|
| Catalog image generation | Flux 1.1 Pro | $0.04 | $8.00 (200 images) |
| Item inference | Gemini Flash | $0.01 | $1.00 (100 items) |
| Label extraction | Gemini Flash | $0.01 | $0.50 (50 labels) |
| Outfit generation | Gemini Flash | $0.001 | $0.30 (300 outfits) |
| **Total** | | | **~$10/month** |

### Cost Optimization Strategies

1. **Thumbnail generation locally**: Use Sharp, not AI
2. **Batch processing**: Process multiple items together when possible
3. **Cache responses**: Store AI outputs, don't regenerate
4. **Free tier models**: Use free models for non-critical tasks
5. **Confidence thresholds**: Skip low-confidence re-processing

### Toggle AI Processing

```bash
# Disable AI in .env
AI_ENABLED=false
```

When disabled:
- Manual categorization required
- No catalog image generation
- No outfit AI suggestions
- App remains fully functional for manual use

## Performance Optimization

### Image Optimization

**Before sending to AI**:
```typescript
// Resize large images to reduce API costs
const optimized = await sharp(imageBuffer)
  .resize(2048, 2048, { fit: 'inside' })
  .jpeg({ quality: 85 })
  .toBuffer();
```

### Parallel Processing

**Process multiple items simultaneously**:
```typescript
// Queue all jobs at once
const jobs = items.map(item => 
  queue.add('infer_item', { itemId: item.id })
);

// Wait for completion
await Promise.all(jobs.map(j => j.waitUntilFinished()));
```

### Status Polling Optimization

**Client-side polling with exponential backoff**:
```typescript
async function pollJobStatus(jobId: string) {
  let delay = 1000;  // Start with 1 second
  const maxDelay = 10000;  // Max 10 seconds
  
  while (true) {
    const job = await fetchJobStatus(jobId);
    
    if (job.status !== 'queued' && job.status !== 'running') {
      return job;
    }
    
    await wait(delay);
    delay = Math.min(delay * 1.5, maxDelay);  // Exponential backoff
  }
}
```

## Future AI Features

### Planned Enhancements

1. **Embedding-Based Similarity**:
   - Generate vector embeddings for items
   - Find similar items by style
   - Recommend complementary pieces

2. **Virtual Try-On**:
   - AI-generated person wearing outfit
   - Body type considerations
   - Pose variety

3. **Style Transfer**:
   - Generate variations of existing items
   - Different colors/patterns
   - Seasonal adaptations

4. **Trend Analysis**:
   - Identify wardrobe trends over time
   - Suggest purchases based on gaps
   - Seasonal rotation planning

### Experimental Features

**Vision API Endpoints**:
- `/api/vision/similarity`: Find similar items
- `/api/vision/analyze`: Analyze uploaded image
- `/api/vision/try-on`: Virtual try-on (future)

**Image Generation Endpoints**:
- `/api/images/style-transfer`: Apply style to item
- `/api/images/generate-matching`: Generate matching piece
- `/api/images/outfit-context`: Generate outfit visualization

## External Resources

- **OpenRouter Documentation**: https://openrouter.ai/docs
- **Flux Documentation**: https://blackforestlabs.ai/
- **Gemini API Docs**: https://ai.google.dev/docs
- **BullMQ Documentation**: https://docs.bullmq.io/
- **Model Selection Guide**: https://shelbeely.github.io/ADHD-Closet/features/MODEL_SELECTION/
- **Vision Model Guide**: https://shelbeely.github.io/ADHD-Closet/features/VISION_MODEL_GUIDE/
