-- CreateEnum
CREATE TYPE "StorageType" AS ENUM ('hanging', 'folded', 'drawer', 'shelf', 'box', 'other');

-- AlterTable
ALTER TABLE "items" ADD COLUMN "storage_type" "StorageType",
ADD COLUMN "location_in_closet" TEXT,
ADD COLUMN "sort_order" INTEGER;
