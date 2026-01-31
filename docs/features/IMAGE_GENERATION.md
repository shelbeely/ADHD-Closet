# Image-to-Image Generation Features

## Overview

This document describes the image-to-image generation features that use reference images to maintain visual consistency across generated content. All features use AI models that understand reference images and generate new content while preserving style, color harmony, and aesthetic consistency.

## Features

### 1. Color Variations (`/api/images/generate-variation`)

Generate color variations of an item while maintaining its exact style, fit, and proportions.

**Use Cases:**
- "I love this shirt but wish it came in burgundy"
- Preview how an item would look in different colors
- Plan wardrobe expansion with color variations
- Match specific color schemes

**Parameters:**
- `variationType`: `'color'`
- `targetColor`: Color name (e.g., "burgundy", "forest green", "navy blue")
- `preserveDetails`: `true` to keep graphics/patterns, `false` for solid color

**Example:**
```typescript
POST /api/images/generate-variation
{
  "referenceImageBase64": "...",
  "variationType": "color",
  "parameters": {
    "targetColor": "burgundy",
    "preserveDetails": true
  }
}
```

The system maintains the exact style and fit while changing colors. Graphics and logos stay recognizable (important for band merch), and the output quality is consistent with the original item.

---

### 2. Seasonal Variations (`/api/images/generate-variation`)

Transform items for different seasons while maintaining core style.

**Use Cases:**
- "Convert this to a winter version"
- Plan seasonal wardrobe needs
- Understand weight/fabric changes needed
- Preview seasonal adaptations

**Parameters:**
- `variationType`: `'seasonal'`
- `targetSeason`: `'spring' | 'summer' | 'fall' | 'winter'`

**Seasonal Adaptations:**
- **Spring**: Lighter fabrics, pastel/fresh colors, breathable materials
- **Summer**: Lightest weight, bright or neutral colors, maximum breathability
- **Fall**: Medium weight, warm tones (rust, burgundy), cozy textures
- **Winter**: Heavy fabrics, dark/jewel tones, insulating materials

**Example:**
```typescript
POST /api/images/generate-variation
{
  "referenceImageBase64": "...",
  "variationType": "seasonal",
  "parameters": {
    "targetSeason": "winter"
  }
}
```

---

### 3. Matching Items (`/api/images/generate-matching`)

Generate items that perfectly complement a reference piece.

**Use Cases:**
- "What bottoms go with this top?"
- Complete partial outfits
- Find coordinating accessories
- Build capsule wardrobes

**Parameters:**
- `matchingType`: `'complementary-piece'` (default) or `'coordinated-set'`
- `targetCategory`: Category to generate (for complementary-piece)
- `setType`: `'two-piece' | 'three-piece' | 'complete-outfit'` (for coordinated-set)
- `styleNotes`: Optional additional guidance

**Example - Generate Matching Bottoms:**
```typescript
POST /api/images/generate-matching
{
  "referenceImageBase64": "...",
  "targetCategory": "bottoms",
  "styleNotes": "Casual, everyday wear"
}
```

**Example - Generate Coordinated Set:**
```typescript
POST /api/images/generate-matching
{
  "referenceImageBase64": "...",
  "matchingType": "coordinated-set",
  "setType": "two-piece"
}
```

**Matching Considerations:**
- Color palette coordination
- Pattern balance (solid with pattern)
- Visual weight harmony
- Style level consistency
- Aesthetic compatibility

---

### 4. Style Transfer (`/api/images/style-transfer`)

Apply aesthetic/styling from a reference image (mood board, inspiration photo) to an item.

**Use Cases:**
- "Make this look more cottagecore"
- Apply specific aesthetic to wardrobe
- Transform items to match inspiration
- Create themed collections

**Parameters:**
- `itemImageBase64`: Item to transform
- `styleReferenceBase64`: Image with desired aesthetic
- `transferStrength`: `0.3-0.9` (default `0.6`)

**Strength Guide:**
- **0.3-0.4**: Subtle inspiration, maintains most original features
- **0.5-0.6**: Balanced transformation, recognizable but adapted
- **0.7-0.9**: Strong transformation, heavily matches reference style

**Example:**
```typescript
POST /api/images/style-transfer
{
  "itemImageBase64": "...",
  "styleReferenceBase64": "...",  // Cottagecore mood board
  "transferStrength": 0.7
}
```

**Aesthetics that work well:**
- Cottagecore, Dark Academia, Y2K
- Cyberpunk, Streetwear, Minimalist
- Vintage, Retro, Modern
- Grunge, Goth, Punk

---

### 5. Context Variations (`/api/images/outfit-context`)

Adapt outfits for different occasions/settings while maintaining personal style.

**Use Cases:**
- "Make this outfit work for a job interview"
- Transform casual to formal
- Adapt for weather/season
- Adjust for specific events

**Parameters:**
- `itemsBase64`: Array of outfit items with `{id, base64, category}`
- `targetContext`: Target occasion/setting
- `maintainPieces`: Optional array of item IDs to keep unchanged

**Context Examples:**
- **Formal**: job interview, formal dinner, wedding guest, business meeting
- **Casual**: coffee date, weekend brunch, shopping trip, study session
- **Special**: concert, date night, party, festival
- **Weather**: rainy day, summer heat, winter cold, windy day
- **Activities**: gym workout, yoga class, hiking, beach day

**Example:**
```typescript
POST /api/images/outfit-context
{
  "itemsBase64": [
    { "id": "1", "base64": "...", "category": "tops" },
    { "id": "2", "base64": "...", "category": "bottoms" }
  ],
  "targetContext": "job interview",
  "maintainPieces": ["1"]  // Keep the top
}
```

---

## Technical Details

### Image Input Format

