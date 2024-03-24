import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { AmpService } from './amp.service';
import { Public } from 'src/guards';
import { AMPEMAIL } from 'src/guards/amp.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  AddLineItemFromCheckoutDTO,
  AddLineItemFromUpsellDTO,
  ApplyDiscountCodeFromCheckoutDTO,
  ApplyDiscountCodeFromUpsellDTO,
  RemoveDiscountCodeFromCheckoutDTO,
  RemoveDiscountCodeFromUpsellDTO,
  RemoveLineItemFromCheckoutDTO,
  RemoveLineItemFromUpsellDTO,
  UpdateLineItemFromCheckoutDTO,
  UpdateLineItemFromUpsellDTO,
} from './dto';

@Public()
@AMPEMAIL()
@Controller('/amp')
export class AmpController {
  constructor(private readonly ampService: AmpService) {}
  // checkout email options
  @Get('/shopify/bestseller-email/:checkoutId')
  bestSellerEmailData(@Param('checkoutId') checkoutId: string) {
    return this.ampService.bestSellerEmailData(checkoutId);
  }

  @Get('/shopify/checkout-email/:checkoutId')
  checkoutEmailData(@Param('checkoutId') checkoutId: string) {
    return this.ampService.checkoutEmailData(checkoutId);
  }

  @Post('/shopify/checkout-email/add-line-item')
  @UseInterceptors(FileInterceptor('file'))
  addLineItemToCheckoutFromCheckoutEmail(
    @Body()
    data: AddLineItemFromCheckoutDTO,
  ) {
    return this.ampService.addLineItemToCheckoutFromCheckoutEmail(data);
  }

  @Post('/shopify/checkout-email/update-line-item')
  @UseInterceptors(FileInterceptor('file'))
  updateLineItemInCheckoutFromCheckoutEmail(
    @Body() data: UpdateLineItemFromCheckoutDTO,
  ) {
    return this.ampService.updateLineItemInCheckoutFromCheckoutEmail(data);
  }

  @Post('/shopify/checkout-email/remove-line-item')
  @UseInterceptors(FileInterceptor('file'))
  removeLineItemFromCheckoutFromCheckoutEmail(
    @Body() data: RemoveLineItemFromCheckoutDTO,
  ) {
    return this.ampService.removeLineItemFromCheckoutFromCheckoutEmail(data);
  }

  @Post('/shopify/checkout-email/apply-discount')
  @UseInterceptors(FileInterceptor('file'))
  applyDiscountCodeFromCheckoutEmail(
    @Body() data: ApplyDiscountCodeFromCheckoutDTO,
  ) {
    return this.ampService.applyDiscountCodeFromCheckoutEmail(data);
  }

  @Post('/shopify/checkout-email/remove-discount')
  @UseInterceptors(FileInterceptor('file'))
  removeDiscountCodeFromCheckoutEmail(
    @Body() data: RemoveDiscountCodeFromCheckoutDTO,
  ) {
    return this.ampService.removeDiscountCodeFromCheckoutEmail(data);
  }

  // product upsell options
  @Get('/shopify/upsell-email/:productUpsellId')
  productUpsellEmailData(
    @Param('productUpsellId') productUpsellId: string,
    @Query('checkoutId') checkoutId: string,
  ) {
    return this.ampService.productUpsellEmailData(productUpsellId, checkoutId);
  }

  @Get('/shopify/recommendation-email/:productUpsellId')
  productRecommendationEmailData(
    @Param('productUpsellId') productUpsellId: string,
  ) {
    return this.ampService.productRecommendationEmailData(productUpsellId);
  }

  @Post('/shopify/upsell-email/add-line-item')
  @UseInterceptors(FileInterceptor('file'))
  addLineItemToCheckoutFromUpsellEmail(
    @Body()
    data: AddLineItemFromUpsellDTO,
  ) {
    return this.ampService.addLineItemToCheckoutFromUpsellEmail(data);
  }

  @Post('/shopify/upsell-email/update-line-item')
  @UseInterceptors(FileInterceptor('file'))
  updateLineItemInCheckoutFromUpsellEmail(
    @Body() data: UpdateLineItemFromUpsellDTO,
  ) {
    return this.ampService.updateLineItemInCheckoutFromUpsellEmail(data);
  }

  @Post('/shopify/upsell-email/remove-line-item')
  @UseInterceptors(FileInterceptor('file'))
  removeLineItemFromCheckoutFromUpsellEmail(
    @Body() data: RemoveLineItemFromUpsellDTO,
  ) {
    return this.ampService.removeLineItemFromCheckoutFromUpsellEmail(data);
  }

  @Post('/shopify/upsell-email/apply-discount')
  @UseInterceptors(FileInterceptor('file'))
  applyDiscountCodeFromUpsellEmail(
    @Body() data: ApplyDiscountCodeFromUpsellDTO,
  ) {
    return this.ampService.applyDiscountCodeFromUpsellEmail(data);
  }

  @Post('/shopify/upsell-email/remove-discount')
  @UseInterceptors(FileInterceptor('file'))
  removeDiscountCodeFromUpsellEmail(
    @Body() data: RemoveDiscountCodeFromUpsellDTO,
  ) {
    console.log(data);
    return this.ampService.removeDiscountCodeFromUpsellEmail(data);
  }
}
