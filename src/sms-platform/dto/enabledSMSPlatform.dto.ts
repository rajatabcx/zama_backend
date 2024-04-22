import { SMSPlatformName } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class EnableSMSPlatformDTO {
  @IsEnum(SMSPlatformName)
  @IsNotEmpty()
  platformName: SMSPlatformName;
}
