import { IsNotEmpty, IsNumber } from 'class-validator';

export class ProductDTO {
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @IsNumber()
  @IsNotEmpty()
  variantId: number;
}
