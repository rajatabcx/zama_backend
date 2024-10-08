import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  DefaultValuePipe,
  ParseIntPipe,
  Query,
  Post,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserId } from 'src/decorators';
import {
  CreateProductUpsellDTO,
  UpdateProductUpsellProductsDTO,
  UpdateUserDTO,
} from './dto';
import { UpdateProductUpsellListDTO } from './dto/updateProductUpsellList.dto';

@Controller('/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/')
  profile(@UserId() userId: string) {
    return this.userService.profile(userId);
  }

  @Patch('/:userId')
  update(
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateUserDTO,
  ) {
    return this.userService.update(userId, updateUserDto);
  }

  @Get('/integrations')
  integrations(@UserId() userId: string) {
    return this.userService.integrations(userId);
  }

  @Get('/checkouts')
  checkouts(
    @UserId() userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.userService.checkouts(userId, page, limit);
  }

  @Get('/orders')
  orders(
    @UserId() userId: string,
    @Query('page_info') page_info: string,
    @Query('limit', new DefaultValuePipe(10), new ParseIntPipe()) limit: string,
  ) {
    return this.userService.orders(userId, limit, page_info);
  }

  @Get('/product-upsells')
  productUpsells(
    @UserId() userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.userService.productUpsells(userId, page, limit);
  }

  @Post('/product-upsells')
  createProductUpsells(
    @UserId() userId: string,
    @Body() data: CreateProductUpsellDTO,
  ) {
    return this.userService.createProductUpsells(userId, data);
  }

  @Patch('/product-upsells/:productUpsellId/products')
  productUpsellsAddProducts(
    @Param('productUpsellId') productUpsellId: string,
    @Body() data: UpdateProductUpsellProductsDTO,
  ) {
    return this.userService.productUpsellsAddProducts(productUpsellId, data);
  }

  @Patch('/product-upsells/:productUpsellId/list')
  productUpsellsAddListName(
    @Param('productUpsellId') productUpsellId: string,
    @Body() data: UpdateProductUpsellListDTO,
  ) {
    return this.userService.productUpsellsAddListName(productUpsellId, data);
  }

  @Patch('/product-upsells/:productUpsellId/run')
  runProductUpsell(
    @UserId() userId: string,
    @Param('productUpsellId') productUpsellId: string,
  ) {
    return this.userService.runProductUpsell(userId, productUpsellId);
  }

  @Post('/send-checkout-email/:checkoutId')
  checkoutEmail(
    @UserId() userId: string,
    @Param('checkoutId') checkoutId: string,
  ) {
    return this.userService.checkoutEmail(userId, checkoutId);
  }

  @Post('/send-review-email/:checkoutId')
  reviewEmail(
    @UserId() userId: string,
    @Param('checkoutId') checkoutId: string,
  ) {
    return this.userService.reviewEmail(userId, checkoutId);
  }
}
