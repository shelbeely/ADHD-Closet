-- AlterEnum: Add FranchiseType enum
CREATE TYPE "FranchiseType" AS ENUM ('band', 'movie', 'tv_show', 'game', 'anime', 'comic', 'sports', 'brand', 'other');

-- AlterTable: Add franchise fields to items table
ALTER TABLE "items" ADD COLUMN "is_licensed_merch" BOOLEAN;
ALTER TABLE "items" ADD COLUMN "franchise" TEXT;
ALTER TABLE "items" ADD COLUMN "franchise_type" "FranchiseType";

-- CreateIndex: Add indexes for franchise filtering
CREATE INDEX "items_franchise_idx" ON "items"("franchise");
CREATE INDEX "items_franchise_type_idx" ON "items"("franchise_type");
CREATE INDEX "items_is_licensed_merch_idx" ON "items"("is_licensed_merch");
