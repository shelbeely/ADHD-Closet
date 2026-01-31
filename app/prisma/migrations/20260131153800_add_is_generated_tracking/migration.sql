-- Add fields to track AI-generated vs real items
ALTER TABLE "items" ADD COLUMN "is_generated" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "items" ADD COLUMN "source_item_id" TEXT;
ALTER TABLE "items" ADD COLUMN "generation_type" TEXT;

-- Add indexes for filtering generated items
CREATE INDEX "items_is_generated_idx" ON "items"("is_generated");
CREATE INDEX "items_source_item_id_idx" ON "items"("source_item_id");

-- Comments
COMMENT ON COLUMN "items"."is_generated" IS 'Is this an AI-generated variation (not a real item)?';
COMMENT ON COLUMN "items"."source_item_id" IS 'If generated, ID of the original real item';
COMMENT ON COLUMN "items"."generation_type" IS 'Type: color_variation, seasonal, style_transfer, matching, etc.';
