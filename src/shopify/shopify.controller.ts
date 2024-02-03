import { Controller, Get } from '@nestjs/common';
import { ShopifyService } from './shopify.service';

@Controller('/shopify')
export class ShopifyController {
  constructor(private readonly shopifyService: ShopifyService) {}

  @Get('/')
  shopify() {
    return null;
  }
}
