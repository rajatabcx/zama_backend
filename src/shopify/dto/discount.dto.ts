import { IsNotEmpty, IsNumber, Max, Min } from 'class-validator';

export class DiscountPercentageDTO {
  @IsNumber()
  @IsNotEmpty()
  @Min(5)
  @Max(100)
  discountPercentage: number;
}
