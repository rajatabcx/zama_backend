import {
  Controller,
  Req,
  Res,
  Get,
  Body,
  Query,
  Post,
  DefaultValuePipe,
  ParseIntPipe,
  Patch,
  Delete,
  Param,
} from '@nestjs/common';
import { ShopifyService } from './shopify.service';
import { Request, Response } from 'express';
import { Public } from 'src/guards';
import {
  DiscountPercentageDTO,
  InstallShopifyDTO,
  ProductDTO,
  StorefrontAPIKeyDTO,
  UpdateHourDelayDTO,
} from './dto';
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
  products(
    @UserId() userId: string,
    @Query('page_info') page_info: string,
    @Query('limit', new DefaultValuePipe(5), new ParseIntPipe()) limit: string,
  ) {
    return this.shopifyService.products(userId, limit, page_info);
  }

  @Patch('/add-product')
  addProduct(@UserId() userId: string, @Body() data: ProductDTO) {
    return this.shopifyService.addProduct(userId, data);
  }

  @Patch('/remove-product')
  removeProduct(@UserId() userId: string, @Body() data: ProductDTO) {
    return this.shopifyService.removeProduct(userId, data);
  }

  @Get('/discount')
  discount(@UserId() userId: string) {
    return this.shopifyService.discount(userId);
  }

  @Post('/discount')
  createDiscount(
    @UserId() userId: string,
    @Body() data: DiscountPercentageDTO,
  ) {
    return this.shopifyService.createDiscount(userId, data);
  }

  @Patch('/discount')
  updateDiscount(
    @UserId() userId: string,
    @Body() data: DiscountPercentageDTO,
  ) {
    return this.shopifyService.updateDiscount(userId, data);
  }

  @Delete('/discount')
  removeDiscount(@UserId() userId: string) {
    return this.shopifyService.removeDiscount(userId);
  }

  @Get('/checkouts')
  checkouts(
    @UserId() userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.shopifyService.checkouts(userId, page, limit);
  }

  @Get('/hour')
  hour(@UserId() userId: string) {
    return this.shopifyService.hour(userId);
  }

  @Patch('/update-hour')
  updateHour(@UserId() userId: string, @Body() data: UpdateHourDelayDTO) {
    return this.shopifyService.updateHour(userId, data);
  }

  @Get('/storefront-apikey')
  storefrontAPIKey(@UserId() userId: string) {
    return this.shopifyService.storefrontAPIKey(userId);
  }

  @Patch('/storefront-apikey')
  updateStorefrontAPIKey(
    @UserId() userId: string,
    @Body() data: StorefrontAPIKeyDTO,
  ) {
    return this.shopifyService.updateStorefrontAPIKey(userId, data);
  }

  @Get('/check-connection')
  checkConnection(@UserId() userId: string) {
    return this.shopifyService.checkConnection(userId);
  }

  @Post('/send-checkout-email/:checkoutId')
  checkoutEmail(
    @UserId() userId: string,
    @Param('checkoutId') checkoutId: string,
  ) {
    return this.shopifyService.checkoutEmail(userId, checkoutId);
  }
}
