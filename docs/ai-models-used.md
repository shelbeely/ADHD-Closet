# AI Models Currently Used in ADHD Closet

This document provides a complete overview of all AI models used in the ADHD Closet codebase.

## Overview

The application uses **three different AI models** via the OpenRouter API, each optimized for specific tasks:

1. **Image Generation Model** - Creates catalog images and outfit visualizations
2. **Vision Model** - Analyzes clothing items and extracts information
3. **Text Model** - Generates outfit recommendations and explanations

## Current Configuration

### Recommended Setup (from `.env.example`)

```bash
# Image generation - REQUIRED for catalog images and visualizations
OPENROUTER_IMAGE_MODEL="google/gemini-3-pro-image-preview"

# Vision model - BEST for item analysis, OCR, and detail detection  
OPENROUTER_VISION_MODEL="google/gemini-3-pro-preview"

# Text model - FAST and cost-effective for outfit generation
OPENROUTER_TEXT_MODEL="google/gemini-3-flash-preview"
```

### Fallback Defaults (Hard-coded)

If environment variables are not set, the code uses these fallback models:

```typescript
// From app/app/lib/ai/worker.ts and openrouter.ts
imageModel: 'google/gemini-3-pro-image-preview'
visionModel: 'google/gemini-3-pro-preview'  
textModel: 'google/gemini-3-flash-preview'
```

## Model Details

### 1. Image Generation Model

**Current**: `google/gemini-3-pro-image-preview`  
**Fallback**: `google/gemini-3-pro-image-preview`

**Used For**:
- Generating clean catalog images from user photos
- Creating outfit visualization boards
- Color variation generation
- Person-wearing visualization (future feature)

**Implementation Locations**:
- `app/app/lib/ai/worker.ts` - `processCatalogImageGeneration()` (line 142)
- `app/app/lib/ai/worker.ts` - `processOutfitVisualization()` (line 427)
- `app/app/api/outfits/[id]/visualize/route.ts` (line 78)
- `app/app/lib/ai/openrouter.ts` - Default config (line 66)

**Alternative Options**:
- `openai/dall-e-3`
- `stability-ai/stable-diffusion-xl`

### 2. Vision Model

**Current**: `google/gemini-3-pro-preview`  
**Fallback**: `google/gemini-3-pro-preview`

**Used For**:
- Item categorization (tops, bottoms, shoes, etc.)
- Color detection and extraction
- Attribute inference (sleeve length, neckline, patterns)
- Brand and size OCR from labels
- Material identification
- Condition assessment

**Implementation Locations**:
- `app/app/lib/ai/worker.ts` - `processItemInference()` (line 228)
- `app/app/lib/ai/worker.ts` - `processLabelExtraction()` (line 234)
- `app/app/lib/ai/openrouter.ts` - `inferItemDetails()` method (line 67)

**Capabilities**:
- Multi-modal input (text + images + files)
- Structured JSON output
- 1M token context window
- OCR for text in images

### 3. Text Generation Model

**Current**: `google/gemini-3-flash-preview`  
**Fallback**: `google/gemini-3-flash-preview`

**Used For**:
- Outfit generation based on constraints (weather, occasion, vibe)
- Outfit explanations and styling tips
- Swap suggestions for outfit variations
- Structured JSON responses for outfit data

**Implementation Locations**:
- `app/app/lib/ai/worker.ts` - `processOutfitGeneration()` (line 276)
- `app/app/api/outfits/generate/route.ts` (line 135)
- `app/app/lib/ai/openrouter.ts` - `generateOutfits()` method (line 68)

**Capabilities**:
- Fast reasoning (2-3 seconds typical)
- Constraint-based generation
- Large context window (1M tokens)
- Tool calling and function execution
- Agentic workflow optimization

## Where Models Are Used

### Background Job Processing (`app/app/lib/ai/worker.ts`)

All AI jobs run asynchronously via BullMQ. The worker processes these job types:

| Job Type | Model Type | Environment Variable | Fallback Model |
|----------|-----------|---------------------|----------------|
| `catalog-image` | Image | `OPENROUTER_IMAGE_MODEL` | `google/gemini-3-pro-image-preview` |
| `item-inference` | Vision | `OPENROUTER_VISION_MODEL` | `google/gemini-3-pro-preview` |
| `label-extraction` | Vision | `OPENROUTER_VISION_MODEL` | `google/gemini-3-pro-preview` |
| `outfit-generation` | Text | `OPENROUTER_TEXT_MODEL` | `google/gemini-3-flash-preview` |
| `outfit-visualization` | Image | `OPENROUTER_IMAGE_MODEL` | `google/gemini-3-pro-image-preview` |

### API Routes

Direct AI calls (not via background jobs):

- **`/api/outfits/generate`** - Uses `OPENROUTER_TEXT_MODEL`
- **`/api/outfits/[id]/visualize`** - Uses `OPENROUTER_IMAGE_MODEL`

### OpenRouter Client (`app/app/lib/ai/openrouter.ts`)

The OpenRouter client configuration reads all three model environment variables and provides fallbacks:

```typescript
{
  imageModel: process.env.OPENROUTER_IMAGE_MODEL || 'google/gemini-3-pro-image-preview',
  visionModel: process.env.OPENROUTER_VISION_MODEL || 'google/gemini-3-pro-preview',
  textModel: process.env.OPENROUTER_TEXT_MODEL || 'google/gemini-3-flash-preview',
}
```

## Model Selection Rationale

See `docs/features/MODEL_SELECTION.md` for detailed analysis of why each model was chosen.

**Quick Summary**:
- **Gemini 3 Pro Image Preview**: Only model that can generate images
- **Gemini 3 Pro**: Highest quality for vision and critical item analysis
- **Gemini 3 Flash**: Fast and cost-effective for text generation

## Cost Estimates

Based on `.env.example` configuration (monthly estimates):

- Image generation: ~$0.24/month (Gemini 3 Pro Image Preview)
- Vision processing: ~$0.20/month (Gemini 3 Pro)
- Text generation: ~$0.10/month (Gemini 3 Flash)

**Total**: ~$0.54/month for typical usage (100 items, 50 outfits)

## Configuration Reference

All model configuration is managed via environment variables in `.env`:

```bash
# Required
OPENROUTER_API_KEY="your-api-key-here"

# Optional (recommended to set explicitly)
OPENROUTER_IMAGE_MODEL="google/gemini-3-pro-image-preview"
OPENROUTER_VISION_MODEL="google/gemini-3-pro-preview"
OPENROUTER_TEXT_MODEL="google/gemini-3-flash-preview"
```

If not set, the application will use hard-coded fallback models (see above).

## Changing Models

To use different models:

1. Update `.env` with your preferred models
2. Ensure the models support the required capabilities:
   - Image model: Must support image generation (output)
   - Vision model: Must support image input + structured JSON output
   - Text model: Must support tool calling + JSON output
3. Restart the application and background workers

## Future Considerations

The codebase uses the latest Gemini 3 models. Alternative image generation models could include:

- `openai/dall-e-3` - OpenAI's image generation model
- `stability-ai/stable-diffusion-xl` - Stability AI's image generation model

## Related Documentation

- `docs/features/MODEL_SELECTION.md` - Detailed model comparison and selection guide
- `app/.env.example` - Environment configuration template
- `app/README.md` - App setup and configuration guide
- `docs/api/AI_INTEGRATION.md` - AI integration architecture
