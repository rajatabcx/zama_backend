import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export class CreateSubscriberDTO {
  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber()
  phoneNumber: string;

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  keyword: string;

  @IsString()
  @IsOptional()
  keywordId: string;

  @IsString()
  @IsNotEmpty()
  accessToken: string;
}
