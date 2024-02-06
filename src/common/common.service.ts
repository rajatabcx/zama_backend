import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { ConfigService } from '@nestjs/config';
import * as Shopify from 'shopify-api-node';

@Injectable()
export class CommonService {
  constructor(private config: ConfigService) {}

  shopifyScopes: string[] = [
    'read_product_listings',
    'read_orders',
    'write_discounts',
    'read_products',
  ];

  hashData(password: string) {
    return argon2.hash(password);
  }

  generateErrorResponse(err: any, entity: string) {
    console.log(err.message);
    if (err?.code === 'P2025') {
      throw new BadRequestException(`${entity} not found`);
    } else if (err?.code === 'P2002' || err.response?.status === 409) {
      throw new ConflictException(`${entity} already exist`);
    }
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
  shopifyObjectForShop(shopName: string, accessToken: string) {
    const shopify = new Shopify({
      shopName,
      accessToken,
      apiVersion: '2024-01',
    });
    return shopify;
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
}
