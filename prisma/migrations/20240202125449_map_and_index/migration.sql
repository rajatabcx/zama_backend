/*
  Warnings:

  - You are about to drop the `ShopifyStore` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ShopifyStore" DROP CONSTRAINT "ShopifyStore_userId_fkey";

-- DropTable
DROP TABLE "ShopifyStore";

-- CreateTable
CREATE TABLE "shopify_stores" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shopify_stores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "shopify_stores_id_key" ON "shopify_stores"("id");

-- CreateIndex
CREATE UNIQUE INDEX "shopify_stores_userId_key" ON "shopify_stores"("userId");

-- CreateIndex
CREATE INDEX "shopify_stores_name_idx" ON "shopify_stores"("name");

-- AddForeignKey
ALTER TABLE "shopify_stores" ADD CONSTRAINT "shopify_stores_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
