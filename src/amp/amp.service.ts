import { BadRequestException, Injectable } from '@nestjs/common';
import { CommonService } from 'src/common/common.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ShopifyGraphqlService } from 'src/shopify-graphql/shopify-graphql.service';
import {
  AddLineItemFromCheckoutDTO,
  AddLineItemFromUpsellDTO,
  ApplyDiscountCodeFromCheckoutDTO,
  ApplyDiscountCodeFromUpsellDTO,
  CollectReviewDTO,
  RemoveDiscountCodeFromCheckoutDTO,
  RemoveDiscountCodeFromUpsellDTO,
  RemoveLineItemFromCheckoutDTO,
  RemoveLineItemFromUpsellDTO,
  UpdateLineItemFromCheckoutDTO,
  UpdateLineItemFromUpsellDTO,
} from './dto';
import { SelectedProducts } from 'src/shopify/type';
import { Intent } from 'src/enum';
import { ReviewPlatformService } from 'src/review-platform/review-platform.service';

@Injectable()
export class AmpService {
  constructor(
    private shopifyGraphql: ShopifyGraphqlService,
    private common: CommonService,
    private prisma: PrismaService,
    private reviewService: ReviewPlatformService,
  ) {}

  // checkout email options
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
        orderPlaced: true,
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
        index: index + 1,
        title: product.title,
        body_html: product.body_html,
        variant: product.variants
          .filter(
            (variant) =>
              variant.id ===
              +products.find((savedProd) => +savedProd.productId === product.id)
                .variantId,
          )
          .map((variant) => ({
            id: btoa(`gid://shopify/ProductVariant/${variant.id}`),
            title: variant.title,
            price: currency.money_with_currency_format.replace(
              /{{[^{}]+}}/g,
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

      return [{ items: modifiedProducts, orderPlaced: checkout.orderPlaced }];
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
            discountCode: true,
            discountPercentage: true,
          },
        },
        orderPlaced: true,
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

      const graphqlCheckoutId = checkout.shopifyStorefrontCheckoutId;

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
            id: btoa(variant.lineItemId),
            index: index + 1,
            quantity: variant.quantity,
            title: variant.product.title,
            description: variant.product.description,
            images: [
              { src: variant.image.src, altText: variant.image.altText },
            ],
            productId: btoa(variant.product.id),
            variantId: btoa(variant.id),
            variantTitle: variant.title,
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
            variants: variant.product.variants.edges.map((variant, index) => ({
              variantIndex: index,
              vId: btoa(variant.node.id),
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
        showDiscountSection:
          !!checkout.shopifyStore.discountCode &&
          !!checkout.shopifyStore.discountPercentage,
        checkoutDiscountCode: checkout.shopifyStore.discountCode,
        checkoutDiscountPercentage: checkout.shopifyStore.discountPercentage,
        orderPlaced: checkout.orderPlaced,
      };

      return [{ ...modifiedCheckoutLineItemData }];
    } catch (err) {
      this.common.generateErrorResponse(err, 'Shopify');
    }
  }

  async addLineItemToCheckoutFromCheckoutEmail(
    data: AddLineItemFromCheckoutDTO,
  ) {
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
        },
      });

      const shopify = this.common.shopifyStoreFrontObject(
        checkout.shopifyStore.name,
        checkout.shopifyStore.storeFrontAccessToken,
      );

      const variantId = data.variantId;
      const checkoutId = checkout.shopifyStorefrontCheckoutId;

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

  async updateLineItemInCheckoutFromCheckoutEmail(
    data: UpdateLineItemFromCheckoutDTO,
  ) {
    try {
      const newQuantity =
        data.operation === '+'
          ? +data.quantity + 1
          : data.operation === '-'
          ? +data.quantity - 1
          : +data.quantity;

      if (newQuantity === 0) {
        const res = await this.removeLineItemFromCheckoutFromCheckoutEmail({
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
        },
      });

      const shopifyStoreFront = this.common.shopifyStoreFrontObject(
        checkout.shopifyStore.name,
        checkout.shopifyStore.storeFrontAccessToken,
      );

      const checkoutId = checkout.shopifyStorefrontCheckoutId;
      const variantId = data.variantId;
      const lineItemId = data.lineItemId;
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

  async removeLineItemFromCheckoutFromCheckoutEmail(
    data: RemoveLineItemFromCheckoutDTO,
  ) {
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
        },
      });

