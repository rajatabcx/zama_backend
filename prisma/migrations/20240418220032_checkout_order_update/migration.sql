/*
  Warnings:

  - You are about to drop the column `emailSent` on the `checkouts` table. All the data in the column will be lost.
  - You are about to drop the column `shopifyStoreFrontCheckoutToken` on the `checkouts` table. All the data in the column will be lost.
  - You are about to drop the `orders` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[shopifyOrderId]` on the table `checkouts` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[shopifyOrderGraphqlId]` on the table `checkouts` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_shopifyStoreId_fkey";

-- DropIndex
DROP INDEX "checkouts_shopifyStoreFrontCheckoutToken_key";

-- AlterTable
ALTER TABLE "checkouts" DROP COLUMN "emailSent",
DROP COLUMN "shopifyStoreFrontCheckoutToken",
ADD COLUMN     "chekOutemailSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "orderPlaced" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reviewEmailSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "shopifyOrderGraphqlId" TEXT,
ADD COLUMN     "shopifyOrderId" BIGINT;

-- DropTable
DROP TABLE "orders";

-- CreateIndex
CREATE UNIQUE INDEX "checkouts_shopifyOrderId_key" ON "checkouts"("shopifyOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "checkouts_shopifyOrderGraphqlId_key" ON "checkouts"("shopifyOrderGraphqlId");
