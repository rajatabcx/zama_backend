import { IsNotEmpty, IsString } from 'class-validator';

export class AddLineItemDTO {
  @IsString()
  @IsNotEmpty()
  checkoutId: string;
  @IsString()
  @IsNotEmpty()
  variantId: string;
  @IsString()
  @IsNotEmpty()
  quantity: string;
}
