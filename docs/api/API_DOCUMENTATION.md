# API Documentation

Wardrobe AI Closet API Reference (OpenAPI 3.0)

## Base URL
```
http://localhost:3000/api
```

## Authentication
This is a single-user application with no authentication required.

---

## Endpoints

### Items

#### `GET /api/items`
Get all items with optional filtering.

**Query Parameters**:
- `category` (string, optional): Filter by category (`tops`, `bottoms`, `dresses`, etc.)
- `state` (string, optional): Filter by state (`available`, `laundry`, `unavailable`, `donate`)
- `tags` (string[], optional): Filter by tags
- `search` (string, optional): Search by title, brand, or tags

**Response** (200 OK):
```json
{
  "items": [
    {
      "id": "uuid",
      "title": "Black Band T-shirt",
      "category": "tops",
      "state": "available",
      "brand": "Killstar",
      "sizeText": "M",
      "materials": "100% cotton",
      "colorPalette": ["#000000", "#FFFFFF"],
      "attributes": { "neckline": "crew", "sleeve_length": "short" },
      "images": [
        { "id": "uuid", "kind": "original_main", "filePath": "..." }
      ],
      "tags": [
        { "id": "uuid", "name": "goth" }
      ],
      "createdAt": "2024-01-27T12:00:00Z",
      "updatedAt": "2024-01-27T12:00:00Z"
    }
  ],
  "total": 42
}
```

#### `POST /api/items`
Create a new item.

**Request Body**:
```json
{
  "title": "Black Band T-shirt",
  "category": "tops",
  "brand": "Killstar",
  "state": "available",
  "tags": ["goth", "favorite"]
}
```

**Response** (201 Created):
```json
{
  "item": {
    "id": "uuid",
    "title": "Black Band T-shirt",
    ...
  }
}
```

#### `GET /api/items/[id]`
Get a single item with full details, images, tags, and AI job history.

**Response** (200 OK):
```json
{
  "item": { ... },
  "images": [ ... ],
  "tags": [ ... ],
  "ai": {
    "latestJobs": [ ... ]
  }
}
```

#### `PATCH /api/items/[id]`
Update an item.

**Request Body**:
```json
{
  "title": "Updated Title",
  "category": "tops",
  "state": "laundry",
  "brand": "Killstar",
  "tags": ["goth", "favorite", "comfy"]
}
```

**Response** (200 OK):
```json
{
  "item": { ... }
}
```

#### `DELETE /api/items/[id]`
Delete an item and all associated images.

**Response** (200 OK):
```json
{
  "message": "Item deleted",
  "id": "uuid"
}
```

---

### Images

#### `POST /api/items/[id]/images`
Upload images for an item.

**Request**: `multipart/form-data`
- `file` (file, required): Image file
- `kind` (string, required): Image kind (`original_main`, `original_back`, `label_brand`, `label_care`, `detail`)

**Response** (201 Created):
```json
{
  "image": {
    "id": "uuid",
    "kind": "original_main",
    "filePath": "images/item-id/image-id.jpg",
    "width": 1024,
    "height": 1024,
    "mimeType": "image/jpeg"
  }
}
```

#### `GET /api/images/[imageId]`
Stream an image file.

**Response**: Image file with appropriate `Content-Type` header

#### `DELETE /api/images/[imageId]`
Delete an image.

**Response** (200 OK):
```json
{
  "message": "Image deleted",
  "id": "uuid"
}
```

---

### Outfits

#### `GET /api/outfits`
Get all outfits.

**Query Parameters**:
- `rating` (string, optional): Filter by rating (`up`, `down`, `neutral`)

**Response** (200 OK):
```json
{
  "outfits": [
    {
      "id": "uuid",
      "title": "Concert Outfit",
      "notes": "Loved this combination!",
      "rating": "up",
      "weather": "cool",
      "vibe": "confidence_boost",
      "occasion": "concert",
      "timeAvailable": "normal",
      "explanation": "This outfit balances comfort and style...",
      "items": [
        {
          "itemId": "uuid",
          "role": "top",
          "item": { ... }
        }
      ],
      "createdAt": "2024-01-27T12:00:00Z",
      "updatedAt": "2024-01-27T12:00:00Z"
    }
  ]
}
```

#### `POST /api/outfits/generate`
Generate outfit suggestions using AI.

**Request Body**:
```json
{
  "weather": "cool",
  "vibe": "confidence_boost",
  "occasion": "concert",
  "timeAvailable": "normal",
  "panicPick": false
}
```

**Response** (200 OK):
```json
{
  "outfits": [
    {
      "items": [
        { "itemId": "uuid", "role": "top" },
        { "itemId": "uuid", "role": "bottom" },
        { "itemId": "uuid", "role": "shoes" }
      ],
      "explanation": "This outfit...",
      "swapSuggestions": "You could swap the boots for..."
    }
  ]
}
```

#### `GET /api/outfits/[id]`
Get a single outfit.

#### `PATCH /api/outfits/[id]`
Update an outfit.

