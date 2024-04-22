-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "shopifyOrderId" TEXT NOT NULL,
    "email" TEXT,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "orderFulFilled" BOOLEAN NOT NULL DEFAULT false,
    "shopifyStoreId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "orders_id_key" ON "orders"("id");

-- CreateIndex
CREATE UNIQUE INDEX "orders_shopifyOrderId_key" ON "orders"("shopifyOrderId");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_shopifyStoreId_fkey" FOREIGN KEY ("shopifyStoreId") REFERENCES "shopify_stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
