import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateLineItemDTO {
  @IsNumber()
  @IsNotEmpty()
  checkoutId: number;
  @IsNumber()
  @IsNotEmpty()
  lineItemId: number;
  @IsNumber()
  @IsNotEmpty()
  variantId: number;
  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}
