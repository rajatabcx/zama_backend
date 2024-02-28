import { BadRequestException, Injectable } from '@nestjs/common';
import { CommonService } from 'src/common/common.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ShopifyGraphqlService } from 'src/shopify-graphql/shopify-graphql.service';
import {
  AddLineItemDTO,
  RemoveDiscountCodeDTO,
  ApplyDiscountCodeDTO,
  RemoveLineItemDTO,
  UpdateLineItemDTO,
} from './dto';
import { SelectedProducts } from 'src/shopify/type';

@Injectable()
export class AmpService {
  constructor(
    private shopifyGraphql: ShopifyGraphqlService,
    private common: CommonService,
    private prisma: PrismaService,
  ) {}

  async bestSellerEmailData(checkoutId: string) {
    const checkout = await this.prisma.checkout.findUnique({
      where: {
        id: checkoutId,
      },
      select: {
        shopifyStore: {
          select: {
            selectedProductIds: true,
            accessToken: true,
            name: true,
          },
        },
      },
    });

    if (!checkout) {
      throw new BadRequestException('Shop Not Found');
    }

    try {
      const shopify = this.common.shopifyObject(
        checkout.shopifyStore.name,
        checkout.shopifyStore.accessToken,
      );

      const products = checkout.shopifyStore
        .selectedProductIds as SelectedProducts;

      const currency = await shopify.shop.get({
        fields: 'money_with_currency_format',
      });
      const productDetailedPromises = products.map((product) =>
        shopify.product.get(+product.productId),
      );

      // TODO: use products api rather than this
      const allProductDetails = await Promise.all(productDetailedPromises);

      const modifiedProducts = allProductDetails.map((product, index) => ({
        id: product.id,
        index: index + 1,
        title: product.title,
        body_html: product.body_html,
        vendor: product.vendor,
        variant: product.variants
          .filter(
            (variant) =>
              variant.id ===
              +products.find((savedProd) => +savedProd.productId === product.id)
                .variantId,
          )
          .map((variant) => ({
            id: variant.id,
            product_id: variant.product_id,
            title: variant.title,
            price: currency.money_with_currency_format.replace(
              '{{amount}}',
              variant.price,
            ),
            compare_at_price: variant.compare_at_price
              ? currency.money_with_currency_format.replace(
                  '{{amount}}',
                  variant.compare_at_price,
                )
              : null,
          }))[0],
        images: product.images.map((image) => ({
          id: image.id,
          alt: image.alt,
          src: image.src,
        })),
        checkoutId,
      }));

      return { items: modifiedProducts };
    } catch (err) {
      this.common.generateErrorResponse(err, 'Shopify');
    }
  }

  async productRecommendationEmailData(checkoutId: string, productId: string) {
    const checkout = await this.prisma.checkout.findUnique({
      where: {
        id: checkoutId,
      },
      select: {
        shopifyStore: {
          select: {
            selectedProductIds: true,
            accessToken: true,
            name: true,
            storeFrontAccessToken: true,
          },
        },
      },
    });

    if (!checkout) {
      throw new BadRequestException('Shop Not Found');
    }

    try {
      const shopifyStorefront = this.common.shopifyStoreFrontObject(
        checkout.shopifyStore.name,
        checkout.shopifyStore.storeFrontAccessToken,
      );

      const productGlobalId = btoa(`gid://shopify/Product/${productId}`);

      const { data: alsoLike } =
        await this.shopifyGraphql.productRecommendations(
          shopifyStorefront,
          productGlobalId,
        );

      return { items: [] };
    } catch (err) {
      this.common.generateErrorResponse(err, 'Shopify');
    }
  }

