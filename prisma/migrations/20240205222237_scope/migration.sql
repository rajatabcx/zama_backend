/*
  Warnings:

  - Added the required column `scope` to the `shopify_stores` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "shopify_stores" ADD COLUMN     "scope" TEXT NOT NULL;
