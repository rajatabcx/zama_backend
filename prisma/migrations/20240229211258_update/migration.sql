/*
  Warnings:

  - The `productIds` column on the `product_upsells` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "product_upsells" DROP COLUMN "productIds",
ADD COLUMN     "productIds" JSONB[];
