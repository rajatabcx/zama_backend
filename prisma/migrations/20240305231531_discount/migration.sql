-- AlterTable
ALTER TABLE "shopify_stores" ADD COLUMN     "discouintPercentage" DOUBLE PRECISION,
ALTER COLUMN "discountCode" DROP NOT NULL,
ALTER COLUMN "discountCode" DROP DEFAULT;
