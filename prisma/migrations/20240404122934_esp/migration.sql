-- CreateEnum
CREATE TYPE "EmailServiceProvider" AS ENUM ('ELASTICEMAIL');

-- AlterTable
ALTER TABLE "email_settings" ADD COLUMN     "emailServiceProvider" "EmailServiceProvider" NOT NULL DEFAULT 'ELASTICEMAIL';
