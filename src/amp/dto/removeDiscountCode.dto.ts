import { IsNotEmpty, IsString } from 'class-validator';

export class RemoveDiscountCodeFromCheckoutDTO {
  @IsString()
  @IsNotEmpty()
  checkoutId: string;
}

export class RemoveDiscountCodeFromUpsellDTO {
  @IsString()
  @IsNotEmpty()
  checkoutId: string;

  @IsString()
  @IsNotEmpty()
  upsellId: string;
}
