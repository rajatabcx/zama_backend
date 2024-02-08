/*
  Warnings:

  - The `discountId` column on the `shopify_stores` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `selectedProductIds` column on the `shopify_stores` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "shopify_stores" ADD COLUMN     "priceRuleId" INTEGER,
DROP COLUMN "discountId",
ADD COLUMN     "discountId" INTEGER,
DROP COLUMN "selectedProductIds",
ADD COLUMN     "selectedProductIds" JSONB[];
