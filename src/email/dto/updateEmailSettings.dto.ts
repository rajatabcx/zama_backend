import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateEmailSettingsDTO {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  elasticEmailApiKey: string;
}
