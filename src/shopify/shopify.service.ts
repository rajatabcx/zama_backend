import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { CommonService } from 'src/common/common.service';
import { DiscountPercentageDTO, InstallShopifyDTO } from './dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ShopifyService {
  constructor(
    private config: ConfigService,
    private common: CommonService,
    private http: HttpService,
    private prisma: PrismaService,
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

  async products(userId: string, page: number, limit: number) {
    try {
      const params = { limit: 1 };
      const shopifyObj = await this.common.shopifyObjectForShop(userId);

      if (!shopifyObj.connected)
        return {
          data: { connected: false },
          message: 'SUCCESS',
          statusCode: 200,
        };
      const { shopify } = shopifyObj;
      const products = await shopify.product.list(params);
      return { data: products, message: 'SUCCESS', statusCode: 200 };
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

      return { data: {}, message: 'SUCCESS', statusCode: 200 };
    } catch (err) {
      this.common.generateErrorResponse(err, 'Shopify Discount');
    }
  }

  async createDiscount(userId: string, data: DiscountPercentageDTO) {
    try {
    } catch (err) {
      this.common.generateErrorResponse(err, 'Shopify Discount');
    }
  }

  async updateDiscount(userId: string, data: DiscountPercentageDTO) {
    try {
    } catch (err) {
      this.common.generateErrorResponse(err, 'Shopify Discount');
    }
  }

  async removeDiscount(userId: string) {
    try {
    } catch (err) {
      this.common.generateErrorResponse(err, 'Shopify Discount');
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
