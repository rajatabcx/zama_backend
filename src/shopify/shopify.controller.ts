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
  UseInterceptors,
} from '@nestjs/common';
import { ShopifyService } from './shopify.service';
import { Request, Response } from 'express';
import { Public } from 'src/guards';
import {
  AddLineItemDTO,
  ApplyDiscountCodeDTO,
  DiscountPercentageDTO,
  InstallShopifyDTO,
  ProductDTO,
  RemoveLineItemDTO,
  UpdateHourDelayDTO,
  UpdateLineItemDTO,
} from './dto';
import { UserId } from 'src/decorators';
import { FileInterceptor } from '@nestjs/platform-express';
import { RemoveDiscountCodeDTO } from './dto/removeDiscountCode.dto';
import { AMPEMAIL } from 'src/guards/amp.guard';

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

  @Get('/checkout/all')
  allCheckouts(@UserId() userId: string) {
    return this.shopifyService.allCheckouts(userId);
  }

  @Get('/hour')
  hour(@UserId() userId: string) {
    return this.shopifyService.hour(userId);
  }

  @Patch('/update-hour')
  updateHour(@UserId() userId: string, @Body() data: UpdateHourDelayDTO) {
    return this.shopifyService.updateHour(userId, data);
  }

  @Get('/check-connection')
  checkConnection(@UserId() userId: string) {
    return this.shopifyService.checkConnection(userId);
  }

  @Public()
  @AMPEMAIL()
  @Get('/bestseller-email/:checkoutId')
  bestSellerEmailData(@Param('checkoutId') checkoutId: string) {
    return this.shopifyService.bestSellerEmailData(checkoutId);
  }

  @Public()
  @AMPEMAIL()
  @Get('/checkout-email/:checkoutId')
  checkoutEmailData(@Param('checkoutId') checkoutId: string) {
    return this.shopifyService.checkoutEmailData(checkoutId);
  }

  @Public()
  @AMPEMAIL()
  @Post('/checkout-email/add-line-item')
  @UseInterceptors(FileInterceptor('file'))
  addLineItemToCheckout(
    @Body()
    data: AddLineItemDTO,
  ) {
    return this.shopifyService.addLineItemToCheckout(data);
  }

  @Public()
  @AMPEMAIL()
  @Post('/checkout-email/update-line-item')
  @UseInterceptors(FileInterceptor('file'))
  updateLineItemInCheckout(@Body() data: UpdateLineItemDTO) {
    return this.shopifyService.updateLineItemInCheckout(data);
  }

  @Public()
  @AMPEMAIL()
  @Post('/checkout-email/remove-line-item')
  @UseInterceptors(FileInterceptor('file'))
  removeLineItemFromCheckout(@Body() data: RemoveLineItemDTO) {
    return this.shopifyService.removeLineItemFromCheckout(data);
  }

  @Public()
  @AMPEMAIL()
  @Post('/checkout-email/apply-discount')
  @UseInterceptors(FileInterceptor('file'))
  applyDiscountCode(@Body() data: ApplyDiscountCodeDTO) {
    return this.shopifyService.applyDiscountCode(data);
  }

  @Public()
  @AMPEMAIL()
  @Post('/checkout-email/remove-discount')
  @UseInterceptors(FileInterceptor('file'))
  removeDiscountCode(@Body() data: RemoveDiscountCodeDTO) {
    return this.shopifyService.removeDiscountCode(data);
  }
}
