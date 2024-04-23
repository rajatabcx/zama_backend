/*
  Warnings:

  - A unique constraint covering the columns `[shopifyStorefrontCheckoutToken]` on the table `checkouts` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `shopifyStorefrontCheckoutToken` to the `checkouts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "checkouts" ADD COLUMN     "shopifyStorefrontCheckoutToken" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "checkouts_shopifyStorefrontCheckoutToken_key" ON "checkouts"("shopifyStorefrontCheckoutToken");
