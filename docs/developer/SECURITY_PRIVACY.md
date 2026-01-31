# Security & Privacy Notes (v1)

## Threat model
- Single-user self-hosted, but still protect:
  - OpenRouter API key
  - file serving path traversal
  - oversized uploads
  - accidental exposure if deployed publicly

## Requirements
- OpenRouter API key must never be sent to client
- All AI requests must be made from server routes/workers
- File serving endpoint must map ImageAsset IDs to known file paths under DATA_DIR
- Reject any request that attempts to serve an arbitrary path
- Set upload size limits and validate mime types
- Include an in-app disclosure:
  - “AI processing sends images to model providers”
  - Toggle to disable AI jobs (app remains usable manually)
