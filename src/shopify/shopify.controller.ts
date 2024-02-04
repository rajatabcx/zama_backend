import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import { ShopifyService } from './shopify.service';
import { Request, Response } from 'express';

@Controller('/shopify')
export class ShopifyController {
  constructor(private readonly shopifyService: ShopifyService) {}

  @Get('/:shopName')
  shopify(
    @Param('shopName') shopName: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.shopifyService.shopify(shopName, req, res);
  }
}
