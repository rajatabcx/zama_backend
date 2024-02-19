/*
  Warnings:

  - You are about to drop the column `stripoApiKey` on the `email_settings` table. All the data in the column will be lost.
  - Added the required column `elasticEmailApiKey` to the `email_settings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "checkouts" ADD COLUMN     "emailSent" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "email_settings" DROP COLUMN "stripoApiKey",
ADD COLUMN     "elasticEmailApiKey" TEXT NOT NULL;
