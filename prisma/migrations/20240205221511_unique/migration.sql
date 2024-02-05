/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `shopify_stores` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[accessToken]` on the table `shopify_stores` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "shopify_stores_name_key" ON "shopify_stores"("name");

-- CreateIndex
CREATE UNIQUE INDEX "shopify_stores_accessToken_key" ON "shopify_stores"("accessToken");
