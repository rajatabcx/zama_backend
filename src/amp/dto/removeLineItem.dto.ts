import { IsNotEmpty, IsString } from 'class-validator';

export class RemoveLineItemFromCheckoutDTO {
  @IsString()
  @IsNotEmpty()
  checkoutId: string;

  @IsString()
  @IsNotEmpty()
  lineItemId: string;
}

export class RemoveLineItemFromUpsellDTO {
  @IsString()
  @IsNotEmpty()
  checkoutId: string;

  @IsString()
  @IsNotEmpty()
  upsellId: string;

  @IsString()
  @IsNotEmpty()
  lineItemId: string;
}
