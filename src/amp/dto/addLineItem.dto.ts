import { IsNotEmpty, IsString } from 'class-validator';

export class AddLineItemFromCheckoutDTO {
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

export class AddLineItemFromUpsellDTO {
  @IsString()
  @IsNotEmpty()
  upsellId: string;

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
