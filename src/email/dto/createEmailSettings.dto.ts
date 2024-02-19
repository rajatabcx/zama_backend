import { IsNotEmpty, IsString } from 'class-validator';

export class CreateEmailSettingsDTO {
  @IsString()
  @IsNotEmpty()
  elasticEmailApiKey: string;
}
