/*
  Warnings:

  - A unique constraint covering the columns `[shopifyOrderGraphqlId]` on the table `orders` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `shopifyOrderGraphqlId` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `shopifyOrderId` on the `orders` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "shopifyOrderGraphqlId" TEXT NOT NULL,
DROP COLUMN "shopifyOrderId",
ADD COLUMN     "shopifyOrderId" BIGINT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "orders_shopifyOrderId_key" ON "orders"("shopifyOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "orders_shopifyOrderGraphqlId_key" ON "orders"("shopifyOrderGraphqlId");
