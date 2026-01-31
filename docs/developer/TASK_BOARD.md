# Build Plan & Task Board (Agent-Friendly)

This is a concrete, ordered task board. Each task should be implemented with real working code and tested before moving on.

## Phase 0 — Repo & Infra
1. Create Next.js (App Router) + TS + Tailwind project
2. Add Prisma + Postgres; commit schema + migrations
3. Add docker-compose: Postgres + Redis + (optional) admin tools
4. Add BullMQ worker setup (separate process or Next.js runtime worker)
5. Add file storage directory structure under DATA_DIR (configurable)

## Phase 1 — Core Data & CRUD
6. Implement Item CRUD routes + pages
7. Implement Tag CRUD + tagging UX
8. Implement Image upload API:
   - multipart upload
   - metadata extraction (width/height/mime)
   - store file under DATA_DIR
   - create ImageAsset row
9. Image serving endpoint (secure path mapping)
10. Thumbnail generation pipeline (Sharp) for original images

## Phase 2 — Mobile-first UI
11. Mobile home: category chips/tabs
12. Category grid view with thumbnails (pagination/virtualization)
13. Item detail view: Basics + Advanced (collapsed)
14. One-tap Add Item flow:
    - pick camera/gallery
    - upload
    - create item immediately
    - show processing status

## Phase 3 — AI Jobs & Review
15. AIJob model + status UI
16. OpenRouter client (server-side) with strict typing + retries
17. Job: generate_catalog_image (Nano Banana / configured model)
18. Store AI output image + thumbnail as ImageAssets (ai_catalog + thumbnail)
19. Job: infer_item + optional extract_label
20. “AI suggestions” review UI:
    - show suggested category/tags/attributes
    - allow accept/edit
    - record confidence and source

## Phase 4 — Desktop Power Tools
21. Desktop browse layout (filters + results + inspector)
22. Bulk edit table:
    - multi-select
    - apply tags/state/category
23. Keyboard shortcuts
24. Side-by-side compare
25. Batch AI regeneration actions (selected items)

## Phase 5 — Outfits
26. Outfit data model + CRUD
27. Outfit generator UI (quick picks + panic pick)
28. OpenRouter structured JSON generation for outfits
29. Outfit save + rating (up/down)
30. Simple re-ranking based on rating history

## Phase 6 — Three.js Closet Rail
31. Closet rail page/tab
32. Render hanging cards with thumbnails as textures
33. Lazy texture loading + performance caps
34. Search highlighting + category grouping
35. Drag from rail to outfit builder slots (desktop)

## Phase 7 — Export/Import
36. Export JSON + CSV builders
37. ZIP export including images + manifest
38. Import ZIP with validation + restore
39. Wipe-and-restore test script for verification

## Phase 8 — Polish & Hardening
40. Error UX + retry UX
41. File size limits + safe serving
42. Performance pass (virtualization, thumbnails everywhere)
43. “Definition of Done” checklist run-through
