import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class DiscountPercentageDTO {
  @IsNumber()
  @IsNotEmpty()
  @Min(5)
  discountPercentage: number;
}
