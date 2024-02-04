import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { CommonService } from 'src/common/common.service';

@Injectable()
export class ShopifyService {
  constructor(private common: CommonService, private config: ConfigService) {}

  async shopify(shopName: string, req: Request, res: Response) {
    if (shopName) {
      const shopify = this.common.shopifyObject();
      await shopify.auth.begin({
        shop: shopName,
        callbackPath: `/shopify/callback`,
        rawRequest: req,
        rawResponse: res,
        isOnline: false,
      });
    } else {
      throw new BadRequestException(`Shop name not found`);
    }
  }
}
