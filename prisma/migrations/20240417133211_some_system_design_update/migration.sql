/*
  Warnings:

  - You are about to drop the `judge_me` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ReviewPlatformName" AS ENUM ('JUDGE_ME', 'OKENDO', 'YOTPO');

-- AlterEnum
ALTER TYPE "EmailServiceProvider" ADD VALUE 'BRAZE';

-- DropForeignKey
ALTER TABLE "judge_me" DROP CONSTRAINT "judge_me_userId_fkey";

-- DropTable
DROP TABLE "judge_me";

-- CreateTable
CREATE TABLE "review_platforms" (
    "id" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "scope" TEXT,
    "name" "ReviewPlatformName" NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_platforms_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "review_platforms_id_key" ON "review_platforms"("id");

-- CreateIndex
CREATE UNIQUE INDEX "review_platforms_userId_key" ON "review_platforms"("userId");

-- AddForeignKey
ALTER TABLE "review_platforms" ADD CONSTRAINT "review_platforms_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
