import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import '@shopify/shopify-api/adapters/node';
import { shopifyApi, LATEST_API_VERSION } from '@shopify/shopify-api';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CommonService {
  constructor(private config: ConfigService) {}

  shopifyScopes: string[] = [
    'read_product_listings',
    'read_orders',
    'write_discounts',
  ];

  // {
  //   access_token: 'shpua_603a3c8d8284a6aab725fb8e240f99be',
  //   scope: 'read_product_listings,read_orders,write_discounts'
  // }

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
  shopifyObject() {
    const shopify = shopifyApi({
      apiVersion: LATEST_API_VERSION,
      isEmbeddedApp: false,
      apiKey: this.config.get('SHOPIFY_API_KEY'),
      apiSecretKey: this.config.get('SHOPIFY_API_SECRET_KEY'),
      scopes: this.shopifyScopes,
      hostName: this.config.get('FRONTEND_URL').replace('https://', ''),
      future: {
        unstable_tokenExchange: true,
      },
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
}
