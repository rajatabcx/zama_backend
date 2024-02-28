import { IsNotEmpty, IsString } from 'class-validator';

export class RemoveLineItemDTO {
  @IsString()
  @IsNotEmpty()
  checkoutId: string;

  @IsString()
  @IsNotEmpty()
  lineItemId: string;
}
