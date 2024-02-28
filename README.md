# ZAMA Backend

sendDiscount Boolean @default(false)

use amp selector

product upsell email

while creating from frontend,
ask them to choose a product/variant
ask then to choose a list or give the list name
ask them if they want to add a discount

Then, call the api

api will receive the data - variantId, discount percentage and code

will create a checkout with variantId for every user in the list and repeat that for every user and then send it

create a discount with the data

the email will have the links of checkout email data and recommendation for the product data.
