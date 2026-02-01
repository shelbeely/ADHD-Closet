-- DropIndex
DROP INDEX "items_franchise_idx";

-- DropIndex
DROP INDEX "items_franchise_type_idx";

-- DropIndex
DROP INDEX "items_is_generated_idx";

-- DropIndex
DROP INDEX "items_is_licensed_merch_idx";

-- DropIndex
DROP INDEX "items_source_item_id_idx";

-- CreateTable
CREATE TABLE "nfc_tags" (
    "id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,
    "label" TEXT,
    "item_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nfc_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nfc_events" (
    "id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nfc_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "nfc_tags_tag_id_key" ON "nfc_tags"("tag_id");

-- CreateIndex
CREATE UNIQUE INDEX "nfc_tags_item_id_key" ON "nfc_tags"("item_id");

-- CreateIndex
CREATE INDEX "nfc_tags_tag_id_idx" ON "nfc_tags"("tag_id");

-- CreateIndex
CREATE INDEX "nfc_events_item_id_idx" ON "nfc_events"("item_id");

-- CreateIndex
CREATE INDEX "nfc_events_tag_id_idx" ON "nfc_events"("tag_id");

-- CreateIndex
CREATE INDEX "nfc_events_created_at_idx" ON "nfc_events"("created_at");

-- AddForeignKey
ALTER TABLE "nfc_tags" ADD CONSTRAINT "nfc_tags_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nfc_events" ADD CONSTRAINT "nfc_events_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
