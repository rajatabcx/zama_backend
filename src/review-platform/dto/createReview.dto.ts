import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export class CreateReviewDTO {
  @IsString()
  @IsNotEmpty()
  platform: string;

  @IsString()
  @IsNotEmpty()
  reviewerName: string;

  @IsString()
  @IsNotEmpty()
  productName: string;

  @IsString()
  @IsNotEmpty()
  reviewerEmail: string;

  @IsString()
  @IsNotEmpty()
  reviewTitle: string;

  @IsString()
  @IsNotEmpty()
  reviewDescription: string;

  @IsString()
  @IsNotEmpty()
  accessToken: string;

  @IsString()
  @IsNotEmpty()
  shopName: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Max(5)
  rating: number;

  @IsString()
  @IsNotEmpty()
  productId: number;
}
