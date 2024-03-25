import { IsNotEmpty, IsString } from 'class-validator';

export class ApplyDiscountCodeFromCheckoutDTO {
  @IsString()
  @IsNotEmpty()
  discountCode: string;

  @IsString()
  @IsNotEmpty()
  checkoutId: string;
}

export class ApplyDiscountCodeFromUpsellDTO {
  @IsString()
  @IsNotEmpty()
  discountCode: string;

  @IsString()
  @IsNotEmpty()
  checkoutId: string;

  @IsString()
  @IsNotEmpty()
  upsellId: string;
}
