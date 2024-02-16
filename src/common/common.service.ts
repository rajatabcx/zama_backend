import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { ConfigService } from '@nestjs/config';
import * as Shopify from 'shopify-api-node';
import { PrismaService } from 'src/prisma/prisma.service';
import { SelectedProducts } from 'src/shopify/type';
import { createStorefrontApiClient } from '@shopify/storefront-api-client';

@Injectable()
export class CommonService {
  constructor(private config: ConfigService, private prisma: PrismaService) {}

  shopifyScopes: string[] = [
    'read_product_listings',
    'read_orders',
    'read_products',
    'write_discounts',
    'write_price_rules',
    'write_checkouts',
    'unauthenticated_write_checkouts',
  ];

  hashData(password: string) {
    return argon2.hash(password);
  }

  generateErrorResponse(err: any, entity: string) {
    console.log(err.message);
    if (err?.code === 'P2025') {
      throw new BadRequestException(`${entity} not found`);
    } else if (
      err?.code === 'P2002' ||
      err.response?.status === 409 ||
      err.response?.statusCode === 409
    ) {
      throw new ConflictException(`${entity} already exist`);
    } else if (err.response?.status === 400 || err.response?.statusCode === 400)
      throw new BadRequestException(err.message);
    throw new InternalServerErrorException(
      err.message || 'Something went wrong',
    );
  }

  customToken() {
    const bufferValue = Buffer.alloc(64);
    for (let i = 0; i < bufferValue.length; i++) {
      bufferValue[i] = Math.floor(Math.random() * 256);
    }
    const token = bufferValue.toString('base64');
    return token;
  }
  shopifyObject(shopName: string, accessToken: string) {
    const shopify = new Shopify({
      shopName,
      accessToken,
      apiVersion: '2024-01',
    });
    return shopify;
  }

  shopifyStoreFrontObject(storeDomain: string, privateAccessToken: string) {
    const shopify = createStorefrontApiClient({
      storeDomain,
      privateAccessToken,
      apiVersion: '2023-10',
    });
    return shopify;
  }

  async shopifyObjectForShop(userId: string): Promise<
    | {
        connected: true;
        shopify: Shopify;
        shopifyStore: {
          accessToken: string;
          name: string;
          givingDiscount: boolean;
          selectedProductIds: SelectedProducts;
          discountId: number;
          priceRuleId: number;
          webhookRegistered: boolean;
        };
      }
    | { connected: false }
  > {
    const shopifyStore = await this.prisma.shopifyStore.findUnique({
      where: {
        userId,
      },
      select: {
        accessToken: true,
        name: true,
        givingDiscount: true,
        discountId: true,
        priceRuleId: true,
        selectedProductIds: true,
        webhookRegistered: true,
      },
    });
    if (!shopifyStore) {
      return { connected: false };
    }
    const shopify = this.shopifyObject(
      shopifyStore.name,
      shopifyStore.accessToken,
    );

    return {
      connected: true,
      shopify,
      shopifyStore: {
        ...shopifyStore,
        selectedProductIds: shopifyStore.selectedProductIds as SelectedProducts,
        discountId: Number(shopifyStore.discountId),
        priceRuleId: Number(shopifyStore.priceRuleId),
      },
    };
  }

  serialize(object: Record<string, any>) {
    const str = [];
    for (const p in object) {
      if (Object.prototype.hasOwnProperty.call(object, p)) {
        if (object[p] || typeof object[p] === 'boolean' || object[p] === null) {
          if (Array.isArray(object[p]) && !object[p].length) continue;

          str.push(`${encodeURIComponent(p)}=${encodeURIComponent(object[p])}`);
        }
      }
    }
    return str.join('&');
  }

  randomIntFromInterval(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  nounce() {
    const length = this.randomIntFromInterval(10, 20);
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let retVal = '';
    for (let i = 0, n = charset.length; i < length; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n)).toUpperCase();
    }
    return retVal;
  }

  currencyFormatter(currency: string): Intl.NumberFormat {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    });
    return formatter;
  }
}
