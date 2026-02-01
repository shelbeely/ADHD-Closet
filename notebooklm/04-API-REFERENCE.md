# Wardrobe AI Closet - API Reference

## API Overview

**Base URL**: `http://localhost:3000/api`  
**Format**: REST API with JSON responses  
**Authentication**: None (single-user application)  
**Total Endpoints**: 25+ REST endpoints

## API Conventions

### Request/Response Format
- All requests and responses use JSON (except file uploads/downloads)
- File uploads use `multipart/form-data`
- Image serving streams bytes with appropriate `Content-Type`

### HTTP Status Codes
- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data (validation error)
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

### Error Response Format
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}  // Optional additional details
  }
}
```

### Common Error Codes
- `VALIDATION_ERROR`: Request body failed validation
- `NOT_FOUND`: Resource does not exist
- `INTERNAL_ERROR`: Server-side error
- `INVALID_FILE_TYPE`: Unsupported file format
- `FILE_TOO_LARGE`: Upload exceeds size limit

## Items API

### GET /api/items

Get all items with optional filtering.

**Query Parameters**:
- `category` (string, optional): Filter by category enum value
- `state` (string, optional): Filter by state (available, laundry, unavailable, donate)
- `tags` (array, optional): Filter by tag names
- `search` (string, optional): Search in title, brand, or tags

**Response** (200 OK):
```json
{
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Black Band T-shirt",
      "category": "tops",
      "state": "available",
      "brand": "Killstar",
      "sizeText": "M",
      "materials": "100% cotton",
      "colorPalette": ["#000000", "#FFFFFF"],
      "attributes": {
        "neckline": "crew",
        "sleeve_length": "short",
        "fit": "regular"
      },
      "images": [
        {
          "id": "660e8400-e29b-41d4-a716-446655440001",
          "kind": "ai_catalog",
          "filePath": "images/550e8400-e29b-41d4-a716-446655440000/660e8400-e29b-41d4-a716-446655440001.webp",
          "width": 1024,
          "height": 1024,
          "mimeType": "image/webp"
        }
      ],
      "tags": [
        { "id": "770e8400-e29b-41d4-a716-446655440002", "name": "goth" },
        { "id": "880e8400-e29b-41d4-a716-446655440003", "name": "favorite" }
      ],
      "createdAt": "2024-01-27T12:00:00Z",
      "updatedAt": "2024-01-27T12:30:00Z"
    }
  ],
  "total": 42
}
```

### POST /api/items

Create a new item.

**Request Body**:
```json
{
  "title": "Black Band T-shirt",
  "category": "tops",
  "brand": "Killstar",
  "sizeText": "M",
  "state": "available",
  "tags": ["goth", "favorite"]
}
```

**Response** (201 Created):
```json
{
  "item": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Black Band T-shirt",
    "category": "tops",
    "state": "available",
    "brand": "Killstar",
    "sizeText": "M",
    "createdAt": "2024-01-27T12:00:00Z",
    "updatedAt": "2024-01-27T12:00:00Z"
  }
}
```

### GET /api/items/[id]

Get a single item with full details.

**Path Parameters**:
- `id` (string, required): Item UUID

**Response** (200 OK):
```json
{
  "item": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Black Band T-shirt",
    "category": "tops",
    "state": "available",
    "brand": "Killstar",
    "sizeText": "M",
    "materials": "100% cotton",
    "colorPalette": ["#000000", "#FFFFFF"],
    "attributes": {
      "neckline": "crew",
      "sleeve_length": "short"
    },
    "images": [...],
    "tags": [...],
    "aiJobs": {
      "latestJobs": [
        {
          "id": "990e8400-e29b-41d4-a716-446655440004",
          "type": "infer_item",
          "status": "succeeded",
          "completedAt": "2024-01-27T12:05:00Z"
        }
      ]
    },
    "createdAt": "2024-01-27T12:00:00Z",
    "updatedAt": "2024-01-27T12:30:00Z"
  }
}
```

### PATCH /api/items/[id]

Update an item.

**Path Parameters**:
- `id` (string, required): Item UUID

**Request Body** (all fields optional):
```json
{
  "title": "Updated Title",
  "category": "tops",
  "state": "laundry",
  "brand": "Killstar",
  "sizeText": "L",
  "tags": ["goth", "favorite", "comfy"]
}
```

**Response** (200 OK):
```json
{
  "item": { /* updated item */ }
}
```

### DELETE /api/items/[id]

Delete an item and all associated images.

**Path Parameters**:
- `id` (string, required): Item UUID

**Response** (200 OK):
```json
{
  "message": "Item deleted",
  "id": "550e8400-e29b-41d4-a716-446655440000"
}
```

## Images API

### POST /api/items/[id]/images

Upload an image for an item.

**Path Parameters**:
- `id` (string, required): Item UUID

**Request**: `multipart/form-data`
- `file` (file, required): Image file (JPEG, PNG, WebP, HEIC)
- `kind` (string, required): Image kind enum value

**Image Kinds**:
- `original_main`: Front photo of item
- `original_back`: Back photo of item
- `label_brand`: Brand label photo
- `label_care`: Care instructions label
- `detail`: Close-up detail photo

**Response** (201 Created):
```json
{
  "image": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "kind": "original_main",
    "filePath": "images/550e8400-e29b-41d4-a716-446655440000/660e8400-e29b-41d4-a716-446655440001.jpg",
    "width": 2048,
    "height": 2048,
    "mimeType": "image/jpeg"
  },
  "aiJobs": [
    {
      "id": "990e8400-e29b-41d4-a716-446655440004",
      "type": "generate_catalog_image",
      "status": "queued"
    }
  ]
}
```

**Note**: Uploading an `original_main` or `original_back` image automatically enqueues AI catalog generation jobs.

### GET /api/images/[imageId]

Stream an image file.

**Path Parameters**:
- `imageId` (string, required): ImageAsset UUID

**Response**: Binary image data with headers:
```
Content-Type: image/jpeg (or appropriate MIME type)
Cache-Control: public, max-age=31536000, immutable
```

### DELETE /api/images/[imageId]

Delete an image file and database record.

**Path Parameters**:
- `imageId` (string, required): ImageAsset UUID

**Response** (200 OK):
```json
{
  "message": "Image deleted",
  "id": "660e8400-e29b-41d4-a716-446655440001"
}
```

## Outfits API

### GET /api/outfits

Get all outfits.

**Query Parameters**:
- `rating` (string, optional): Filter by rating (up, down, neutral)

**Response** (200 OK):
```json
{
  "outfits": [
    {
      "id": "aa0e8400-e29b-41d4-a716-446655440005",
      "title": "Concert Outfit",
      "notes": "Loved this combination!",
      "rating": "up",
      "weather": "cool",
      "vibe": "confidence_boost",
      "occasion": "concert",
      "timeAvailable": "normal",
      "explanation": "This outfit balances edgy and comfortable...",
      "items": [
        {
          "itemId": "550e8400-e29b-41d4-a716-446655440000",
          "role": "top",
          "item": { /* item details */ }
        }
      ],
      "createdAt": "2024-01-27T18:00:00Z"
    }
  ],
  "total": 15
}
```

### POST /api/outfits/generate

Generate outfit suggestions with AI.

**Request Body**:
```json
{
  "weather": "cool",
  "vibe": "confidence_boost",
  "occasion": "concert",
  "timeAvailable": "quick",
  "itemIds": ["550e8400-...", "660e8400-..."]  // Optional: only consider these items
}
```

**Response** (201 Created):
```json
{
  "job": {
    "id": "bb0e8400-e29b-41d4-a716-446655440006",
    "type": "generate_outfit",
    "status": "queued"
  },
  "message": "Outfit generation started"
}
```

**Note**: This is an async operation. Poll `/api/ai/jobs/[jobId]` for status.

### GET /api/outfits/[id]

Get outfit details.

**Path Parameters**:
- `id` (string, required): Outfit UUID

**Response** (200 OK):
```json
{
  "outfit": {
    "id": "aa0e8400-e29b-41d4-a716-446655440005",
    "title": "Concert Outfit",
    "rating": "up",
    "weather": "cool",
    "vibe": "confidence_boost",
    "explanation": "This outfit balances...",
    "swapSuggestions": "Could swap boots for sneakers...",
    "items": [
      {
        "role": "top",
        "item": { /* full item with images */ }
      },
      {
        "role": "bottom",
        "item": { /* full item with images */ }
      },
      {
        "role": "shoes",
        "item": { /* full item with images */ }
      }
    ],
    "createdAt": "2024-01-27T18:00:00Z"
  }
}
```

### PATCH /api/outfits/[id]

Update outfit (typically rating).

**Path Parameters**:
- `id` (string, required): Outfit UUID

**Request Body**:
```json
{
  "rating": "up",
  "notes": "Loved this!"
}
```

**Response** (200 OK):
```json
{
  "outfit": { /* updated outfit */ }
}
```

### DELETE /api/outfits/[id]

Delete an outfit.

**Path Parameters**:
- `id` (string, required): Outfit UUID

**Response** (200 OK):
```json
{
  "message": "Outfit deleted",
  "id": "aa0e8400-e29b-41d4-a716-446655440005"
}
```

## AI Jobs API

### GET /api/ai/jobs

Get all AI jobs with filtering.

**Query Parameters**:
- `type` (string, optional): Filter by job type
- `status` (string, optional): Filter by status
- `itemId` (string, optional): Filter by item
- `limit` (number, optional): Limit results (default 50)

**Response** (200 OK):
```json
{
  "jobs": [
    {
      "id": "990e8400-e29b-41d4-a716-446655440004",
      "type": "generate_catalog_image",
      "status": "succeeded",
      "itemId": "550e8400-e29b-41d4-a716-446655440000",
      "modelName": "black-forest-labs/flux-1.1-pro",
      "outputJson": { /* AI response */ },
      "attempts": 1,
      "createdAt": "2024-01-27T12:01:00Z",
      "completedAt": "2024-01-27T12:01:30Z"
    }
  ],
  "total": 127
}
```

### GET /api/ai/jobs/[jobId]

Get job details and status.

**Path Parameters**:
- `jobId` (string, required): AIJob UUID

**Response** (200 OK):
```json
{
  "job": {
    "id": "990e8400-e29b-41d4-a716-446655440004",
    "type": "infer_item",
    "status": "succeeded",
    "itemId": "550e8400-e29b-41d4-a716-446655440000",
    "inputRefs": {
      "imageIds": ["660e8400-..."]
    },
    "outputJson": {
      "category": "tops",
      "colors": ["black", "white"],
      "colorPalette": ["#000000", "#FFFFFF"],
      "attributes": {
        "neckline": "crew",
        "sleeve_length": "short"
      },
      "tags": ["goth", "band-tee"]
    },
    "confidenceJson": {
      "category": 0.95,
      "colors": 0.98,
      "attributes": 0.87
    },
    "modelName": "google/gemini-2.0-flash-exp:free",
    "attempts": 1,
    "createdAt": "2024-01-27T12:01:00Z",
    "completedAt": "2024-01-27T12:01:15Z"
  }
}
```

## Tags API

### GET /api/tags

Get all tags with usage counts.

**Response** (200 OK):
```json
{
  "tags": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "name": "goth",
      "itemCount": 42,
      "createdAt": "2024-01-20T10:00:00Z"
    },
    {
      "id": "880e8400-e29b-41d4-a716-446655440003",
      "name": "favorite",
      "itemCount": 15,
      "createdAt": "2024-01-21T11:00:00Z"
    }
  ],
  "total": 28
}
```

### POST /api/tags

Create a new tag.

**Request Body**:
```json
{
  "name": "comfy"
}
```

**Response** (201 Created):
```json
{
  "tag": {
    "id": "cc0e8400-e29b-41d4-a716-446655440007",
    "name": "comfy",
    "createdAt": "2024-01-27T12:00:00Z"
  }
}
```

### DELETE /api/tags/[id]

Delete a tag (removes from all items).

**Path Parameters**:
- `id` (string, required): Tag UUID

**Response** (200 OK):
```json
{
  "message": "Tag deleted",
  "id": "cc0e8400-e29b-41d4-a716-446655440007"
}
```

## NFC Tags API

### POST /api/nfc/assign

Assign an NFC tag to an item.

**Request Body**:
```json
{
  "tagId": "04:6B:8A:12:34:56:78",
  "itemId": "550e8400-e29b-41d4-a716-446655440000",
  "label": "Blue hanger #1"
}
```

**Response** (201 Created):
```json
{
  "nfcTag": {
    "id": "dd0e8400-e29b-41d4-a716-446655440008",
    "tagId": "04:6B:8A:12:34:56:78",
    "itemId": "550e8400-e29b-41d4-a716-446655440000",
    "label": "Blue hanger #1",
    "createdAt": "2024-01-27T12:00:00Z"
  }
}
```

### POST /api/nfc/scan

Record an NFC tag scan event.

**Request Body**:
```json
{
  "tagId": "04:6B:8A:12:34:56:78",
  "action": "removed",
  "notes": "Wearing to concert"
}
```

**Response** (201 Created):
```json
{
  "event": {
    "id": "ee0e8400-e29b-41d4-a716-446655440009",
    "tagId": "04:6B:8A:12:34:56:78",
    "itemId": "550e8400-e29b-41d4-a716-446655440000",
    "action": "removed",
    "notes": "Wearing to concert",
    "createdAt": "2024-01-27T12:00:00Z"
  },
  "item": { /* associated item */ }
}
```

### GET /api/nfc/tags

Get all NFC tags.

**Response** (200 OK):
```json
{
  "tags": [
    {
      "id": "dd0e8400-e29b-41d4-a716-446655440008",
      "tagId": "04:6B:8A:12:34:56:78",
      "label": "Blue hanger #1",
      "item": { /* associated item */ },
      "createdAt": "2024-01-27T12:00:00Z"
    }
  ],
  "total": 5
}
```

## Export/Import API

### POST /api/export

Export entire wardrobe as ZIP file.

**Response**: Binary ZIP file with headers:
```
Content-Type: application/zip
Content-Disposition: attachment; filename="wardrobe-backup-2024-01-27.zip"
```

**ZIP Contents**:
```
wardrobe-backup-2024-01-27.zip
├── manifest.json           # App version, schema version
├── export.json             # Full data export
├── items.csv               # Items in CSV format
├── outfits.csv             # Outfits in CSV format
├── images/
│   └── [itemId]/
│       └── [imageId].jpg   # All images
└── thumbs/
    └── [itemId]/
        └── [imageId].webp  # Thumbnails
