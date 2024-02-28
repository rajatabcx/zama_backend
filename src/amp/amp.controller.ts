import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { AmpService } from './amp.service';
import { Public } from 'src/guards';
import { AMPEMAIL } from 'src/guards/amp.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  AddLineItemDTO,
  RemoveDiscountCodeDTO,
  ApplyDiscountCodeDTO,
  RemoveLineItemDTO,
  UpdateLineItemDTO,
} from './dto';

@Public()
@AMPEMAIL()
@Controller('/amp')
export class AmpController {
  constructor(private readonly ampService: AmpService) {}

  @Get('/shopify/bestseller-email/:checkoutId')
  bestSellerEmailData(@Param('checkoutId') checkoutId: string) {
    return this.ampService.bestSellerEmailData(checkoutId);
  }

  @Public()
  @AMPEMAIL()
  @Get('/shopify/checkout-email/:checkoutId')
  checkoutEmailData(@Param('checkoutId') checkoutId: string) {
    return this.ampService.checkoutEmailData(checkoutId);
  }

  @Public()
  @AMPEMAIL()
  @Post('/shopify/checkout-email/add-line-item')
  @UseInterceptors(FileInterceptor('file'))
  addLineItemToCheckout(
    @Body()
    data: AddLineItemDTO,
  ) {
    return this.ampService.addLineItemToCheckout(data);
  }

  @Public()
  @AMPEMAIL()
  @Post('/shopify/checkout-email/update-line-item')
  @UseInterceptors(FileInterceptor('file'))
  updateLineItemInCheckout(@Body() data: UpdateLineItemDTO) {
    return this.ampService.updateLineItemInCheckout(data);
  }

  @Public()
  @AMPEMAIL()
  @Post('/shopify/checkout-email/remove-line-item')
  @UseInterceptors(FileInterceptor('file'))
  removeLineItemFromCheckout(@Body() data: RemoveLineItemDTO) {
    return this.ampService.removeLineItemFromCheckout(data);
  }

  @Public()
  @AMPEMAIL()
  @Post('/shopify/checkout-email/apply-discount')
  @UseInterceptors(FileInterceptor('file'))
  applyDiscountCode(@Body() data: ApplyDiscountCodeDTO) {
    return this.ampService.applyDiscountCode(data);
  }

  @Public()
  @AMPEMAIL()
  @Post('/shopify/checkout-email/remove-discount')
  @UseInterceptors(FileInterceptor('file'))
  removeDiscountCode(@Body() data: RemoveDiscountCodeDTO) {
    return this.ampService.removeDiscountCode(data);
  }
}
