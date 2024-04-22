/*
  Warnings:

  - You are about to drop the column `checkoutTemplateName` on the `email_settings` table. All the data in the column will be lost.
  - You are about to drop the column `elasticEmailApiKey` on the `email_settings` table. All the data in the column will be lost.
  - You are about to drop the column `productUpsellTemplateName` on the `email_settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "email_settings" DROP COLUMN "checkoutTemplateName",
DROP COLUMN "elasticEmailApiKey",
DROP COLUMN "productUpsellTemplateName",
ADD COLUMN     "apiKey" TEXT NOT NULL DEFAULT 'asdcbd',
ADD COLUMN     "checkoutTemplate" TEXT,
ADD COLUMN     "enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "productUpsellTemplate" TEXT,
ADD COLUMN     "reviewTemplate" TEXT;