```

### POST /api/import

Import wardrobe from ZIP backup.

**Request**: `multipart/form-data`
- `file` (file, required): ZIP backup file
- `mode` (string, required): Import mode ("replace" or "merge")

**Response** (200 OK):
```json
{
  "summary": {
    "itemsImported": 42,
    "outfitsImported": 15,
    "tagsImported": 28,
    "imagesImported": 127,
    "duplicatesSkipped": 3,
    "errors": []
  }
}
```

## Vision API (Advanced Features)

### POST /api/vision/analyze

Analyze an image for style attributes.

**Request**: `multipart/form-data`
- `image` (file, required): Image to analyze

**Response** (200 OK):
```json
{
  "analysis": {
    "category": "tops",
    "colors": ["black", "white"],
    "pattern": "graphic",
    "style": "goth",
    "attributes": { /* detected attributes */ },
    "confidence": 0.92
  }
}
```

### POST /api/vision/similarity

Find similar items by image.

**Request Body**:
```json
{
  "itemId": "550e8400-e29b-41d4-a716-446655440000",
  "limit": 10
}
```

**Response** (200 OK):
```json
{
  "similar": [
    {
      "itemId": "660e8400-e29b-41d4-a716-446655440001",
      "similarity": 0.87,
      "item": { /* item details */ }
    }
  ]
}
```

## Rate Limiting

Currently no rate limiting (single-user application). If deployed publicly, consider adding:
- Rate limiting middleware
- API key authentication
- Request throttling

## Webhooks (Future)

Not currently implemented. Potential future features:
- Outfit generation complete
- AI job status changes
- New items added

## Best Practices

### Error Handling
Always check response status codes and handle errors gracefully:

```typescript
try {
  const response = await fetch('/api/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    console.error('API Error:', error.error.message);
    // Handle error
  }
  
  const result = await response.json();
  // Use result
} catch (error) {
  console.error('Network Error:', error);
  // Handle network error
}
```

### File Uploads
Use FormData for file uploads:

```typescript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('kind', 'original_main');

const response = await fetch(`/api/items/${itemId}/images`, {
  method: 'POST',
  body: formData,
});
```

### Polling AI Jobs
Poll for job completion with exponential backoff:

```typescript
async function pollJobStatus(jobId: string, maxAttempts = 30) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const response = await fetch(`/api/ai/jobs/${jobId}`);
    const { job } = await response.json();
    
    if (job.status === 'succeeded' || job.status === 'failed') {
      return job;
    }
    
    // Exponential backoff: 1s, 2s, 4s, 8s, max 10s
    const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  throw new Error('Job polling timeout');
}
```

## API Testing

### Using cURL

**Create item**:
```bash
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Item", "category": "tops"}'
```

**Upload image**:
```bash
curl -X POST http://localhost:3000/api/items/[id]/images \
  -F "file=@photo.jpg" \
  -F "kind=original_main"
```

**Get items**:
```bash
curl http://localhost:3000/api/items?category=tops&state=available
```

### Using Postman

Import the API collection (see `docs/api/postman-collection.json` for example collection).

## API Versioning

Current version: v1 (no version prefix in URL)

Future versioning strategy:
- Add `/v2/` prefix when breaking changes are needed
- Maintain `/v1/` for backward compatibility
- Deprecate old versions with clear migration path
