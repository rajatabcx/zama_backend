import { EmailServiceProvider } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateEmailSettingsDTO {
  @IsString()
  @IsNotEmpty()
  apiKey: string;

  @IsEnum(EmailServiceProvider)
  @IsNotEmpty()
  emailServiceProvider: EmailServiceProvider;
}
