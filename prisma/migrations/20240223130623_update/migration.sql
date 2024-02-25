/*
  Warnings:

  - Made the column `brevoEmailApiKey` on table `email_settings` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "email_settings" ALTER COLUMN "brevoEmailApiKey" SET NOT NULL;
