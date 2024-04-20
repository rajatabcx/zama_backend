-- DropIndex
DROP INDEX "review_platforms_userId_key";

-- AlterTable
ALTER TABLE "checkouts" ADD COLUMN     "reviewSubmittedFor" BIGINT[];
