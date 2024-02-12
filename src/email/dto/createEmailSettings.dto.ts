import { IsNotEmpty, IsString } from 'class-validator';

export class CreateEmailSettingsDTO {
  @IsString()
  @IsNotEmpty()
  stripoApiKey: string;
}
