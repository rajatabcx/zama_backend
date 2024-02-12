/*
  Warnings:

  - You are about to drop the column `buyer_accepts_marketing` on the `checkouts` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `checkouts` table. All the data in the column will be lost.
  - You are about to drop the column `total_line_items_price` on the `checkouts` table. All the data in the column will be lost.
  - You are about to drop the `EmailSettings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LineItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "EmailSettings" DROP CONSTRAINT "EmailSettings_userId_fkey";

-- DropForeignKey
ALTER TABLE "LineItem" DROP CONSTRAINT "LineItem_checkoutId_fkey";

-- DropIndex
DROP INDEX "checkouts_email_key";

-- AlterTable
ALTER TABLE "checkouts" DROP COLUMN "buyer_accepts_marketing",
DROP COLUMN "email",
DROP COLUMN "total_line_items_price";

-- DropTable
DROP TABLE "EmailSettings";

-- DropTable
DROP TABLE "LineItem";

-- CreateTable
CREATE TABLE "email_settings" (
    "id" TEXT NOT NULL,
    "stripoApiKey" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "line_items" (
    "id" TEXT NOT NULL,
    "productId" BIGINT NOT NULL,
    "variantId" BIGINT NOT NULL,
    "title" TEXT NOT NULL,
    "variantTitle" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" TEXT NOT NULL,
    "line_price" TEXT NOT NULL,
    "variant_price" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "checkoutId" TEXT NOT NULL,

    CONSTRAINT "line_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "email_settings_id_key" ON "email_settings"("id");

-- CreateIndex
CREATE UNIQUE INDEX "email_settings_userId_key" ON "email_settings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "line_items_id_key" ON "line_items"("id");

-- AddForeignKey
ALTER TABLE "email_settings" ADD CONSTRAINT "email_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "line_items" ADD CONSTRAINT "line_items_checkoutId_fkey" FOREIGN KEY ("checkoutId") REFERENCES "checkouts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
