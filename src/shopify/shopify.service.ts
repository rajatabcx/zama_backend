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
import { EmailTransactionalMessageData } from '@elasticemail/elasticemail-client-ts-axios';
import { shopifyIntegrationSuccessEmail } from 'src/data';
import { EmailService } from 'src/email/email.service';
import { Integration } from 'src/interfaces';
import { EcommerecePlatform } from 'src/enum';

@Injectable()
export class ShopifyService {
  constructor(
    private config: ConfigService,
    private common: CommonService,
    private http: HttpService,
    private prisma: PrismaService,
    private email: EmailService,
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
        scope: this.common.getShopifyScopes(),
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
    const userData = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        integrations: true,
      },
    });

    const integrations = userData.integrations as unknown as Integration;
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

      const shopifyStorePromise = this.prisma.shopifyStore.create({
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

      const updatedIntegration: Integration = {
        ...integrations,
        [EcommerecePlatform.SHOPIFY]: true,
      };

      const userPromise = this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          integrations: { ...updatedIntegration },
        },
      });

      const [shopifyStore] = await this.prisma.$transaction([
        shopifyStorePromise,
        userPromise,
      ]);

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
      await this.email.sendTransactionalEmailFromMe(emailData);

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
}
