import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { CommonService } from 'src/common/common.service';
import {
  AddLineItemDTO,
  DiscountPercentageDTO,
  InstallShopifyDTO,
  ProductDTO,
  RemoveLineItemDTO,
  UpdateLineItemDTO,
} from './dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { SelectedProducts } from './type';
import { CheckoutService } from 'src/checkout/checkout.service';

@Injectable()
export class ShopifyService {
  constructor(
    private config: ConfigService,
    private common: CommonService,
    private http: HttpService,
    private prisma: PrismaService,
    private checkout: CheckoutService,
  ) {}

  async shopify(data: InstallShopifyDTO, req: Request, res: Response) {
    try {
      const modifiedShopName = `${data.shopName}.myshopify.com`;
      const shopState = this.common.nounce();
      const redirectURL = `${this.config.get(
        'FRONTEND_URL',
      )}/shopify/auth/callback`;

      const queryParams = {
        client_id: this.config.get('SHOPIFY_API_KEY'),
        scope: this.common.shopifyScopes,
        state: shopState,
        redirect_uri: redirectURL,
      };
      const shopifyInstallURL = `https://${modifiedShopName}/admin/oauth/authorize?${this.common.serialize(
        queryParams,
      )}`;

      res.cookie('state', shopState, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 60 * 60 * 24 * 60 * 1000,
      });
      return {
        data: { shopifyInstallURL },
        statusCode: 200,
        message: 'Signed out successfully',
      };
    } catch (err) {
      this.common.generateErrorResponse(err, 'Shopify');
    }
  }

  async shopifyCallback(
    hmac: string,
    code: string,
    shop: string,
    state: string,
    cookieState: string,
    userId: string,
  ) {
    try {
      if (state !== cookieState) {
        throw new BadRequestException('request origin cannot be found');
      }

      const accessTokenData = {
        client_id: this.config.get('SHOPIFY_API_KEY'),
        client_secret: this.config.get('SHOPIFY_API_SECRET_KEY'),
        code,
      };

      const { data } = await this.shopifyAccessToken(shop, accessTokenData);
      await this.prisma.shopifyStore.create({
        data: {
          name: shop,
          accessToken: data.access_token,
          scope: data.scope,
          userId,
        },
      });

      return { data: {}, message: 'SUCCESS', statusCode: 200 };
    } catch (err) {
      this.common.generateErrorResponse(err, 'Shopify');
    }
  }

  shopifyAccessToken(
    shop: string,
    data: { client_id: string; client_secret: string; code: string },
  ) {
    return firstValueFrom(
      this.http.post<{ access_token: string; scope: string }>(
        `https://${shop}/admin/oauth/access_token`,
        data,
      ),
    );
  }

  async products(userId: string, limit: string, page_info: string) {
    try {
      const params = page_info ? { limit, page_info } : { limit };
      const shopifyObj = await this.common.shopifyObjectForShop(userId);

      if (!shopifyObj.connected)
        return {
          data: { connected: false },
          message: 'SUCCESS',
          statusCode: 200,
        };
      const { shopify, shopifyStore } = shopifyObj;
      const products = await shopify.product.list(params);
      const currency = await shopify.shop.get({
        fields: 'money_with_currency_format',
      });

      return {
        data: {
          products,
          selectedProducts: shopifyStore.selectedProductIds.map(
            (item) => item.productId,
          ),
          currency,
          nextPageParams: products.nextPageParameters || null,
          prevPageParams: products.previousPageParameters || null,
        },
        message: 'SUCCESS',
        statusCode: 200,
      };
    } catch (err) {
      this.common.generateErrorResponse(err, 'Shopify Product');
    }
  }

  async addProduct(userId: string, data: ProductDTO) {
    try {
      const shopifyObj = await this.common.shopifyObjectForShop(userId);

      if (!shopifyObj.connected)
        return {
          data: { connected: false },
          message: 'SUCCESS',
          statusCode: 200,
        };
      const { shopifyStore } = shopifyObj;

      if (shopifyStore.selectedProductIds.length === 5) {
        throw new BadRequestException('No more than 5 products are allowed');
      }

      const json = data as unknown as Prisma.JsonObject;

      await this.prisma.shopifyStore.update({
        where: {
          userId,
        },
        data: {
          selectedProductIds: {
            push: json,
          },
        },
      });
      return {
        data: {},
        message: 'Product added successfully',
        statusCode: 200,
      };
    } catch (err) {
      this.common.generateErrorResponse(err, 'Shopify Product');
    }
  }

  async discount(userId: string) {
    try {
      const shopifyObj = await this.common.shopifyObjectForShop(userId);

      if (!shopifyObj.connected)
        return {
          data: { connected: false },
          message: 'SUCCESS',
          statusCode: 200,
        };
      const { shopify, shopifyStore } = shopifyObj;

      if (!shopifyStore.givingDiscount) {
        return {
          data: { givingDiscount: false },
          message: 'SUCCESS',
          statusCode: 200,
        };
      }

      const discount = await shopify.priceRule.get(shopifyStore.priceRuleId);

      return {
        data: {
          givingDiscount: true,
          percentage: -Number(discount.value),
          title: discount.title,
        },
        message: 'SUCCESS',
        statusCode: 200,
      };
    } catch (err) {
      this.common.generateErrorResponse(err, 'Shopify Discount');
    }
  }

  async createDiscount(userId: string, data: DiscountPercentageDTO) {
    try {
      const shopifyObj = await this.common.shopifyObjectForShop(userId);

      if (!shopifyObj.connected)
        return {
          data: { connected: false },
          message: 'SUCCESS',
          statusCode: 200,
        };
      const { shopify } = shopifyObj;

      const priceRule = await shopify.priceRule.create({
        title: 'ZAMA_SPECIAL',
        value_type: 'percentage',
        value: `-${data.discountPercentage}`,
        customer_selection: 'all',
        target_type: 'line_item',
        target_selection: 'all',
        allocation_method: 'across',
        once_per_customer: true,
        starts_at: new Date().toISOString(),
      });
      const discount = await shopify.discountCode.create(priceRule.id, {
        code: 'ZAMA_SPECIAL',
      });
      await this.prisma.shopifyStore.update({
        where: {
          userId,
        },
        data: {
          discountId: BigInt(discount.id),
          priceRuleId: BigInt(priceRule.id),
          givingDiscount: true,
        },
      });

      return {
        data: {},
        message: `Discount Code Created Successfully`,
        statusCode: 201,
      };
    } catch (err) {
      this.common.generateErrorResponse(err, 'Shopify Discount');
    }
  }

  async updateDiscount(userId: string, data: DiscountPercentageDTO) {
    try {
      const shopifyObj = await this.common.shopifyObjectForShop(userId);

      if (!shopifyObj.connected)
        return {
          data: { connected: false },
          message: 'SUCCESS',
          statusCode: 200,
        };
      const { shopify, shopifyStore } = shopifyObj;
      await shopify.priceRule.update(shopifyStore.priceRuleId, {
        value: `-${data.discountPercentage}`,
      });
      return { data: {}, message: 'SUCCESS', statusCode: 200 };
    } catch (err) {
      this.common.generateErrorResponse(err, 'Shopify Discount');
    }
  }

  async removeDiscount(userId: string) {
    try {
      const shopifyObj = await this.common.shopifyObjectForShop(userId);

      if (!shopifyObj.connected)
        return {
          data: { connected: false },
          message: 'SUCCESS',
          statusCode: 200,
        };
      const { shopify, shopifyStore } = shopifyObj;

      await shopify.discountCode.delete(
        shopifyStore.priceRuleId,
        shopifyStore.discountId,
      );
      await shopify.priceRule.delete(shopifyStore.priceRuleId);

      await this.prisma.shopifyStore.update({
        where: {
          userId,
        },
        data: {
          givingDiscount: false,
          discountId: null,
          priceRuleId: null,
        },
      });
    } catch (err) {
      this.common.generateErrorResponse(err, 'Shopify Discount');
    }
  }

  async addStoreFrontApiKey(userId: string, data) {
    try {
      await this.prisma.shopifyStore.update({
        where: {
          userId,
        },
        data: {
          storeFrontAccessToken: data.storeFrontAccessToken,
        },
      });

      return {
        data: {},
        message: `Storefront access token added Successfully`,
        statusCode: 201,
      };
    } catch (err) {
      this.common.generateErrorResponse(err, 'Store front access token');
    }
  }

  async updateStoreFrontApiKey(userId: string, data) {
    try {
      await this.prisma.shopifyStore.update({
        where: {
          userId,
        },
        data: {
          storeFrontAccessToken: data.storeFrontAccessToken,
        },
      });

      return {
        data: {},
        message: `Storefront access token updated Successfully`,
        statusCode: 201,
      };
    } catch (err) {
      this.common.generateErrorResponse(err, 'Storefront access token');
    }
  }

  async checkConnection(userId: string) {
    try {
      const shopifyObj = await this.common.shopifyObjectForShop(userId);
      return {
        data: { connected: shopifyObj.connected },
        statusCode: 200,
        message: 'SUCCESS',
      };
    } catch (err) {
      this.common.generateErrorResponse(err, 'Shopify Connection');
    }
  }

  async bestSellerEmailData(checkoutId: string) {
    const checkout = await this.prisma.checkout.findUnique({
      where: {
        id: checkoutId,
      },
      select: {
        ShopifyStore: {
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
        checkout.ShopifyStore.name,
        checkout.ShopifyStore.accessToken,
      );

      const products = checkout.ShopifyStore
        .selectedProductIds as SelectedProducts;

      const currency = await shopify.shop.get({
        fields: 'money_with_currency_format',
      });
      const productDetailedPromises = products.map((product) =>
        shopify.product.get(+product.productId),
      );

      const allProductDetails = await Promise.all(productDetailedPromises);

      const modifiedProducts = allProductDetails.map((product) => ({
        id: product.id,
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

  async checkoutEmailData(checkoutId: string) {
    const checkout = await this.prisma.checkout.findUnique({
      where: {
        id: checkoutId,
      },
      select: {
        ShopifyStore: {
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
        checkout.ShopifyStore.name,
        checkout.ShopifyStore.storeFrontAccessToken,
      );

      // just write the perfect query and get the updated result and it will work
      const { data: resData, errors } = await shopifyStoreFront.request(
        `
      query{
        node(id: "${btoa(checkout.shopifyStorefrontCheckoutId)}") {
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
                  body_html
                  title
                  quantity
                  currentTotalPrice{
                    amount
                    currencyCode
                  }
                  price{
                    amount
                    currencyCode
                  }
                  variant {
                    id
                    title
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

      let checkoutDetails = {
        ...resData?.node,
        lineItems: resData?.node?.lineItems?.edges.map(
          (lineItem) => lineItem.node,
        ),
      };

      const formatter = this.common.currencyFormatter(
        checkoutDetails.currencyCode,
      );

      checkoutDetails = {
        ...checkoutDetails,
        subtotalPrice: formatter.format(checkoutDetails.subtotalPrice.amount),
        totalPrice: formatter.format(checkoutDetails.totalPrice.amount),
        totalTax: formatter.format(checkoutDetails.totalTax.amount),
      };

      console.log(JSON.stringify(checkoutDetails));

      // const productDetailedPromises = checkoutDetails.line_items.map(
      //   (product) => shopify.product.get(+product.product_id),
      // );

      // const allProductDetails = await Promise.all(productDetailedPromises);

      // const modifiedCheckoutLineItemData = {
      //   items: allProductDetails.map((product) => {
      //     const lineItem = checkoutDetails.line_items.find(
      //       (lineItem) => lineItem.product_id === product.id,
      //     );

      //     return {
      //       id: (lineItem as any).id,
      //       title: product.title,
      //       description: product.body_html,
      //       images: product.images.map((image) => ({
      //         id: image.id,
      //         alt: image.alt,
      //         src: image.src,
      //       })),
      //       productId: lineItem.product_id,
      //       variantId: lineItem.variant_id,
      //       price: formatter.format(+lineItem.price),
      //       comparePrice: lineItem.compare_at_price
      //         ? formatter.format(+lineItem.compare_at_price)
      //         : null,
      //       variants: product.variants.map((variant) => ({
      //         id: variant.id,
      //         title: variant.title,
      //       })),
      //     };
      //   }),
      //   checkoutUrl: checkout.shopifyAbandonedCheckoutURL,
      //   checkoutId: checkoutId,
      //   subtotal: formatter.format(+checkoutDetails.subtotal_price),
      //   taxes: formatter.format(+checkoutDetails.total_tax),
      //   total: formatter.format(+checkoutDetails.total_price),
      // };
      return [];
      // return [{ ...modifiedCheckoutLineItemData }];
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
          ShopifyStore: {
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
        checkout.ShopifyStore.name,
        checkout.ShopifyStore.storeFrontAccessToken,
      );

      const variantId = btoa(`gid://shopify/ProductVariant/${data.variantId}`);
      const checkoutId = btoa(checkout.shopifyStorefrontCheckoutId);

      this.checkout.addLineItemToStoreFrontCheckout(
        shopify,
        checkoutId,
        variantId,
      );
    } catch (err) {
      this.common.generateErrorResponse(err, 'Checkout');
    }
  }

  async updateLineItemInCheckout(data: UpdateLineItemDTO) {
    return {};
  }

  async removeLineItemFromCheckout(data: RemoveLineItemDTO) {
    try {
      const checkout = await this.prisma.checkout.findUnique({
        where: {
          id: data.checkoutId,
        },
        select: {
          ShopifyStore: {
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
        checkout.ShopifyStore.name,
        checkout.ShopifyStore.storeFrontAccessToken,
      );

      const shopifyAdmin = this.common.shopifyObject(
        checkout.ShopifyStore.name,
        checkout.ShopifyStore.accessToken,
      );

      const checkoutId = btoa(checkout.shopifyStorefrontCheckoutId);

      const checkoutDetails = await shopifyAdmin.checkout.get(
        checkout.shopifyStoreFrontCheckoutToken,
      );

      const updatedLineItems = checkoutDetails.line_items
        .filter((lineItem: any) => lineItem.id !== data.lineItemId)
        .map((lineItem) => ({
          quantity: lineItem.quantity,
          variantId: btoa(
            `gid://shopify/ProductVariant/${lineItem.variant_id}`,
          ),
        }));

      this.checkout.replaceStoreFrontCheckoutLineItems(
        shopifyStoreFront,
        checkoutId,
        updatedLineItems,
      );
    } catch (err) {
      this.common.generateErrorResponse(err, 'Checkout');
    }
  }
}
