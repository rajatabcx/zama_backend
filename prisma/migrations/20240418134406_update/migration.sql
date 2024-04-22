/*
  Warnings:

  - You are about to drop the `integrations` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "integrations" DROP CONSTRAINT "integrations_userId_fkey";

-- DropTable
DROP TABLE "integrations";
