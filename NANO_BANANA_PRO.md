# Nano Banana Pro (Gemini 3 Pro Image Preview)

## Overview

Nano Banana Pro is Google's most advanced image-generation and editing model, built on Gemini 3 Pro. It's the **recommended model** for outfit visualization in the ADHD Closet application.

## Model Details

- **Model ID**: `google/gemini-3-pro-image-preview`
- **Official Name**: Google: Nano Banana Pro (Gemini 3 Pro Image Preview)
- **Context Length**: 65,536 tokens
- **Max Output Tokens**: 32,768 tokens
- **Architecture**: Multi-modal (text+image -> text+image)

## Why Nano Banana Pro for Outfit Visualization?

### 1. Multi-Image Consistency
Perfect for outfit visualizations that need to combine multiple clothing items into a coherent image. The model maintains consistency across all items in the outfit.

### 2. Industry-Leading Text Rendering
Generates high-quality images with proper text rendering, including long passages and multilingual layouts. This ensures professional-looking outfit boards.

### 3. Consistent Multi-Image Blending
Nano Banana Pro excels at blending multiple source images (your outfit items) into a single coherent visualization while maintaining the identity and details of each item.

### 4. Accurate Identity Preservation
Maintains accurate colors, patterns, and details from source images across up to five subjects - perfect for outfit combinations.

### 5. High-Fidelity Visual Synthesis
Creates professional-grade, context-rich graphics suitable for fashion applications.

### 6. Fine-Grained Creative Controls
- Localized edits
- Lighting and focus adjustments
- Camera transformations
- 2K/4K output support
- Flexible aspect ratios

### 7. Real-World Grounding
Can incorporate real-time information and context (weather, occasion, vibe) to create more relevant visualizations.

## Capabilities

### Outfit Board Generation
Creates flat-lay style arrangements showing all outfit items in an aesthetically pleasing composition, similar to fashion magazine spreads.

### Person Wearing Outfit
Generates realistic visualizations of a person wearing the complete outfit, helping you see how items look together when styled.

## Pricing

Via OpenRouter:
- **Prompt tokens**: $0.000002 per token
- **Completion tokens**: $0.000012 per token
- **Image tokens**: $0.000002 per token
- **Input cache read**: $0.0000002 per token
- **Input cache write**: $0.000000375 per token

**Typical cost per outfit visualization**: $0.05-0.20 depending on:
- Number of items in the outfit (more images = higher cost)
- Output resolution requested
- Length of contextual prompts

## Configuration

Set in your `.env` file:

```env
OPENROUTER_IMAGE_MODEL="google/gemini-3-pro-image-preview"
```

This is the default in the application, so no changes needed unless you want to use a different model.

## API Parameters

The model supports these parameters via OpenRouter:
- `temperature` - Controls randomness (0.0-1.0)
- `top_p` - Nucleus sampling parameter
- `max_tokens` - Maximum output length
- `seed` - For reproducible results
- `stop` - Stop sequences
- `response_format` - Output format control
- `structured_outputs` - For structured JSON responses

## Comparison with Alternatives

### vs. Flux Pro (`black-forest-labs/flux-pro`)
- ✅ **Better multi-image consistency** (Nano Banana Pro)
- ✅ **Context-aware generation** (Nano Banana Pro)
- ✅ **Identity preservation** (Nano Banana Pro)
- ⚖️ Similar quality for single-image generation
- ⚖️ Similar pricing

### vs. DALL-E 3
- ✅ **Better multi-image input** (Nano Banana Pro)
- ✅ **More flexible output options** (Nano Banana Pro)
- ✅ **Better outfit consistency** (Nano Banana Pro)
- ⚖️ Similar text rendering quality

## Best Practices

### For Outfit Boards
1. Ensure all item images are clear and well-lit
2. Use AI catalog images when available (consistent backgrounds)
3. Include context (weather, occasion) for better composition
4. 3-6 items work best for balanced layouts

### For Person Wearing Outfits
1. Include at least top + bottom + shoes
2. Add context about the occasion for appropriate styling
3. Specify vibe for consistent mood in the visualization
4. More complete outfits (5+ items) create more realistic results

### Optimization Tips
1. **Use caching**: Generated images are cached automatically
2. **Batch context**: Include weather/vibe/occasion for better results
3. **Item quality**: Better source images = better output
4. **Regenerate**: Don't hesitate to generate multiple versions

## Troubleshooting

### "Generation takes too long"
- Normal: 30-60 seconds per visualization
- Check OpenRouter status if consistently slow
- Verify network connectivity

### "Poor quality output"
- Ensure source item images are high quality
- Try adding more context (weather, vibe, occasion)
- Consider regenerating for different results
- Check that items have visible, clear photos

### "Items don't match"
- Nano Banana Pro is optimized for consistency
- Ensure item images show the actual items clearly
- Try outfit board style if person-wearing isn't matching well
- Add detailed context about the outfit purpose

### "Out of credits / API errors"
- Check OpenRouter account credits
- Verify API key is valid
- Check OpenRouter status page
- Review usage limits in OpenRouter dashboard

## Technical Details

### Input Processing
- Accepts multiple base64-encoded images
- Each outfit item image is included in the prompt
- Context (weather, vibe, occasion, explanation) is added as text
- Images are processed together for consistency

### Output Format
- Returns base64-encoded image or URL
- Default: 1024x1024 pixels (configurable)
- Format: PNG or JPEG
- Automatically saved to DATA_DIR

### Model Behavior
- Maintains color accuracy from source images
- Preserves patterns and graphic details
- Creates neutral backgrounds for outfit boards
- Uses appropriate styling for person-wearing visualizations
- Considers outfit context in composition decisions

## Future Capabilities

Potential enhancements with Nano Banana Pro:
- Custom backgrounds (seasonal, location-specific)
- Style transfer (make it look like a Vogue photoshoot)
- Multiple poses and angles
- Group outfits with multiple people
- Localized edits (change just one item)
- Lighting adjustments (studio vs. natural light)

## Resources

- [OpenRouter Model Page](https://openrouter.ai/google/gemini-3-pro-image-preview)
- [Google AI Documentation](https://ai.google.dev/)
- [OpenRouter API Docs](https://openrouter.ai/docs)

## Support

For issues specific to Nano Banana Pro:
1. Check OpenRouter status page
2. Review OpenRouter model documentation
3. Check this app's troubleshooting guide
4. Contact OpenRouter support for model-specific issues
