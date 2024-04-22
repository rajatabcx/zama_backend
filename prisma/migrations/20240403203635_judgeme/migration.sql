-- CreateTable
CREATE TABLE "integrations" (
    "id" TEXT NOT NULL,
    "shopifyConnected" BOOLEAN NOT NULL DEFAULT false,
    "elasticEmailConnected" BOOLEAN NOT NULL DEFAULT false,
    "judgeMeConnected" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "judge_me" (
    "id" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "judge_me_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "integrations_id_key" ON "integrations"("id");

-- CreateIndex
CREATE UNIQUE INDEX "integrations_userId_key" ON "integrations"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "judge_me_id_key" ON "judge_me"("id");

-- CreateIndex
CREATE UNIQUE INDEX "judge_me_userId_key" ON "judge_me"("userId");

-- AddForeignKey
ALTER TABLE "integrations" ADD CONSTRAINT "integrations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "judge_me" ADD CONSTRAINT "judge_me_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
