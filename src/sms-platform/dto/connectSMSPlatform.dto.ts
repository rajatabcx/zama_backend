import { SMSPlatformName } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class ConnectSMSPlatformDTO {
  @IsEnum(SMSPlatformName)
  @IsNotEmpty()
  platformName: SMSPlatformName;

  @IsNotEmpty()
  @IsString()
  accessToken: string;
}
