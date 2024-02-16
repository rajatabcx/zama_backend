/*
  Warnings:

  - Made the column `shopifyAbandonedCheckoutURL` on table `checkouts` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "checkouts" ALTER COLUMN "shopifyAbandonedCheckoutURL" SET NOT NULL;
