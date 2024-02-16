/*
  Warnings:

  - You are about to drop the column `shopifyCheckoutKey` on the `checkouts` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[shopifyAbandonedCheckoutURL]` on the table `checkouts` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "checkouts_shopifyCheckoutKey_key";

-- AlterTable
ALTER TABLE "checkouts" DROP COLUMN "shopifyCheckoutKey",
ADD COLUMN     "shopifyAbandonedCheckoutURL" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "checkouts_shopifyAbandonedCheckoutURL_key" ON "checkouts"("shopifyAbandonedCheckoutURL");
