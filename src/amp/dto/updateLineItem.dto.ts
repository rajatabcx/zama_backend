import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateLineItemDTO {
  @IsString()
  @IsNotEmpty()
  checkoutId: string;

  @IsString()
  @IsNotEmpty()
  lineItemId: string;

  @IsString()
  @IsNotEmpty()
  variantId: string;

  @IsString()
  @IsNotEmpty()
  quantity: string;

  @IsString()
  @IsNotEmpty()
  operation: string;
}
