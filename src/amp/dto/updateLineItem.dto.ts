import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateLineItemFromCheckoutDTO {
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

export class UpdateLineItemFromUpsellDTO {
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

  @IsString()
  @IsNotEmpty()
  upsellId: string;
}
