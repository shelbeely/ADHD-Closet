# API Contract (v1)

Base: Next.js Route Handlers under `/api/*`. All responses are JSON unless noted.

## Conventions
- All IDs are UUID strings.
- Upload endpoints are multipart/form-data.
- Image serving endpoints stream bytes with correct Content-Type.
- Errors return `{ "error": { "code": string, "message": string, "details"?: any } }`.

---

## Items
### POST /api/items
Create item.
Request JSON:
- title? string
- category? (optional; AI may fill)
- state? default "available"

Response:
- item object

### GET /api/items
Query params:
- category, state, tag, q (search), page, pageSize
Response:
- `{ items: Item[], page, pageSize, total }`

### GET /api/items/:id
Response:
- `{ item, images: ImageAsset[], tags: Tag[], ai: { latestJobs } }`

### PATCH /api/items/:id
Request JSON:
- mutable fields: title, category, state, brand, size_text, materials, color_palette, attributes, tags
Response:
- updated item

### DELETE /api/items/:id
Soft delete recommended.
Response:
- `{ ok: true }`

---

## Images
### POST /api/items/:id/images
Multipart:
- `file` (required)
- `kind` (required enum: original_main, original_back, label_brand, label_care, detail)
Response:
- ImageAsset

### GET /api/images/:imageId
Streams the file. Must only serve files under DATA_DIR.

---

## AI Jobs
### POST /api/ai/items/:itemId/catalog
Enqueue catalog generation job.
Response:
- AIJob

### POST /api/ai/items/:itemId/infer
Enqueue inference job.
Response:
- AIJob

### GET /api/ai/jobs
Query params: status, type, itemId, page/pageSize
Response:
- `{ jobs: AIJob[], total, page, pageSize }`

### GET /api/ai/jobs/:jobId
Response:
- `{ job: AIJob }`

---

## Outfits
### POST /api/outfits/generate
Request JSON:
- constraints: { weather?, time_budget?, vibe?, occasion? }
Response:
- `{ outfits: GeneratedOutfit[] }`

### POST /api/outfits
Save an outfit.
Request JSON:
- title?, notes?
- items: [{ item_id, role }]
Response:
- Outfit

### GET /api/outfits
Response:
- `{ outfits: Outfit[] }`

### PATCH /api/outfits/:id
- rating: up/down/neutral
- notes/title updates
Response:
- updated outfit

---

## Export / Import
### POST /api/export
Response:
- Streams ZIP file (application/zip)

### POST /api/import
Multipart:
- `file` (ZIP)
Response:
- `{ ok: true, imported: { items, images, outfits, tags } }`
