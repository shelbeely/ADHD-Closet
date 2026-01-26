# Performance Budget & Rules (v1)

## Images
- Always display thumbnails in grids/lists/3D (never full-res originals)
- Store thumbnail as WebP with max dimension 512px
- Use lazy loading for images in lists

## Lists
- Paginate results for mobile
- Virtualize lists/tables on desktop (bulk view) if item count grows

## Three.js
- Use thumbnails (<=512px textures)
- Lazy-load textures as cards enter view
- Avoid expensive postprocessing
- Cap number of simultaneously loaded textures
- Prefer instancing/sprites for cards if needed

## Jobs
- AI and image processing must be background jobs; never block UI requests
- Status polling should be throttled (or use SSE later)
