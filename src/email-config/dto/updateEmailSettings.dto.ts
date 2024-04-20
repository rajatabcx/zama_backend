import { EmailServiceProvider } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateEmailSettingsDTO {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  apiKey: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  checkoutTemplate: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  productUpsellTemplate: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  reviewTemplate: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  fromEmail: string;

  @IsEnum(EmailServiceProvider)
  @IsNotEmpty()
  emailServiceProvider: EmailServiceProvider;
}
