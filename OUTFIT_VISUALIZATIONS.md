# AI-Generated Outfit Visualizations

This feature allows you to generate AI-powered visualizations of your outfits using Gemini or compatible models via OpenRouter.

## Overview

The outfit visualization feature creates two types of images:

1. **Outfit Board** (📋): A flat-lay style arrangement showing all outfit items laid out aesthetically, similar to a fashion magazine spread.

2. **Person Wearing** (👤): A realistic visualization of a person wearing the complete outfit, helping you see how items look together when styled.

## Features

- **Consistent Styling**: AI maintains outfit consistency across all items
- **Multiple Visualizations**: Generate multiple versions with different styles
- **High Quality**: 1024x1024 resolution images
- **Automatic Generation**: Items are automatically arranged based on their category and role
- **Context-Aware**: Takes into account weather, vibe, and occasion when generating

## How to Use

### From the UI

1. Navigate to any outfit detail page by clicking on an outfit
2. In the "AI Visualizations" section, choose your visualization type:
   - **Outfit Board**: For a flat-lay magazine-style view
   - **Person Wearing**: To see how the outfit looks when worn
3. Click "Generate Visualization"
4. Wait 30-60 seconds for the AI to process
5. View your generated visualization!

You can generate multiple visualizations of the same outfit to see different styling options.

### From the API

```bash
# Generate an outfit board
curl -X POST http://localhost:3000/api/outfits/{outfit-id}/visualize \
  -H "Content-Type: application/json" \
  -d '{"visualizationType": "outfit_board"}'

# Generate a person wearing the outfit
curl -X POST http://localhost:3000/api/outfits/{outfit-id}/visualize \
  -H "Content-Type: application/json" \
  -d '{"visualizationType": "person_wearing"}'
```

The API returns a job ID that you can use to poll for completion:

```bash
# Check job status
curl http://localhost:3000/api/ai/jobs?outfitId={outfit-id}&type=generate_outfit_visualization
```

## Configuration

The visualization feature uses the image generation model configured in your `.env` file:

```env
OPENROUTER_IMAGE_MODEL="black-forest-labs/flux-pro"
# or for Gemini support:
OPENROUTER_IMAGE_MODEL="google/gemini-2.0-flash-exp"
```

### Supported Models

Any OpenRouter model that supports:
- Multi-modal input (text + multiple images)
- Image generation output
- Modalities: `['image', 'text']`

Recommended models:
- `google/gemini-2.0-flash-exp` - Gemini 2.0 with excellent outfit consistency
- `black-forest-labs/flux-pro` - High-quality image generation
- Any model with image generation capabilities via OpenRouter

## Technical Details

### Database Schema

Outfit visualizations are stored in the `outfit_images` table with these properties:
- `id`: Unique identifier
- `outfitId`: Reference to the outfit
- `kind`: Either `outfit_board` or `outfit_person_wearing`
- `filePath`: Relative path to the image file
- `createdAt`: Generation timestamp

### File Storage

Images are stored in:
```
DATA_DIR/images/outfits/{outfit-id}/{visualization-type}_{timestamp}_{hash}.{ext}
```

### AI Processing

The visualization generation process:
1. Loads all item images from the outfit (AI catalog images preferred)
2. Sends item images + context to the AI model
3. AI generates a new image maintaining outfit consistency
4. Downloads and saves the generated image
5. Creates a database record for the visualization

### Performance

- Generation time: 30-60 seconds
- Image size: 1024x1024 pixels
- Format: PNG or JPEG depending on model output
- Caching: Images are permanently stored and cached

## Troubleshooting

### "No images found for outfit items"

Make sure all items in the outfit have at least one image (original or AI-generated catalog image).

### Generation takes too long

- Check your OpenRouter API key is valid
- Verify the image model is available
- Check network connectivity
- Some models may take longer than others

### Poor quality visualizations

- Ensure item images are clear and high-quality
- Try a different AI model
- Add more context (weather, occasion, vibe) to the outfit
- Generate multiple versions and pick the best one

## Future Enhancements

Planned improvements:
- [ ] Background customization options
- [ ] Style transfer (e.g., "make it look like a Vogue photoshoot")
- [ ] Multiple people (group outfits)
- [ ] Different poses and angles
- [ ] Seasonal backgrounds
- [ ] Edit/regenerate specific items while keeping others

## Privacy & Data

All image generation happens server-side via OpenRouter API. Generated images are:
- Stored locally in your DATA_DIR
- Never shared with third parties
- Can be deleted anytime by deleting the outfit or visualization

## Cost

Each visualization generation uses your OpenRouter API credits. Cost depends on:
- The model you choose
- Image size (fixed at 1024x1024)
- Number of input images (outfit items)

Typical cost: $0.05-0.20 per visualization depending on the model.