      const shopifyStoreFront = this.common.shopifyStoreFrontObject(
        checkout.shopifyStore.name,
        checkout.shopifyStore.storeFrontAccessToken,
      );

      const checkoutId = checkout.shopifyStorefrontCheckoutId;
      const lineItemId = data.lineItemId;

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

  async applyDiscountCodeFromCheckoutEmail(
    data: ApplyDiscountCodeFromCheckoutDTO,
  ) {
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

      const checkoutId = checkout.shopifyStorefrontCheckoutId;

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

  async removeDiscountCodeFromCheckoutEmail(
    data: RemoveDiscountCodeFromCheckoutDTO,
  ) {
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

      const checkoutId = checkout.shopifyStorefrontCheckoutId;

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

  // product upsell options

  async productRecommendationEmailData(upsellId: string) {
    const upsell = await this.prisma.productUpsell.findUnique({
      where: {
        id: upsellId,
      },
      select: {
        user: {
          select: {
            shopifyStore: {
              select: {
                accessToken: true,
                name: true,
                storeFrontAccessToken: true,
              },
            },
          },
        },
        productIds: true,
      },
    });

    if (!upsell) {
      throw new BadRequestException('Shop Not Found');
    }

    try {
      const shopifyStorefront = this.common.shopifyStoreFrontObject(
        upsell.user.shopifyStore.name,
        upsell.user.shopifyStore.storeFrontAccessToken,
      );

      const shopify = this.common.shopifyObject(
        upsell.user.shopifyStore.name,
        upsell.user.shopifyStore.accessToken,
      );

      const currency = await shopify.shop.get({
        fields: 'money_with_currency_format',
      });

      const productGlobalIds = (
        upsell.productIds as unknown as SelectedProducts
      ).map((product) => ({
        productId: btoa(`gid://shopify/Product/${product.productId}`),
        variantId: btoa(`gid://shopify/ProductVariant/${product.variantId}`),
      }));

      const relatedPromises = [];
      const complementaryPromises = [];

      for (const ids of productGlobalIds) {
        relatedPromises.push(
          this.shopifyGraphql.productRecommendations(
            shopifyStorefront,
            ids.productId,
            Intent.RELATED,
          ),
        );
        complementaryPromises.push(
          this.shopifyGraphql.productRecommendations(
            shopifyStorefront,
            ids.productId,
            Intent.COMPLEMENTARY,
          ),
        );
      }

      let relatedProducts = await Promise.all(relatedPromises);
      let complementaryProducts = await Promise.all(complementaryPromises);

      relatedProducts = Object.values(
        relatedProducts
          .map((item) => item.data.productRecommendations.slice(0, 2))
          .flat(1)
          .reduce((acc, item) => {
            if (acc[item.id]) {
              return acc;
            }
            acc[item.id] = item;
            return acc;
          }, {}),
      ).map((item: any, index) => {
        const variant = item.variants.edges[0].node;
        return {
          index: `related_${index}`,
          title: item.title,
          description: item.description,
          variant: {
            id: btoa(variant.id),
            title: variant.title,
            price: currency.money_with_currency_format.replace(
              /{{[^{}]+}}/g,
              variant.price.amount,
            ),
            compareAtPrice: variant.compareAtPrice
              ? currency.money_with_currency_format.replace(
                  /{{[^{}]+}}/g,
                  variant.compareAtPrice.amount,
                )
              : null,
          },
          images: [
            {
              src: variant.image.src,
              alt: variant.image.altText,
            },
          ],
          upsellId,
        };
      });

      complementaryProducts = Object.values(
        complementaryProducts
          .map((item) => item.data.productRecommendations.slice(0, 2))
          .flat(1)
          .reduce((acc, item) => {
            if (acc[item.id]) {
              return acc;
            }
            acc[item.id] = item;
            return acc;
          }, {}),
      ).map((item: any, index) => {
        const variant = item.variants.edges[0].node;
        return {
          index: `related_${index}`,
          title: item.title,
          description: item.description,
          variant: {
            id: btoa(variant.id),
            title: variant.title,
            price: currency.money_with_currency_format.replace(
              /{{[^{}]+}}/g,
              variant.price.amount,
            ),
            compareAtPrice: variant.compareAtPrice
              ? currency.money_with_currency_format.replace(
                  /{{[^{}]+}}/g,
                  variant.compareAtPrice.amount,
                )
              : null,
          },
          images: [
            {
              src: variant.image.src,
              alt: variant.image.altText,
            },
          ],
          upsellId,
        };
      });

      return [{ relatedProducts, complementaryProducts }];
    } catch (err) {
      this.common.generateErrorResponse(err, 'Shopify');
    }
  }

  async productUpsellEmailData(upsellId: string, checkoutId: string) {
    const upsell = await this.prisma.productUpsell.findUnique({
      where: {
        id: upsellId,
      },
      select: {
        user: {
          select: {
            shopifyStore: {
              select: {
                accessToken: true,
                name: true,
                storeFrontAccessToken: true,
                discountCode: true,
                discountPercentage: true,
              },
            },
          },
        },
      },
    });

    if (!upsell) {
      throw new BadRequestException('Shop Not Found');
    }

    try {
      const shopifyStoreFront = this.common.shopifyStoreFrontObject(
        upsell.user.shopifyStore.name,
        upsell.user.shopifyStore.storeFrontAccessToken,
      );
      const shopifyAdmin = this.common.shopifyObject(
        upsell.user.shopifyStore.name,
        upsell.user.shopifyStore.accessToken,
      );

      const graphqlCheckoutId = checkoutId;

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
            id: btoa(variant.lineItemId),
            index: index + 1,
            quantity: variant.quantity,
            title: variant.product.title,
            description: variant.product.description,
            images: [
              { src: variant.image.src, altText: variant.image.altText },
            ],
            productId: btoa(variant.product.id),
            variantId: btoa(variant.id),
            variantTitle: variant.title,
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
            variants: variant.product.variants.edges.map((variant, index) => ({
              variantIndex: index,
              vId: btoa(variant.node.id),
              title: variant.node.title,
            })),
          };
        }),
        checkoutId,
        upsellId,
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

    return { upsellId };
  }

