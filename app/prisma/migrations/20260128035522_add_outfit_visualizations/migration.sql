-- AlterEnum
ALTER TYPE "ImageKind" ADD VALUE 'outfit_board';
ALTER TYPE "ImageKind" ADD VALUE 'outfit_person_wearing';

-- AlterEnum
ALTER TYPE "AIJobType" ADD VALUE 'generate_outfit_visualization';

-- AlterTable
ALTER TABLE "outfits" ADD COLUMN "weather" TEXT,
ADD COLUMN "vibe" TEXT,
ADD COLUMN "occasion" TEXT,
ADD COLUMN "time_available" TEXT,
ADD COLUMN "explanation" TEXT,
ADD COLUMN "swap_suggestions" TEXT;

-- CreateTable
CREATE TABLE "outfit_images" (
    "id" TEXT NOT NULL,
    "outfit_id" TEXT NOT NULL,
    "kind" "ImageKind" NOT NULL,
    "file_path" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "mime_type" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "outfit_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "outfit_images_outfit_id_idx" ON "outfit_images"("outfit_id");

-- CreateIndex
CREATE INDEX "outfit_images_kind_idx" ON "outfit_images"("kind");

-- AddForeignKey
ALTER TABLE "outfit_images" ADD CONSTRAINT "outfit_images_outfit_id_fkey" FOREIGN KEY ("outfit_id") REFERENCES "outfits"("id") ON DELETE CASCADE ON UPDATE CASCADE;
