/*
  Warnings:

  - You are about to drop the `line_items` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "line_items" DROP CONSTRAINT "line_items_checkoutId_fkey";

-- DropTable
DROP TABLE "line_items";
