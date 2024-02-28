/*
  Warnings:

  - You are about to drop the column `givingDiscount` on the `shopify_stores` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "product_upsells" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "shopify_stores" DROP COLUMN "givingDiscount";

-- AddForeignKey
ALTER TABLE "product_upsells" ADD CONSTRAINT "product_upsells_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
