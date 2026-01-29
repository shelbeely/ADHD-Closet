-- CreateEnum
CREATE TYPE "CleanStatus" AS ENUM ('clean', 'dirty', 'needs_wash');

-- AlterTable
ALTER TABLE "items" ADD COLUMN "clean_status" "CleanStatus" DEFAULT 'clean',
ADD COLUMN "wears_before_wash" INTEGER DEFAULT 1,
ADD COLUMN "current_wears" INTEGER NOT NULL DEFAULT 0;
