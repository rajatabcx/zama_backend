import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { CommonService } from 'src/common/common.service';
import {
  DiscountPercentageDTO,
  InstallShopifyDTO,
  ProductDTO,
  StorefrontAPIKeyDTO,
  UpdateHourDelayDTO,
} from './dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { ElasticEmailService } from 'src/elastic-email/elastic-email.service';
import { EmailTransactionalMessageData } from '@elasticemail/elasticemail-client-ts-axios';
import {
  checkoutFallbackTemplate,
  checkoutTemplate,
  shopifyIntegrationSuccessEmail,
  upsellEmailTemplate,
  upsellFallbackTemplate,
} from 'src/email/data';
import { AmpService } from 'src/amp/amp.service';

@Injectable()
export class ShopifyService {
  constructor(
    private config: ConfigService,
    private common: CommonService,
    private http: HttpService,
    private prisma: PrismaService,
    private elasticEmail: ElasticEmailService,
    private amp: AmpService,
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

      const shopifyStore = await this.prisma.shopifyStore.create({
        data: {
          name: shop,
          accessToken: data.access_token,
          scope: data.scope,
          userId,
        },
        select: {
          user: {
            select: {
              email: true,
              name: true,
            },
          },
        },
      });

      const emailData: EmailTransactionalMessageData = {
        Recipients: {
          To: [shopifyStore.user.email],
        },
        Content: {
          Subject: 'Successfully integrated shopify into Zama!!',
          Body: [
            {
              ContentType: 'HTML',
              Content: shopifyIntegrationSuccessEmail,
            },
          ],
          Merge: {
            name: shopifyStore.user.name,
          },
        },
      };
      await this.elasticEmail.sendTransactionalEmailFromMe(emailData);

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

  async removeProduct(userId: string, data: ProductDTO) {
    try {
      const shopifyObj = await this.common.shopifyObjectForShop(userId);

      if (!shopifyObj.connected)
        return {
          data: { connected: false },
          message: 'SUCCESS',
          statusCode: 200,
        };

      const { shopifyStore } = shopifyObj;

      if (shopifyStore.selectedProductIds.length === 0) {
        throw new BadRequestException('Products not available to remove');
      }

      const modifiedData = shopifyStore.selectedProductIds.filter(
        (product) => +product.variantId !== data.variantId,
      );

      const json = modifiedData as unknown as Prisma.JsonArray;

      await this.prisma.shopifyStore.update({
        where: {
          userId,
        },
        data: {
          selectedProductIds: {
            set: json,
          },
        },
      });
      return {
        data: {},
        message: 'Product removed successfully',
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
      const { shopifyStore } = shopifyObj;

      if (!shopifyStore.priceRuleId && !shopifyStore.discountId) {
        return {
          data: { givingDiscount: false },
          message: 'SUCCESS',
          statusCode: 200,
        };
      }

      return {
        data: {
          givingDiscount: true,
          percentage: shopifyStore.discountPercentage,
          title: shopifyStore.discountCode,
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
          discountCode: 'ZAMA_SPECIAL',
          discountPercentage: data.discountPercentage,
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
      await this.prisma.shopifyStore.update({
        where: {
          userId,
        },
        data: {
          discountPercentage: data.discountPercentage,
        },
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
          discountId: null,
          priceRuleId: null,
          discountCode: null,
          discountPercentage: null,
        },
      });
    } catch (err) {
      this.common.generateErrorResponse(err, 'Shopify Discount');
    }
  }

  async checkouts(userId: string, page: number, limit: number) {
    try {
      const shopifyObj = await this.common.shopifyObjectForShop(userId);

      if (!shopifyObj.connected)
        return {
          data: { connected: false },
          message: 'SUCCESS',
          statusCode: 200,
        };

      const checkoutsPromise = this.prisma.checkout.findMany({
        where: {
          shopifyStore: {
            userId,
          },
        },
        select: {
          id: true,
          email: true,
          emailSent: true,
          orderFulFilled: true,
          createdAt: true,
        },
        take: limit,
        skip: (page - 1) * limit,
        orderBy: {
          createdAt: 'desc',
        },
      });
      const totalPromise = this.prisma.checkout.count({
        where: {
          shopifyStore: {
            userId,
          },
        },
      });

      const [checkouts, total] = await this.prisma.$transaction([
        checkoutsPromise,
        totalPromise,
      ]);

      const { hasNextPage, hasPrevPage, nextPage, prevPage, totalPages } =
        this.common.calculatePaginationDetails(total, page, limit);

      return {
        data: {
          checkouts,
          total,
          hasNextPage,
          hasPrevPage,
          nextPage,
          prevPage,
          totalPages,
          connected: true,
        },
        statusCode: 200,
        message: 'SUCCESS',
      };
    } catch (err) {
      this.common.generateErrorResponse(err, 'Checkout');
    }
  }

  async storefrontAPIKey(userId: string) {
    try {
      const shopifyObj = await this.common.shopifyObjectForShop(userId);

      if (!shopifyObj.connected)
        return {
          data: { connected: false },
          message: 'SUCCESS',
          statusCode: 200,
        };
      return {
        data: {
          storeFrontAccessToken: shopifyObj.shopifyStore.storeFrontAccessToken,
        },
        message: 'SUCCESS',
        statusCode: 200,
      };
    } catch (err) {
      this.common.generateErrorResponse(err, 'Storefront Access Token');
    }
  }

  async updateStorefrontAPIKey(userId: string, data: StorefrontAPIKeyDTO) {
    try {
      const shopifyObj = await this.common.shopifyObjectForShop(userId);

      if (!shopifyObj.connected)
        return {
          data: { connected: false },
          message: 'SUCCESS',
          statusCode: 200,
        };

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

  async hour(userId: string) {
    try {
      const shopifyObj = await this.common.shopifyObjectForShop(userId);

      if (!shopifyObj.connected)
        return {
          data: { connected: false },
          message: 'SUCCESS',
          statusCode: 200,
        };
      return {
        data: { hour: shopifyObj.shopifyStore.hourDelay },
        message: 'SUCCESS',
        statusCode: 200,
      };
    } catch (err) {
      this.common.generateErrorResponse(err, 'Hour');
    }
  }

  async updateHour(userId: string, data: UpdateHourDelayDTO) {
    try {
      const shopifyObj = await this.common.shopifyObjectForShop(userId);

      if (!shopifyObj.connected)
        return {
          data: { connected: false },
          message: 'SUCCESS',
          statusCode: 200,
        };
      await this.prisma.shopifyStore.update({
        where: {
          userId,
        },
        data: {
          hourDelay: data.hour,
        },
      });
      return { data: {}, message: 'SUCCESS', statusCode: 200 };
    } catch (err) {
      this.common.generateErrorResponse(err, 'Hour');
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

  async checkoutEmail(userId: string, checkoutId: string) {
    try {
      const checkout = await this.prisma.checkout.findUnique({
        where: {
          id: checkoutId,
        },
        select: {
          email: true,
          shopifyStorefrontCheckoutId: true,
        },
      });

      const checkoutDetails = await this.amp.checkoutEmailData(checkoutId);

      const productsHTML: string[] = checkoutDetails[0].items.map(
        (lineItem) => {
          const html = `
        <div class="product">
                        <div><img src="${lineItem.images[0].src}" height="60" width="60"></div>
                        <div class="productDetails">
                            <div style="margin:auto">${lineItem.title} &nbsp;&nbsp; x&nbsp;&nbsp; ${lineItem.quantity}</div>
                            <div style="margin:auto;margin-left:24px">${lineItem.price}</div>
                        </div>
                    </div>
                    `;
          return html;
        },
      );

      const emailMessageData: EmailTransactionalMessageData = {
        Recipients: {
          To: [checkout.email],
        },
        Content: {
          Subject:
            'Snow Way! Your Board Dreams Await - Complete Your Checkout!',
          Merge: {
            checkoutLink: `${this.config.get(
              'BACKEND_URL',
            )}/amp/shopify/checkout-email/${checkoutId}`,
            bestSellerLink: `${this.config.get(
              'BACKEND_URL',
            )}/amp/shopify/bestseller-email/${checkoutId}`,
            updateLineItemLink: `${this.config.get(
              'BACKEND_URL',
            )}/amp/shopify/checkout-email/update-line-item`,
            addLineItemLink: `${this.config.get(
              'BACKEND_URL',
            )}/amp/shopify/checkout-email/add-line-item`,
            removeLineItemLink: `${this.config.get(
              'BACKEND_URL',
            )}/amp/shopify/checkout-email/remove-line-item`,
            applyDiscountLink: `${this.config.get(
              'BACKEND_URL',
            )}/amp/shopify/checkout-email/apply-discount`,
            removeDiscountLink: `${this.config.get(
              'BACKEND_URL',
            )}/amp/shopify/checkout-email/remove-discount`,
            abandonedCheckoutURL: checkoutDetails[0].checkoutUrl,
          },
          Body: [
            {
              ContentType: 'AMP',
              Content: checkoutTemplate,
            },
            {
              ContentType: 'HTML',
              Content: checkoutFallbackTemplate.replace(
                '{{products}}',
                productsHTML.join('\n'),
              ),
            },
          ],
        },
      };
      await this.elasticEmail.sendTransactionalEmail(userId, emailMessageData);

      await this.prisma.checkout.update({
        where: {
          id: checkoutId,
        },
        data: {
          emailSent: true,
        },
      });

      return {
        data: {},
        message: 'SUCCESS',
        statusCode: 200,
      };
    } catch (err) {
      this.common.generateErrorResponse(err, 'Checkout email');
    }
  }

  async productUpsellEmail(
    userId: string,
    email: string,
    upsellId: string,
    checkoutId: string,
    checkoutUrl: string,
  ) {
    try {
      const checkoutDetails = await this.amp.productUpsellEmailData(
        upsellId,
        checkoutId,
      );

      const productsHTML: string[] = checkoutDetails[0].items.map(
        (lineItem) => {
          const html = `
        <div class="product">
                        <div><img src="${lineItem.images[0].src}" height="60" width="60"></div>
                        <div class="productDetails">
                            <div style="margin:auto">${lineItem.title} &nbsp;&nbsp; x&nbsp;&nbsp; ${lineItem.quantity}</div>
                            <div style="margin:auto;margin-left:24px">${lineItem.price}</div>
                        </div>
                    </div>
                    `;
          return html;
        },
      );

      const emailMessageData: EmailTransactionalMessageData = {
        Recipients: {
          To: [email],
        },
        Content: {
          Subject: 'Slope Style Upgrade: Shred the Gnar with Our Fresh Boards!',
          Merge: {
            checkoutLink: `${this.config.get(
              'BACKEND_URL',
            )}/amp/shopify/upsell-email/${upsellId}?checkoutId=${encodeURIComponent(
              checkoutId,
            )}`,
            globalCheckoutId: checkoutId,
            recommendationLink: `${this.config.get(
              'BACKEND_URL',
            )}/amp/shopify/recommendation-email/${upsellId}`,
            updateLineItemLink: `${this.config.get(
              'BACKEND_URL',
            )}/amp/shopify/upsell-email/update-line-item`,
            addLineItemLink: `${this.config.get(
              'BACKEND_URL',
            )}/amp/shopify/upsell-email/add-line-item`,
            removeLineItemLink: `${this.config.get(
              'BACKEND_URL',
            )}/amp/shopify/upsell-email/remove-line-item`,
            applyDiscountLink: `${this.config.get(
              'BACKEND_URL',
            )}/amp/shopify/upsell-email/apply-discount`,
            removeDiscountLink: `${this.config.get(
              'BACKEND_URL',
            )}/amp/shopify/upsell-email/remove-discount`,
            abandonedCheckoutURL: checkoutUrl,
          },
          Body: [
            {
              ContentType: 'AMP',
              Content: upsellEmailTemplate,
            },
            {
              ContentType: 'HTML',
              Content: upsellFallbackTemplate.replace(
                '{{products}}',
                productsHTML.join('\n'),
              ),
            },
          ],
        },
      };

      await this.elasticEmail.sendTransactionalEmail(userId, emailMessageData);

      return {
        data: {},
        message: 'SUCCESS',
        statusCode: 200,
      };
    } catch (err) {
      this.common.generateErrorResponse(err, 'Checkout email');
    }
  }
}
