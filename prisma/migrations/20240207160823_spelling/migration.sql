/*
  Warnings:

  - You are about to drop the column `producIds` on the `shopify_stores` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "shopify_stores" DROP COLUMN "producIds",
ADD COLUMN     "selectedProductIds" TEXT[];
