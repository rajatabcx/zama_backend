/*
  Warnings:

  - You are about to drop the column `abandoned_checkout_url` on the `checkouts` table. All the data in the column will be lost.
  - You are about to drop the column `customerEmail` on the `checkouts` table. All the data in the column will be lost.
  - You are about to drop the column `customerFirstName` on the `checkouts` table. All the data in the column will be lost.
  - You are about to drop the column `customerLastName` on the `checkouts` table. All the data in the column will be lost.
  - You are about to drop the column `orderFulFilled` on the `checkouts` table. All the data in the column will be lost.
  - You are about to drop the column `presentment_currency` on the `checkouts` table. All the data in the column will be lost.
  - You are about to drop the column `subtotal_price` on the `checkouts` table. All the data in the column will be lost.
  - You are about to drop the column `total_discounts` on the `checkouts` table. All the data in the column will be lost.
  - You are about to drop the column `total_price` on the `checkouts` table. All the data in the column will be lost.
  - You are about to drop the column `total_tax` on the `checkouts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "checkouts" DROP COLUMN "abandoned_checkout_url",
DROP COLUMN "customerEmail",
DROP COLUMN "customerFirstName",
DROP COLUMN "customerLastName",
DROP COLUMN "orderFulFilled",
DROP COLUMN "presentment_currency",
DROP COLUMN "subtotal_price",
DROP COLUMN "total_discounts",
DROP COLUMN "total_price",
DROP COLUMN "total_tax";