  async checkoutEmailData(checkoutId: string) {
    const checkout = await this.prisma.checkout.findUnique({
      where: {
        id: checkoutId,
      },
      select: {
        shopifyStore: {
          select: {
            accessToken: true,
            name: true,
            storeFrontAccessToken: true,
          },
        },
        orderFulFilled: true,
        shopifyStoreFrontCheckoutToken: true,
        shopifyAdminCheckoutToken: true,
        shopifyStorefrontCheckoutId: true,
        shopifyAbandonedCheckoutURL: true,
      },
    });

    if (!checkout) {
      throw new BadRequestException('Shop Not Found');
    }

    try {
      const shopifyStoreFront = this.common.shopifyStoreFrontObject(
        checkout.shopifyStore.name,
        checkout.shopifyStore.storeFrontAccessToken,
      );
      const shopifyAdmin = this.common.shopifyObject(
        checkout.shopifyStore.name,
        checkout.shopifyStore.accessToken,
      );

      const graphqlCheckoutId = btoa(checkout.shopifyStorefrontCheckoutId);

      const shopData = await shopifyAdmin.shop.get({
        fields: 'money_format,money_with_currency_format',
      });

      const { data: resData } = await this.shopifyGraphql.getCheckoutDetails(
        shopifyStoreFront,
        graphqlCheckoutId,
      );

      const checkoutDetails = resData.node;

      const variantLineItems = checkoutDetails.lineItems.edges.map(
        (lineItemEdge) => ({
          ...lineItemEdge.node.variant,
          lineItemId: lineItemEdge.node.id,
          quantity: lineItemEdge.node.quantity,
        }),
      );

      const modifiedCheckoutLineItemData = {
        items: variantLineItems.map((variant: any, index: number) => {
          return {
            id: variant.lineItemId,
            index: index + 1,
            quantity: variant.quantity,
            title: variant.product.title,
            description: variant.product.description,
            images: [
              { src: variant.image.src, altText: variant.image.altText },
            ],
            productId: variant.product.id,
            variantId: variant.id,
            price: shopData.money_format.replace(
              '{{amount}}',
              (variant.price.amount * variant.quantity).toFixed(2),
            ),
            comparePrice: variant.compareAtPrice
              ? shopData.money_format.replace(
                  '{{amount}}',
                  (variant.compareAtPrice.amount * variant.quantity).toFixed(2),
                )
              : null,
            variants: variant.product.variants.edges.map((variant) => ({
              id: variant.node.id,
              title: variant.node.title,
            })),
          };
        }),
        checkoutUrl: checkout.shopifyAbandonedCheckoutURL,
        checkoutId,
        taxIncluded: checkoutDetails.taxIncluded,
        discountCodes: checkoutDetails.discountApplications.edges.map(
          (discountObj) => ({ code: discountObj.node.code }),
        ),
        discountAmount: shopData.money_with_currency_format.replace(
          '{{amount}}',
          (
            checkoutDetails.lineItemsSubtotalPrice.amount -
            checkoutDetails.subtotalPrice.amount
          ).toFixed(2),
        ),
        subtotal: shopData.money_format.replace(
          '{{amount}}',
          checkoutDetails.lineItemsSubtotalPrice.amount,
        ),
        taxes: shopData.money_format.replace(
          '{{amount}}',
          checkoutDetails.totalTax.amount,
        ),
        total: shopData.money_with_currency_format.replace(
          '{{amount}}',
          checkoutDetails.totalPrice.amount,
        ),
      };

      return [{ ...modifiedCheckoutLineItemData }];
    } catch (err) {
      this.common.generateErrorResponse(err, 'Shopify');
    }
  }

  async addLineItemToCheckout(data: AddLineItemDTO) {
    try {
      const checkout = await this.prisma.checkout.findUnique({
        where: {
          id: data.checkoutId,
        },
        select: {
          shopifyStore: {
            select: {
              storeFrontAccessToken: true,
              accessToken: true,
              name: true,
            },
          },
          shopifyAdminCheckoutToken: true,
          shopifyStorefrontCheckoutId: true,
          shopifyAbandonedCheckoutURL: true,
          shopifyStoreFrontCheckoutToken: true,
        },
      });

      const shopify = this.common.shopifyStoreFrontObject(
        checkout.shopifyStore.name,
        checkout.shopifyStore.storeFrontAccessToken,
      );

      const variantId = btoa(`gid://shopify/ProductVariant/${data.variantId}`);
      const checkoutId = btoa(checkout.shopifyStorefrontCheckoutId);

      await this.shopifyGraphql.addLineItemsToCheckout(
        shopify,
        checkoutId,
        variantId,
      );
      return { data: 'Added line item to checkout successfully' };
    } catch (err) {
      this.common.generateErrorResponse(err, 'Checkout');
    }
  }

