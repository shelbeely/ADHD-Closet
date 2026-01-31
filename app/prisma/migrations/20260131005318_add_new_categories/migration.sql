-- AlterEnum: Add new categories to Category enum
ALTER TYPE "Category" ADD VALUE 'swimwear';
ALTER TYPE "Category" ADD VALUE 'activewear';
ALTER TYPE "Category" ADD VALUE 'sleepwear';
ALTER TYPE "Category" ADD VALUE 'loungewear';
ALTER TYPE "Category" ADD VALUE 'suits_sets';

-- AlterEnum: Add new outfit roles to OutfitRole enum
ALTER TYPE "OutfitRole" ADD VALUE 'swimwear';
ALTER TYPE "OutfitRole" ADD VALUE 'activewear';
ALTER TYPE "OutfitRole" ADD VALUE 'sleepwear';
ALTER TYPE "OutfitRole" ADD VALUE 'loungewear';
ALTER TYPE "OutfitRole" ADD VALUE 'suit_set';

-- CreateEnum: Create BottomsType enum
CREATE TYPE "BottomsType" AS ENUM ('jeans', 'dress_pants', 'casual_pants', 'cargo_pants', 'shorts', 'skirt', 'leggings', 'joggers', 'other');

-- AlterTable: Add bottoms_type column to items table
ALTER TABLE "items" ADD COLUMN "bottoms_type" "BottomsType";
