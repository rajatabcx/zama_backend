-- CreateEnum
CREATE TYPE "SMSPlatformName" AS ENUM ('POSTSCRIPT');

-- CreateTable
CREATE TABLE "sms_platforms" (
    "id" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "name" "SMSPlatformName" NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sms_platforms_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sms_platforms_id_key" ON "sms_platforms"("id");

-- AddForeignKey
ALTER TABLE "sms_platforms" ADD CONSTRAINT "sms_platforms_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
