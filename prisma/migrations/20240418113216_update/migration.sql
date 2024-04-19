-- DropIndex
DROP INDEX "email_settings_userId_key";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "integrations" JSONB;