**Request Body**:
```json
{
  "title": "Updated Title",
  "notes": "Added notes",
  "rating": "up"
}
```

#### `DELETE /api/outfits/[id]`
Delete an outfit.

#### `POST /api/outfits/[id]/visualize`
Generate AI-powered visualization for an outfit.

**Request Body**:
```json
{
  "visualizationType": "outfit_board" // or "person_wearing"
}
```

**Response** (202 Accepted):
```json
{
  "jobId": "uuid",
  "aiJobId": "uuid",
  "status": "queued",
  "message": "Generating outfit board visualization. This may take 30-60 seconds."
}
```

**Description**:
- `outfit_board`: Creates a flat-lay style arrangement of all outfit items
- `person_wearing`: Shows a person wearing the complete outfit

The visualization is generated using AI (Gemini or compatible model via OpenRouter) and maintains outfit consistency across all items. Poll the AI jobs endpoint to check completion status.

#### `GET /api/outfit-images/[imageId]`
Stream an outfit visualization image file.

**Response**: Image file with appropriate `Content-Type` header

---

### Tags

#### `GET /api/tags`
Get all tags.

**Response** (200 OK):
```json
{
  "tags": [
    { "id": "uuid", "name": "goth", "count": 15 },
    { "id": "uuid", "name": "comfy", "count": 8 }
  ]
}
```

#### `POST /api/tags`
Create a new tag.

**Request Body**:
```json
{
  "name": "vintage"
}
```

#### `DELETE /api/tags/[id]`
Delete a tag (removes from all items).

---

### AI Jobs

#### `GET /api/ai/jobs`
Get all AI jobs.

**Query Parameters**:
- `itemId` (string, optional): Filter by item
- `outfitId` (string, optional): Filter by outfit
- `type` (string, optional): Filter by type (`generate_catalog_image`, `infer_item`, `extract_label`, `generate_outfit`, `generate_outfit_visualization`)
- `status` (string, optional): Filter by status (`queued`, `running`, `succeeded`, `failed`, `needs_review`)

**Response** (200 OK):
```json
{
  "jobs": [
    {
      "id": "uuid",
      "type": "generate_catalog_image",
      "status": "succeeded",
      "itemId": "uuid",
      "outfitId": null,
      "modelName": "anthropic/claude-3-opus",
      "outputJson": { ... },
      "createdAt": "2024-01-27T12:00:00Z",
      "completedAt": "2024-01-27T12:01:00Z"
    }
  ]
}
```

**AI Job Types**:
- `generate_catalog_image`: Generate clean catalog-style image from original photo
- `infer_item`: Analyze item and extract category, colors, attributes, tags
- `extract_label`: Extract brand, size, and material info from label photos
- `generate_outfit`: Generate outfit combinations based on constraints
- `generate_outfit_visualization`: Create outfit board or person-wearing visualization

#### `POST /api/ai/jobs`
Create a new AI job (enqueue for processing).

**Request Body**:
```json
{
  "type": "infer_item",
  "itemId": "uuid"
}
```

---

### Export / Import

#### `POST /api/export`
Export complete wardrobe as ZIP.

**Response**: ZIP file download
- `export.json`: Full data export
- `items.csv`: Items in CSV format
- `outfits.csv`: Outfits in CSV format
- `images/`: All images
- `manifest.json`: Version info

#### `POST /api/import`
Import wardrobe from ZIP backup.

**Request**: `multipart/form-data`
- `file` (file, required): ZIP backup file
- `mode` (string, required): `merge` or `replace`

**Response** (200 OK):
```json
{
  "imported": {
    "items": 42,
    "outfits": 15,
    "tags": 20,
    "images": 150
  }
}
```

---

### Reminders

#### `GET /api/reminders`
Check laundry status.

**Query Parameters**:
- `daysThreshold` (number, optional, default: 3): Days threshold

**Response** (200 OK):
```json
{
  "total": 5,
  "overdue": 2,
  "threshold": 3,
  "items": [
    {
      "id": "uuid",
      "title": "Black Jeans",
      "daysSinceUpdate": 5,
      "overdue": true
    }
  ]
}
```

#### `POST /api/reminders`
Trigger laundry reminder check and send notification.

**Request Body**:
```json
{
  "daysThreshold": 3
}
```

**Response** (200 OK):
```json
{
  "message": "Reminder sent",
  "itemsChecked": 5,
  "remindersSent": 1,
  "items": [ ... ]
}
```

---

## Error Codes

All endpoints return errors in this format:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": "Optional additional details"
  }
}
```

**Common Error Codes**:
- `NOT_FOUND` (404): Resource not found
- `VALIDATION_ERROR` (400): Invalid request data
- `INTERNAL_ERROR` (500): Server error
- `UPLOAD_ERROR` (400): File upload failed
- `AI_ERROR` (500): AI processing failed

---

## Rate Limiting
No rate limiting (single-user application).

## CORS
CORS is disabled by default (same-origin only).

## Pagination
Not implemented in v1. All endpoints return full results.
Future versions may add `page` and `limit` parameters.
