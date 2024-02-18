import { Injectable } from '@nestjs/common';
import { StorefrontApiClient } from '@shopify/storefront-api-client';

@Injectable()
export class ShopifyGraphqlService {
  async getCheckoutDetails(
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

  async createCheckout(
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

  async replaceLineItemsFromCheckoutItems(
    shopifyStoreFront: StorefrontApiClient,
    checkoutId: string,
    lineItems: { variantId: string; quantity: number }[],
  ) {
    await shopifyStoreFront.request(
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

  async removeLineItemFromCheckout(
    shopifyStoreFront: StorefrontApiClient,
    checkoutId: string,
    lineItemId: string,
  ) {
    await shopifyStoreFront.request(
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

  async addLineItemsToCheckout(
    shopifyStoreFront: StorefrontApiClient,
    checkoutId: string,
    variantId: string,
  ) {
    return await shopifyStoreFront.request(
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

  async updateLineItemsInCheckout(
    shopifyStoreFront: StorefrontApiClient,
    checkoutId: string,
    lineItemId: string,
    variantId: string,
    quantity: number,
  ) {
    return await shopifyStoreFront.request(
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
}
