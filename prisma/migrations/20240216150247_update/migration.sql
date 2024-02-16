/*
  Warnings:

  - A unique constraint covering the columns `[shopifyCheckoutToken]` on the table `checkouts` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[shopifyCheckoutKey]` on the table `checkouts` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[shopifyCartToken]` on the table `checkouts` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "checkouts" ADD COLUMN     "shopifyCheckoutKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "checkouts_shopifyCheckoutToken_key" ON "checkouts"("shopifyCheckoutToken");

-- CreateIndex
CREATE UNIQUE INDEX "checkouts_shopifyCheckoutKey_key" ON "checkouts"("shopifyCheckoutKey");

-- CreateIndex
CREATE UNIQUE INDEX "checkouts_shopifyCartToken_key" ON "checkouts"("shopifyCartToken");
