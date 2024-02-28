import { Injectable } from '@nestjs/common';
import { StorefrontApiClient } from '@shopify/storefront-api-client';

@Injectable()
export class ShopifyGraphqlService {
  getCheckoutDetails(
    shopifyStoreFront: StorefrontApiClient,
    checkoutId: string,
  ) {
    return shopifyStoreFront.request(
      ` 
          query{
            node(id: "${btoa(checkoutId)}") {
            id
            ... on Checkout {
                id
                currencyCode
                discountApplications(first: 10){
                  edges{
                    node{
                      ... on DiscountCodeApplication{
                        allocationMethod
                        applicable
                        targetType
                        targetSelection
                        code
                        value {
                          ... on PricingPercentageValue{
                            percentage
                          }
                        }
                      }
                    }
                  }
                }
                lineItemsSubtotalPrice{
                  amount
                  currencyCode
                }
                subtotalPrice{
                  amount
                  currencyCode
                }
                totalPrice
                {
                  amount
                  currencyCode
                }
                totalTax{
                  amount
                  currencyCode
                }
    
                taxesIncluded
                lineItems(first: 250) {
                  edges {
                    node {
                      id
                      quantity
                      variant {
                        id
                        title
                        price {
                          amount
                          currencyCode
                        }
                        compareAtPrice {
                          amount
                          currencyCode
                        }
                        image {
                          src
                          altText
                        }
                        product{
                          id
                          title
                          description
                          variants(first: 250){
                            edges {
                              node {
                                id
                                title
                              }
                            }
                          }
                        }
                      }
                  }
                  }
                  }
                order{
                  id
                }
    
              }
            }
          }
          
          `,
    );
  }

  createCheckout(
    shopifyStoreFront: StorefrontApiClient,
    lineItems: { variantId: string; quantity: number }[],
  ) {
    return shopifyStoreFront.request(`mutation {
        checkoutCreate(input:{
            lineItems: [${lineItems
              .map(
                (item) =>
                  `{ variantId: "${item.variantId}", quantity: ${item.quantity} }`,
              )
              .join(', ')}],
        }
          ) {
            checkout{
              id
              webUrl
            }
            checkoutUserErrors{
              code
              field
              message
            }
          }
        }
      `);
  }

  checkoutEmailUpdate(
    shopifyStoreFront: StorefrontApiClient,
    checkoutId: string,
    email: string,
  ) {
    return shopifyStoreFront.request(`mutation {
      checkoutEmailUpdateV2(
        checkoutId: "${checkoutId}",
        email: "${email}"
      ) {
            checkout{
              id
              webUrl
            }
            checkoutUserErrors{
              code
              field
              message
            }
          }
        }
      `);
  }

  replaceLineItemsFromCheckoutItems(
    shopifyStoreFront: StorefrontApiClient,
    checkoutId: string,
    lineItems: { variantId: string; quantity: number }[],
  ) {
    return shopifyStoreFront.request(
      `mutation {
          checkoutLineItemsReplace(
              checkoutId: "${checkoutId}",
              lineItems: [${lineItems
                .map(
                  (item) =>
                    `{ variantId: "${item.variantId}", quantity: ${item.quantity} }`,
                )
                .join(', ')}]
            ) {
              checkout{
                id
              }
              userErrors {
                field
                message
              }
            }
          }
        `,
    );
  }

  removeLineItemFromCheckout(
    shopifyStoreFront: StorefrontApiClient,
    checkoutId: string,
    lineItemId: string,
  ) {
    return shopifyStoreFront.request(
      `mutation {
        checkoutLineItemsRemove(
              checkoutId: "${checkoutId}",
              lineItemIds: ["${lineItemId}"]
            ) {
              checkout{
                id
              }
              userErrors {
                field
                message
              }
            }
          }
        `,
    );
  }

  addLineItemsToCheckout(
    shopifyStoreFront: StorefrontApiClient,
    checkoutId: string,
    variantId: string,
  ) {
    return shopifyStoreFront.request(
      `mutation {
          checkoutLineItemsAdd(
            checkoutId: "${checkoutId}",
            lineItems: [{variantId:"${variantId}",quantity:1}]
            ) {
              checkout{
                id
                webUrl
              }
              checkoutUserErrors{
                code
                field
                message
              }
            }
          }
        `,
    );
  }

  updateLineItemsInCheckout(
    shopifyStoreFront: StorefrontApiClient,
    checkoutId: string,
    lineItemId: string,
    variantId: string,
    quantity: number,
  ) {
    return shopifyStoreFront.request(
      `mutation {
        checkoutLineItemsUpdate(
          checkoutId: "${checkoutId}",
              lineItems: [{variantId:"${variantId}",quantity: ${quantity}, id:"${lineItemId}"}]
              ) {
                checkout{
                  id
                  webUrl
                }
                checkoutUserErrors{
                  code
                  field
                  message
                }
              }
            }
          `,
    );
  }

  applyDiscountCode(
    shopifyStoreFront: StorefrontApiClient,
    checkoutId: string,
    discountCode: string,
  ) {
    return shopifyStoreFront.request(
      `mutation {
        checkoutDiscountCodeApplyV2(
              checkoutId: "${checkoutId}",
              discountCode: "${discountCode}"
            ) {
              checkout{
                id
              }
              checkoutUserErrors  {
                field
                message
              }
            }
          }
        `,
    );
  }

  removeDiscountCode(
    shopifyStoreFront: StorefrontApiClient,
    checkoutId: string,
  ) {
    return shopifyStoreFront.request(
      `mutation {
        checkoutDiscountCodeRemove(
              checkoutId: "${checkoutId}"
            ) {
              checkout{
                id
              }
              checkoutUserErrors  {
                field
                message
              }
            }
          }
        `,
    );
  }

  productRecommendations(
    shopifyStoreFront: StorefrontApiClient,
    productId: string,
  ) {
    return shopifyStoreFront.request(`query{
      productRecommendations(productId: "${productId}",intent: RELATED) {
          title
          description
          variants(first: 250){
            edges {
              node {
                id
                title
                price{
                  amount
                  currencyCode
                }
                image {
                  src
                  altText
                }
              }
            }
          }
      }
    }`);
  }
}
