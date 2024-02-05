/*
  Warnings:

  - Added the required column `accessToken` to the `shopify_stores` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `shopify_stores` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "shopify_stores" ADD COLUMN     "accessToken" TEXT NOT NULL,
ALTER COLUMN "name" SET NOT NULL;
