-- CreateEnum for AccessoryType
CREATE TYPE "AccessoryType" AS ENUM ('purse', 'bag', 'backpack', 'belt', 'hat', 'scarf', 'gloves', 'sunglasses', 'watch', 'other');

-- CreateEnum for JewelryType
CREATE TYPE "JewelryType" AS ENUM ('necklace', 'earrings', 'bracelet', 'ring', 'anklet', 'brooch', 'other');

-- CreateEnum for ShoeType
CREATE TYPE "ShoeType" AS ENUM ('sneakers', 'boots', 'sandals', 'heels', 'flats', 'loafers', 'oxfords', 'platforms', 'other');

-- AlterTable: Add new columns to items table
ALTER TABLE "items" ADD COLUMN "accessory_type" "AccessoryType";
ALTER TABLE "items" ADD COLUMN "jewelry_type" "JewelryType";
ALTER TABLE "items" ADD COLUMN "shoe_type" "ShoeType";
