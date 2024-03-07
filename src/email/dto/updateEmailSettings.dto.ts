import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateEmailSettingsDTO {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  elasticEmailApiKey: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  checkoutTemplateName: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  productUpsellTemplateName: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  fromEmail: string;
}
