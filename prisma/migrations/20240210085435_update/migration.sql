-- AlterTable
ALTER TABLE "shopify_stores" ADD COLUMN     "hourDelay" INTEGER NOT NULL DEFAULT 10;

-- CreateTable
CREATE TABLE "EmailSettings" (
    "id" TEXT NOT NULL,
    "stripoApiKey" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checkouts" (
    "id" TEXT NOT NULL,
    "shopifyCheckoutId" BIGINT NOT NULL,
    "shopifyCartToken" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "buyer_accepts_marketing" TEXT NOT NULL,
    "abandoned_checkout_url" TEXT NOT NULL,
    "presentment_currency" TEXT NOT NULL,
    "total_line_items_price" TEXT NOT NULL,
    "total_price" TEXT NOT NULL,
    "total_tax" TEXT NOT NULL,
    "total_discounts" TEXT NOT NULL,
    "subtotal_price" TEXT NOT NULL,
    "customerEmail" TEXT,
    "customerFirstName" TEXT,
    "customerLastName" TEXT,
    "orderFulFilled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "shopifyStoreId" TEXT NOT NULL,

    CONSTRAINT "checkouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LineItem" (
    "id" TEXT NOT NULL,
    "productId" BIGINT NOT NULL,
    "variantId" BIGINT NOT NULL,
    "title" TEXT NOT NULL,
    "variantTitle" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" TEXT NOT NULL,
    "line_price" TEXT NOT NULL,
    "variant_price" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "checkoutId" TEXT NOT NULL,

    CONSTRAINT "LineItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailSettings_id_key" ON "EmailSettings"("id");

-- CreateIndex
CREATE UNIQUE INDEX "EmailSettings_userId_key" ON "EmailSettings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "checkouts_id_key" ON "checkouts"("id");

-- CreateIndex
CREATE UNIQUE INDEX "checkouts_shopifyCheckoutId_key" ON "checkouts"("shopifyCheckoutId");

-- CreateIndex
CREATE UNIQUE INDEX "checkouts_email_key" ON "checkouts"("email");

-- CreateIndex
CREATE UNIQUE INDEX "checkouts_customerEmail_key" ON "checkouts"("customerEmail");

-- CreateIndex
CREATE UNIQUE INDEX "LineItem_id_key" ON "LineItem"("id");

-- AddForeignKey
ALTER TABLE "EmailSettings" ADD CONSTRAINT "EmailSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkouts" ADD CONSTRAINT "checkouts_shopifyStoreId_fkey" FOREIGN KEY ("shopifyStoreId") REFERENCES "shopify_stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineItem" ADD CONSTRAINT "LineItem_checkoutId_fkey" FOREIGN KEY ("checkoutId") REFERENCES "checkouts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
