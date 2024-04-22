import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

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

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  customerEmail: string;

  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsString()
  @IsNotEmpty()
  productName: string;
}
