/*
  Warnings:

  - You are about to drop the column `shopifyAdminCheckoutId` on the `checkouts` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[shopifyAdminCheckoutToken]` on the table `checkouts` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `shopifyAdminCheckoutToken` to the `checkouts` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "checkouts_shopifyAdminCheckoutId_key";

-- AlterTable
ALTER TABLE "checkouts" DROP COLUMN "shopifyAdminCheckoutId",
ADD COLUMN     "shopifyAdminCheckoutToken" BIGINT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "checkouts_shopifyAdminCheckoutToken_key" ON "checkouts"("shopifyAdminCheckoutToken");
