import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { shopifyApi, LATEST_API_VERSION } from '@shopify/shopify-api';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CommonService {
  constructor(private config: ConfigService) {}

  hashData(password: string) {
    return argon2.hash(password);
  }

  generateErrorResponse(err: any, entity: string) {
    console.log(err);
    if (err?.code === 'P2025') {
      throw new BadRequestException(`${entity} not found`);
    } else if (err?.code === 'P2002' || err.response?.status === 409) {
      throw new ConflictException(`${entity} already exist`);
    }
    throw new InternalServerErrorException('Something went wrong');
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
      scopes: ['read_products'],
      hostName: this.config.get('FRONTEND_URL'),
      future: {
        unstable_tokenExchange: true,
      },
    });
    return shopify;
  }
}
