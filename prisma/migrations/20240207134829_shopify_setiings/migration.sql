-- AlterTable
ALTER TABLE "shopify_stores" ADD COLUMN     "discountId" TEXT,
ADD COLUMN     "givingDiscount" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "producIds" TEXT[];