All endpoints accept base64-encoded images:
```typescript
const imageBase64 = imageBuffer.toString('base64');
// Or from file input:
const file = event.target.files[0];
const reader = new FileReader();
reader.onload = (e) => {
  const base64 = e.target?.result?.toString().split(',')[1];
};
reader.readAsDataURL(file);
```

### Response Format

All endpoints return:
```typescript
{
  success: boolean;
  generatedImageUrl: string;  // URL or base64 data URI
  // Additional metadata specific to endpoint
}
```

### Image Output

Generated images are returned as either:
1. **Data URI**: `data:image/jpeg;base64,...` (can be used directly in `<img>` tags)
2. **URL**: HTTP URL (needs to be downloaded/saved)

### Error Handling

Errors return:
```typescript
{
  error: string;  // Error message
}
```

Status codes:
- `400`: Bad request (validation error)
- `500`: Server error (generation failed)

---

## Integration Examples

### React Component - Color Variation Generator

```tsx
import { useState } from 'react';

function ColorVariationGenerator({ itemImage }: { itemImage: string }) {
  const [targetColor, setTargetColor] = useState('burgundy');
  const [preserveDetails, setPreserveDetails] = useState(true);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateVariation = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/images/generate-variation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referenceImageBase64: itemImage,
          variationType: 'color',
          parameters: {
            targetColor,
            preserveDetails,
          },
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        setGeneratedImage(data.generatedImageUrl);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        value={targetColor}
        onChange={(e) => setTargetColor(e.target.value)}
        placeholder="Target color (e.g., burgundy)"
      />
      <label>
        <input
          type="checkbox"
          checked={preserveDetails}
          onChange={(e) => setPreserveDetails(e.target.checked)}
        />
        Preserve graphics/patterns
      </label>
      <button onClick={generateVariation} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Color Variation'}
      </button>
      
      {generatedImage && (
        <div>
          <h3>Generated Variation:</h3>
          <img src={generatedImage} alt="Generated variation" />
        </div>
      )}
    </div>
  );
}
```

### React Component - Matching Item Generator

```tsx
function MatchingItemGenerator({ topImage }: { topImage: string }) {
  const [category, setCategory] = useState('bottoms');
  const [styleNotes, setStyleNotes] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateMatching = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/images/generate-matching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referenceImageBase64: topImage,
          targetCategory: category,
          styleNotes: styleNotes || undefined,
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        setGeneratedImage(data.generatedImageUrl);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="bottoms">Bottoms</option>
        <option value="shoes">Shoes</option>
        <option value="accessories">Accessories</option>
        <option value="outerwear">Outerwear</option>
      </select>
      
      <textarea
        value={styleNotes}
        onChange={(e) => setStyleNotes(e.target.value)}
        placeholder="Style notes (optional)"
      />
      
      <button onClick={generateMatching} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Matching Item'}
      </button>
      
      {generatedImage && (
        <img src={generatedImage} alt="Generated matching item" />
      )}
    </div>
  );
}
```

---

## ADHD-Friendly Features

All image generation features are designed with ADHD users in mind:

### Visual Consistency
Reference images produce predictable results. Generated items match your existing wardrobe, which reduces decision paralysis.

### Quick Previews
See variations before buying. Preview outfits for different contexts with instant visual feedback.

### Reduced Overwhelm
One reference produces focused results. Clear visual comparisons show limited, relevant options.

### Confidence Building
See how items look together. Preview before committing to understand what works.

---

## Performance & Limitations

### Generation Time
- **Color/Seasonal Variations**: 5-10 seconds
- **Matching Items**: 10-15 seconds
- **Style Transfer**: 10-15 seconds
- **Context Variations**: 15-20 seconds (multiple items)
- **Coordinated Sets**: 15-20 seconds

### Quality Factors
- **Reference Image Quality**: Higher quality inputs = better outputs
- **Complexity**: Simple items generate faster than complex patterns
- **Clarity**: Clear, well-lit references work best

### Best Practices
1. Use high-quality reference images (well-lit, clear, in focus)
2. Provide specific color names (not "red" but "burgundy" or "crimson")
3. For style transfer, use clear mood board/aesthetic references
4. Keep context descriptions specific ("job interview" vs "formal")
5. For matching items, provide style notes for better results

### Limitations
- Generated items are visualizations, not exact catalog items
- Some combinations may not be physically realistic
- Style transfer strength affects recognizability
- Complex patterns may not transfer perfectly

---

## Privacy & Security

All image generation:
- Processes server-side only
- No image storage (ephemeral processing)
- No third-party sharing
- Reference images stay in request context
- GDPR compliant

---

## API Rate Limits

- Maximum 10 requests per minute per user
- Maximum 100 requests per day per user
- Large batches (5+ items) count as 2 requests

---

## Future Enhancements

Planned features:
- Batch processing (multiple colors at once)
- AR try-on integration
- Real-time preview generation
- Saved reference libraries
- Style profile learning
- Collaborative style sharing

---

## Support & Troubleshooting

### Common Issues

**"Generation failed"**
- Check image quality and size
- Ensure base64 encoding is correct
- Verify all required parameters provided

**"No image returned"**
- AI model may have filtered content
- Try adjusting transferStrength
- Simplify reference images

**"Doesn't match reference"**
- Increase transferStrength
- Use clearer reference images
- Provide more specific style notes

### Getting Help
- Check API documentation: `GET /api/images/<endpoint>`
- Review request/response in browser console
- Verify image format and encoding

---

## Conclusion

These image-to-image generation features are useful for ADHD users who benefit from visual feedback:
- All generations use references for consistency
- Personal aesthetic is maintained across variations
- Preview variations instantly before making decisions
- See results before committing reduces anxiety
- Better wardrobe planning through visualization
