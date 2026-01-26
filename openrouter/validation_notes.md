Validation Rules:
- Always validate structured output with Ajv or Zod.
- Response Healing is a safety net, not a validator.
- If validation fails twice, mark job as needs_review.
- Store raw + healed outputs for debugging.