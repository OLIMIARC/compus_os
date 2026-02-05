-- CreateTable
CREATE TABLE "shops" (
    "id" TEXT NOT NULL,
    "campus_id" TEXT NOT NULL,
    "owner_user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "reputation_snapshot" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shops_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "users" ADD COLUMN "completed_actions" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "marketplace_listings" ADD COLUMN "shop_id" TEXT;

-- CreateIndex
CREATE INDEX "shops_campus_id_status_idx" ON "shops"("campus_id", "status");

-- CreateIndex
CREATE INDEX "shops_owner_user_id_idx" ON "shops"("owner_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "shops_campus_id_name_key" ON "shops"("campus_id", "name");

-- CreateIndex
CREATE INDEX "marketplace_listings_shop_id_idx" ON "marketplace_listings"("shop_id");

-- AddForeignKey
ALTER TABLE "shops" ADD CONSTRAINT "shops_campus_id_fkey" FOREIGN KEY ("campus_id") REFERENCES "campuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shops" ADD CONSTRAINT "shops_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketplace_listings" ADD CONSTRAINT "marketplace_listings_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE SET NULL ON UPDATE CASCADE;
