/*
  Warnings:

  - You are about to drop the column `elasticEmailApiKey` on the `email_settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "email_settings" DROP COLUMN "elasticEmailApiKey",
ADD COLUMN     "brevoEmailApiKey" TEXT;

-- AlterTable
ALTER TABLE "shopify_stores" ADD COLUMN     "discountCode" TEXT NOT NULL DEFAULT 'ZAMA_SPECIAL';
