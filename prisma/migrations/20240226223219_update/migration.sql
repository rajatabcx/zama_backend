/*
  Warnings:

  - You are about to drop the column `brevoEmailApiKey` on the `email_settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "email_settings" DROP COLUMN "brevoEmailApiKey",
ADD COLUMN     "elasticEmailApiKey" TEXT;
