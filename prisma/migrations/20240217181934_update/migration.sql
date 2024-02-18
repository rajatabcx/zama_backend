/*
  Warnings:

  - You are about to drop the column `shopifyCartToken` on the `checkouts` table. All the data in the column will be lost.
  - You are about to drop the column `shopifyCheckoutId` on the `checkouts` table. All the data in the column will be lost.
  - You are about to drop the column `shopifyCheckoutToken` on the `checkouts` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[shopifyAdminCheckoutId]` on the table `checkouts` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[shopifyStorefrontCheckoutId]` on the table `checkouts` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[shopifyStoreFrontCheckoutToken]` on the table `checkouts` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `shopifyAdminCheckoutId` to the `checkouts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shopifyStoreFrontCheckoutToken` to the `checkouts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shopifyStorefrontCheckoutId` to the `checkouts` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "checkouts_shopifyCartToken_key";

-- DropIndex
DROP INDEX "checkouts_shopifyCheckoutId_key";

-- DropIndex
DROP INDEX "checkouts_shopifyCheckoutToken_key";

-- AlterTable
ALTER TABLE "checkouts" DROP COLUMN "shopifyCartToken",
DROP COLUMN "shopifyCheckoutId",
DROP COLUMN "shopifyCheckoutToken",
ADD COLUMN     "shopifyAdminCheckoutId" BIGINT NOT NULL,
ADD COLUMN     "shopifyStoreFrontCheckoutToken" TEXT NOT NULL,
ADD COLUMN     "shopifyStorefrontCheckoutId" BIGINT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "checkouts_shopifyAdminCheckoutId_key" ON "checkouts"("shopifyAdminCheckoutId");

-- CreateIndex
CREATE UNIQUE INDEX "checkouts_shopifyStorefrontCheckoutId_key" ON "checkouts"("shopifyStorefrontCheckoutId");

-- CreateIndex
CREATE UNIQUE INDEX "checkouts_shopifyStoreFrontCheckoutToken_key" ON "checkouts"("shopifyStoreFrontCheckoutToken");
