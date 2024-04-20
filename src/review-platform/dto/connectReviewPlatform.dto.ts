import { ReviewPlatformName } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class ConnectReviewPlatformDTO {
  @IsEnum(ReviewPlatformName)
  @IsNotEmpty()
  platformName: ReviewPlatformName;

  @IsNotEmpty()
  @IsString()
  accessToken: string;
}
