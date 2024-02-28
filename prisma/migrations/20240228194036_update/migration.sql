-- CreateTable
CREATE TABLE "product_upsells" (
    "id" TEXT NOT NULL,
    "productIds" TEXT[],
    "discountId" TEXT,
    "listName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_upsells_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_upsells_id_key" ON "product_upsells"("id");
