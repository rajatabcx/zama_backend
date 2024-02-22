import { IsNotEmpty, IsString } from 'class-validator';

export class ApplyDiscountCodeDTO {
  @IsString()
  @IsNotEmpty()
  discountCode: string;

  @IsString()
  @IsNotEmpty()
  checkoutId: string;
}
