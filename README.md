# ZAMA Backend

        `mutation {
          checkoutCreate(input: {
            lineItems: [{ variantId: "${variantId}", quantity: 1 }]
          }) {
            checkout {
               id
               webUrl
               lineItems(first: 5) {
                 edges {
                   node {
                     title
                     quantity
                   }
                 }
               }
            }
          }
        }
      `,

have to check if the checkout is available or not, if available then update line items, if not available, create a new checkout with the line item, this is the only way,go fuck yourself

for create checkout webhook

first fetch the data from db with token, if there are any checkout present with the same adminToken just leave, don't need anything

if there is no landingSite, ignore it

if there is landingSite then create a storeFrontCheckout

store the following data=> adminCheckoutToken, storefrontCheckoutToken, abandoned_checkout_url,

for update checkout webhook

if there are checkouts not available in the database with the adminCheckoutToken then leave

if it available, then update the storeFront checkout with the stored storeFrontToken and key

save for remove, everything is same except there are no webhooks, while fetching data for the checkout, use the storefront api or the admin api, both works(I guess have to verify)

# before that

just check if the abandoned checkout url and webUrl are same or not, if they are then its fine, do tha above or else try to create the token with that.
