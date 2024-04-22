/*
  Warnings:

  - You are about to drop the column `chekOutemailSent` on the `checkouts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "checkouts" DROP COLUMN "chekOutemailSent",
ADD COLUMN     "checkoutEmailSent" BOOLEAN NOT NULL DEFAULT false;