  async updateLineItemInCheckout(data: UpdateLineItemDTO) {
    try {
      const newQuantity =
        data.operation === '+'
          ? +data.quantity + 1
          : data.operation === '-'
          ? +data.quantity - 1
          : +data.quantity;

      if (newQuantity === 0) {
        const res = await this.removeLineItemFromCheckout({
          checkoutId: data.checkoutId,
          lineItemId: data.lineItemId,
        });
        return res;
      }

      const checkout = await this.prisma.checkout.findUnique({
        where: {
          id: data.checkoutId,
        },
        select: {
          shopifyStore: {
            select: {
              storeFrontAccessToken: true,
              accessToken: true,
              name: true,
            },
          },
          shopifyAdminCheckoutToken: true,
          shopifyStorefrontCheckoutId: true,
          shopifyAbandonedCheckoutURL: true,
          shopifyStoreFrontCheckoutToken: true,
        },
      });

      const shopifyStoreFront = this.common.shopifyStoreFrontObject(
        checkout.shopifyStore.name,
        checkout.shopifyStore.storeFrontAccessToken,
      );

      const checkoutId = btoa(checkout.shopifyStorefrontCheckoutId);
      const variantId = btoa(data.variantId);
      const lineItemId = btoa(data.lineItemId);

      await this.shopifyGraphql.updateLineItemsInCheckout(
        shopifyStoreFront,
        checkoutId,
        lineItemId,
        variantId,
        newQuantity,
      );

      return { data: 'Updated line item from checkout successfully' };
    } catch (err) {
      this.common.generateErrorResponse(err, 'Checkout');
    }
  }

  async removeLineItemFromCheckout(data: RemoveLineItemDTO) {
    try {
      const checkout = await this.prisma.checkout.findUnique({
        where: {
          id: data.checkoutId,
        },
        select: {
          shopifyStore: {
            select: {
              storeFrontAccessToken: true,
              accessToken: true,
              name: true,
            },
          },
          shopifyAdminCheckoutToken: true,
          shopifyStorefrontCheckoutId: true,
          shopifyAbandonedCheckoutURL: true,
          shopifyStoreFrontCheckoutToken: true,
        },
      });

      const shopifyStoreFront = this.common.shopifyStoreFrontObject(
        checkout.shopifyStore.name,
        checkout.shopifyStore.storeFrontAccessToken,
      );

      const checkoutId = btoa(checkout.shopifyStorefrontCheckoutId);
      const lineItemId = btoa(data.lineItemId);

      await this.shopifyGraphql.removeLineItemFromCheckout(
        shopifyStoreFront,
        checkoutId,
        lineItemId,
      );

      return { data: 'Removed line item from checkout successfully' };
    } catch (err) {
      this.common.generateErrorResponse(err, 'Checkout');
    }
  }

  async applyDiscountCode(data: ApplyDiscountCodeDTO) {
    try {
      const checkout = await this.prisma.checkout.findUnique({
        where: {
          id: data.checkoutId,
        },
        select: {
          shopifyStore: {
            select: {
              storeFrontAccessToken: true,
              accessToken: true,
              name: true,
            },
          },
          shopifyStorefrontCheckoutId: true,
        },
      });

      const shopifyStoreFront = this.common.shopifyStoreFrontObject(
        checkout.shopifyStore.name,
        checkout.shopifyStore.storeFrontAccessToken,
      );

      const checkoutId = btoa(checkout.shopifyStorefrontCheckoutId);

      const { data: resData } = await this.shopifyGraphql.applyDiscountCode(
        shopifyStoreFront,
        checkoutId,
        data.discountCode,
      );

      if (resData.checkoutDiscountCodeApplyV2.checkoutUserErrors.length) {
        throw new Error(
          resData.checkoutDiscountCodeApplyV2.checkoutUserErrors[0].message,
        );
      }

      return { data: 'Added discount code to checkout checkout successfully' };
    } catch (err) {
      this.common.generateErrorResponse(err, 'Checkout');
    }
  }

  async removeDiscountCode(data: RemoveDiscountCodeDTO) {
    try {
      const checkout = await this.prisma.checkout.findUnique({
        where: {
          id: data.checkoutId,
        },
        select: {
          shopifyStore: {
            select: {
              storeFrontAccessToken: true,
              accessToken: true,
              name: true,
            },
          },
          shopifyStorefrontCheckoutId: true,
        },
      });

      const shopifyStoreFront = this.common.shopifyStoreFrontObject(
        checkout.shopifyStore.name,
        checkout.shopifyStore.storeFrontAccessToken,
      );

      const checkoutId = btoa(checkout.shopifyStorefrontCheckoutId);

      await this.shopifyGraphql.removeDiscountCode(
        shopifyStoreFront,
        checkoutId,
      );

      return {
        data: 'Removed discount code to checkout checkout successfully',
      };
    } catch (err) {
      this.common.generateErrorResponse(err, 'Checkout');
    }
  }
}
