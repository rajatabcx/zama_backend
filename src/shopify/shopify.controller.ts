import { Controller, Req, Res, Get, Body, Query, Post } from '@nestjs/common';
import { ShopifyService } from './shopify.service';
import { Request, Response } from 'express';
import { Public } from 'src/guards';
import { InstallShopifyDTO } from './dto';
import { UserId } from 'src/decorators';

@Controller('/shopify')
export class ShopifyController {
  constructor(private readonly shopifyService: ShopifyService) {}

  @Public()
  @Post('/install')
  shopify(
    @Body() data: InstallShopifyDTO,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.shopifyService.shopify(data, req, res);
  }

  @Get('/auth/callback')
  shopifyCallback(
    @Query('hmac') hmac: string,
    @Query('code') code: string,
    @Query('shop') shop: string,
    @Query('state') state: string,
    @Req() request: Request,
    @UserId() userId: string,
  ) {
    const cookies = request.cookies;
    return this.shopifyService.shopifyCallback(
      hmac,
      code,
      shop,
      state,
      cookies.state,
      userId,
    );
  }

  @Get('/products')
  products(@UserId() userId: string) {
    return this.shopifyService.products(userId);
  }
}
