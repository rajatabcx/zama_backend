import { BadRequestException, Injectable } from '@nestjs/common';
import { StorefrontApiClient } from '@shopify/storefront-api-client';
import { CommonService } from 'src/common/common.service';

@Injectable()
export class CheckoutService {
  constructor(private common: CommonService) {}

  async createStoreFrontCheckoutWithLineItems(
    shopify: StorefrontApiClient,
    lineItems: { variantId: string; quantity: number }[],
  ) {
    // TODO: add presentmentCurrencyCode while creating the checkout
    const { data: resData, errors } = await shopify.request(
      `mutation {
        checkoutCreate(input:{
            lineItems: [${lineItems
              .map(
                (item) =>
                  `{ variantId: "${item.variantId}", quantity: ${item.quantity} }`,
              )
              .join(', ')}]
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
      `,
    );
    if (errors || resData.checkoutLineItemsAdd?.checkoutUserErrors.length) {
      console.log(errors.graphQLErrors);
      throw new BadRequestException(
        errors?.message ||
          resData.checkoutLineItemsAdd.checkoutUserErrors[0].message,
      );
    }

    return {
      data: {
        id: resData.checkoutCreate.checkout.id,
        webUrl: resData.checkoutCreate.checkout.webUrl,
      },
      message: 'Storefront checkout created successfully',
      statusCode: 200,
    };
  }

  async addLineItemToStoreFrontCheckout(
    shopify: StorefrontApiClient,
    checkoutId: string,
    variantId: string,
  ) {
    const { data: resData, errors } = await shopify.request(
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
    if (errors || resData.checkoutLineItemsAdd?.checkoutUserErrors.length) {
      console.log(errors.graphQLErrors);
      throw new BadRequestException(
        errors?.message ||
          resData.checkoutLineItemsAdd.checkoutUserErrors[0].message,
      );
    }

    return {
      data: {},
      message: 'Item added to checkout successfully',
      statusCode: 200,
    };
  }

  async replaceStoreFrontCheckoutLineItems(
    shopify: StorefrontApiClient,
    checkoutId: string,
    lineItems: { variantId: string; quantity: number }[],
  ) {
    const { errors } = await shopify.request(
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
    if (errors) {
      console.log(errors.graphQLErrors);
      throw new BadRequestException(errors?.message);
    }

    return {
      data: {},
      message: 'Item removed from checkout successfully',
      statusCode: 200,
    };
  }
}
