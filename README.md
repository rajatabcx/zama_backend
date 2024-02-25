# ZAMA Backend

change this model

model Checkout {
id String @id @unique @default(uuid())
shopifyAdminCheckoutToken String @unique
shopifyStorefrontCheckoutId String @unique
shopifyStoreFrontCheckoutToken String @unique
shopifyAbandonedCheckoutURL String @unique
email String?
emailSent Boolean @default(false)
orderFulFilled Boolean @default(false)
shopifyStoreId String
ShopifyStore ShopifyStore @relation(fields: [shopifyStoreId], references: [id])
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

@@map("checkouts")
}

to this model

model Checkout {
id String @id @unique @default(uuid())
shopifyAdminCheckoutToken String @unique
shopifyStorefrontCheckoutId String @unique
shopifyStoreFrontCheckoutToken String @unique
shopifyAbandonedCheckoutURL String @unique
metadata Json
shopifyStoreId String
ShopifyStore ShopifyStore @relation(fields: [shopifyStoreId], references: [id])
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

@@map("checkouts")
}

metadata type {email:string, checkoutEmailSent:string, orderFulfilled:string, reviewEmailSent:string, followupEmailSent:string}

email not updating error fix

use amp selector
