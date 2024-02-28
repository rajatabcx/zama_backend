import { IsNotEmpty, IsString } from 'class-validator';

export class RemoveDiscountCodeDTO {
  @IsString()
  @IsNotEmpty()
  checkoutId: string;
}
