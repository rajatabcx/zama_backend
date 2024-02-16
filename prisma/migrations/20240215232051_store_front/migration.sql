/*
  Warnings:

  - A unique constraint covering the columns `[storeFrontAccessToken]` on the table `shopify_stores` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "shopify_stores" ADD COLUMN     "storeFrontAccessToken" TEXT NOT NULL DEFAULT 'sd';

-- CreateIndex
CREATE UNIQUE INDEX "shopify_stores_storeFrontAccessToken_key" ON "shopify_stores"("storeFrontAccessToken");
