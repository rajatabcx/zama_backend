/*
  Warnings:

  - You are about to drop the column `discouintPercentage` on the `shopify_stores` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "shopify_stores" DROP COLUMN "discouintPercentage",
ADD COLUMN     "discountPercentage" DOUBLE PRECISION;
