import { IsNotEmpty, IsString } from 'class-validator';

export class CollectReviewDTO {
  @IsString()
  @IsNotEmpty()
  rating: string;

  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  reviewTitle: string;

  @IsString()
  @IsNotEmpty()
  reviewDescription: string;
}
