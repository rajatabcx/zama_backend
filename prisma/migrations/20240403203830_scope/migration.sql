/*
  Warnings:

  - Added the required column `scope` to the `judge_me` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "judge_me" ADD COLUMN     "scope" TEXT NOT NULL;
