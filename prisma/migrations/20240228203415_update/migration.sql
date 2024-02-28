/*
  Warnings:

  - Added the required column `name` to the `product_upsells` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UpsellStatus" AS ENUM ('DRAFT', 'ONGOING', 'COMPLETED');

-- AlterTable
ALTER TABLE "product_upsells" ADD COLUMN     "emailNotSent" INTEGER,
ADD COLUMN     "emailSent" INTEGER,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "status" "UpsellStatus" NOT NULL DEFAULT 'DRAFT',
ALTER COLUMN "listName" DROP NOT NULL;