  async addLineItemToCheckoutFromUpsellEmail(data: AddLineItemFromUpsellDTO) {
    try {
      const upsell = await this.prisma.productUpsell.findUnique({
        where: {
          id: data.upsellId,
        },
        select: {
          user: {
            select: {
              shopifyStore: {
                select: {
                  storeFrontAccessToken: true,
                  accessToken: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      const shopify = this.common.shopifyStoreFrontObject(
        upsell.user.shopifyStore.name,
        upsell.user.shopifyStore.storeFrontAccessToken,
      );

      const variantId = data.variantId;
      const checkoutId = data.checkoutId;

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

  async updateLineItemInCheckoutFromUpsellEmail(
    data: UpdateLineItemFromUpsellDTO,
  ) {
    try {
      const newQuantity =
        data.operation === '+'
          ? +data.quantity + 1
          : data.operation === '-'
          ? +data.quantity - 1
          : +data.quantity;

      if (newQuantity === 0) {
        const res = await this.removeLineItemFromCheckoutFromUpsellEmail({
          checkoutId: data.checkoutId,
          lineItemId: data.lineItemId,
          upsellId: data.upsellId,
        });
        return res;
      }

      const upsell = await this.prisma.productUpsell.findUnique({
        where: {
          id: data.upsellId,
        },
        select: {
          user: {
            select: {
              shopifyStore: {
                select: {
                  storeFrontAccessToken: true,
                  accessToken: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      const shopifyStoreFront = this.common.shopifyStoreFrontObject(
        upsell.user.shopifyStore.name,
        upsell.user.shopifyStore.storeFrontAccessToken,
      );

      const checkoutId = data.checkoutId;
      const variantId = data.variantId;
      const lineItemId = data.lineItemId;
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

  async removeLineItemFromCheckoutFromUpsellEmail(
    data: RemoveLineItemFromUpsellDTO,
  ) {
    try {
      const upsell = await this.prisma.productUpsell.findUnique({
        where: {
          id: data.upsellId,
        },
        select: {
          user: {
            select: {
              shopifyStore: {
                select: {
                  storeFrontAccessToken: true,
                  accessToken: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      const shopifyStoreFront = this.common.shopifyStoreFrontObject(
        upsell.user.shopifyStore.name,
        upsell.user.shopifyStore.storeFrontAccessToken,
      );

      const checkoutId = data.checkoutId;
      const lineItemId = data.lineItemId;

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

  async applyDiscountCodeFromUpsellEmail(data: ApplyDiscountCodeFromUpsellDTO) {
    try {
      const upsell = await this.prisma.productUpsell.findUnique({
        where: {
          id: data.upsellId,
        },
        select: {
          user: {
            select: {
              shopifyStore: {
                select: {
                  storeFrontAccessToken: true,
                  accessToken: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      const shopifyStoreFront = this.common.shopifyStoreFrontObject(
        upsell.user.shopifyStore.name,
        upsell.user.shopifyStore.storeFrontAccessToken,
      );

      const checkoutId = data.checkoutId;

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

  async removeDiscountCodeFromUpsellEmail(
    data: RemoveDiscountCodeFromUpsellDTO,
  ) {
    try {
      const upsell = await this.prisma.productUpsell.findUnique({
        where: {
          id: data.upsellId,
        },
        select: {
          user: {
            select: {
              shopifyStore: {
                select: {
                  storeFrontAccessToken: true,
                  accessToken: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      const shopifyStoreFront = this.common.shopifyStoreFrontObject(
        upsell.user.shopifyStore.name,
        upsell.user.shopifyStore.storeFrontAccessToken,
      );

      const checkoutId = data.checkoutId;

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

  // review options

  async reviewEmailData(orderId: number) {
    const checkout = await this.prisma.checkout.findFirst({
      where: {
        shopifyOrderId: orderId,
      },
      select: {
        shopifyStore: {
          select: {
            accessToken: true,
            name: true,
          },
        },
        reviewSubmittedFor: true,
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

      const orderDetails = await shopify.order.get(orderId);
      const productPromises = orderDetails.line_items.map((lineItem) => {
        return shopify.product.get(lineItem.product_id);
      });

      const reviewSubmittedFor = checkout.reviewSubmittedFor.map(Number);

      const products = await Promise.all(productPromises);
      const modifiedProducts = products.map((product) => ({
        productId: product.id,
        name: product.title,
        description: product.body_html,
        img: product.image.src,
        imgAlt: product.image.alt,
        customerName: `${orderDetails.customer.first_name} ${orderDetails.customer.last_name}`,
        customerEmail: orderDetails.contact_email,
        reviewSubmitted: reviewSubmittedFor.includes(product.id),
      }));
      return [
        { items: modifiedProducts, orderCreatedAt: orderDetails.created_at },
      ];
    } catch (err) {
      this.common.generateErrorResponse(err, 'Shopify');
    }
  }

  async collectReview(orderId: number, data: CollectReviewDTO) {
    const checkout = await this.prisma.checkout.findFirst({
      where: {
        shopifyOrderId: orderId,
      },
      select: {
        shopifyStore: {
          select: {
            name: true,
            user: {
              select: {
                reviewPlatforms: {
                  where: {
                    enabled: true,
                  },
                  select: {
                    accessToken: true,
                    name: true,
                  },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!checkout) {
      throw new BadRequestException('Shop Not Found');
    }
    try {
      const ratingArr = data.rating.split('-');
      const payload = {
        ...data,
        rating: Number(ratingArr[ratingArr.length - 1]),
        productId: Number(data.productId),
      };

      const reviewPlatform = this.reviewService.createReviewPlatformService(
        checkout.shopifyStore.user.reviewPlatforms[0].name,
      );

      await reviewPlatform.createReview({
        productId: payload.productId,
        reviewerName: payload.customerName,
        reviewerEmail: payload.customerEmail,
        platform: 'shopify',
        rating: payload.rating,
        reviewTitle: payload.reviewTitle,
        reviewDescription: payload.reviewDescription,
        accessToken: checkout.shopifyStore.user.reviewPlatforms[0].accessToken,
        shopName: checkout.shopifyStore.name,
        productName: payload.productName,
      });

      await this.prisma.checkout.update({
        where: {
          shopifyOrderId: orderId,
        },
        data: {
          reviewSubmittedFor: {
            push: payload.productId,
          },
        },
      });

      // Todo: add  the product is the the database if review is already collected
      return { data: 'Added review for the product successfully' };
    } catch (err) {
      this.common.generateErrorResponse(err, 'Review');
    }
  }
}
