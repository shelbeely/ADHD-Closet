-- CreateEnum
CREATE TYPE "Category" AS ENUM ('tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories', 'underwear_bras', 'jewelry');

-- CreateEnum
CREATE TYPE "ItemState" AS ENUM ('available', 'laundry', 'unavailable', 'donate');

-- CreateEnum
CREATE TYPE "ImageKind" AS ENUM ('original_main', 'original_back', 'label_brand', 'label_care', 'detail', 'ai_catalog', 'thumbnail');

-- CreateEnum
CREATE TYPE "OutfitRole" AS ENUM ('top', 'bottom', 'dress', 'outerwear', 'shoes', 'accessory', 'underwear_bras', 'jewelry');

-- CreateEnum
CREATE TYPE "OutfitRating" AS ENUM ('up', 'down', 'neutral');

-- CreateEnum
CREATE TYPE "AIJobType" AS ENUM ('generate_catalog_image', 'infer_item', 'extract_label', 'generate_outfit');

-- CreateEnum
CREATE TYPE "AIJobStatus" AS ENUM ('queued', 'running', 'succeeded', 'failed', 'needs_review');

-- CreateTable
CREATE TABLE "items" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "category" "Category",
    "state" "ItemState" NOT NULL DEFAULT 'available',
    "brand" TEXT,
    "size_text" TEXT,
    "materials" TEXT,
    "color_palette" JSONB,
    "attributes" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "image_assets" (
    "id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "kind" "ImageKind" NOT NULL,
    "file_path" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "mime_type" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "image_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_tags" (
    "item_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,

    CONSTRAINT "item_tags_pkey" PRIMARY KEY ("item_id","tag_id")
);

-- CreateTable
CREATE TABLE "outfits" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "notes" TEXT,
    "rating" "OutfitRating" NOT NULL DEFAULT 'neutral',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "outfits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outfit_items" (
    "outfit_id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "role" "OutfitRole" NOT NULL,

    CONSTRAINT "outfit_items_pkey" PRIMARY KEY ("outfit_id","item_id")
);

-- CreateTable
CREATE TABLE "ai_jobs" (
    "id" TEXT NOT NULL,
    "type" "AIJobType" NOT NULL,
    "status" "AIJobStatus" NOT NULL DEFAULT 'queued',
    "item_id" TEXT,
    "outfit_id" TEXT,
    "input_refs" JSONB,
    "output_json" JSONB,
    "confidence_json" JSONB,
    "model_name" TEXT,
    "raw_response" TEXT,
    "error" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "max_attempts" INTEGER NOT NULL DEFAULT 3,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "ai_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "image_assets_item_id_idx" ON "image_assets"("item_id");

-- CreateIndex
CREATE INDEX "image_assets_kind_idx" ON "image_assets"("kind");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE INDEX "item_tags_item_id_idx" ON "item_tags"("item_id");

-- CreateIndex
CREATE INDEX "item_tags_tag_id_idx" ON "item_tags"("tag_id");

-- CreateIndex
CREATE INDEX "outfit_items_outfit_id_idx" ON "outfit_items"("outfit_id");

-- CreateIndex
CREATE INDEX "outfit_items_item_id_idx" ON "outfit_items"("item_id");

-- CreateIndex
CREATE INDEX "ai_jobs_item_id_idx" ON "ai_jobs"("item_id");

-- CreateIndex
CREATE INDEX "ai_jobs_outfit_id_idx" ON "ai_jobs"("outfit_id");

-- CreateIndex
CREATE INDEX "ai_jobs_status_idx" ON "ai_jobs"("status");

-- CreateIndex
CREATE INDEX "ai_jobs_type_idx" ON "ai_jobs"("type");

-- AddForeignKey
ALTER TABLE "image_assets" ADD CONSTRAINT "image_assets_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_tags" ADD CONSTRAINT "item_tags_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_tags" ADD CONSTRAINT "item_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outfit_items" ADD CONSTRAINT "outfit_items_outfit_id_fkey" FOREIGN KEY ("outfit_id") REFERENCES "outfits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outfit_items" ADD CONSTRAINT "outfit_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_jobs" ADD CONSTRAINT "ai_jobs_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_jobs" ADD CONSTRAINT "ai_jobs_outfit_id_fkey" FOREIGN KEY ("outfit_id") REFERENCES "outfits"("id") ON DELETE CASCADE ON UPDATE CASCADE;
