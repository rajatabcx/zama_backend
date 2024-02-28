/*
  Warnings:

  - Made the column `elasticEmailApiKey` on table `email_settings` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "email_settings" ALTER COLUMN "elasticEmailApiKey" SET NOT NULL;
