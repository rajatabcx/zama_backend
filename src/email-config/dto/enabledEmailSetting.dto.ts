import { EmailServiceProvider } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class EnabledEmailSettingDTO {
  @IsEnum(EmailServiceProvider)
  @IsNotEmpty()
  emailServiceProvider: EmailServiceProvider;
}
