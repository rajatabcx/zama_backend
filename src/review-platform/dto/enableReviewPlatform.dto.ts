import { ReviewPlatformName } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class EnableReviewPlatformDTO {
  @IsEnum(ReviewPlatformName)
  @IsNotEmpty()
  platformName: ReviewPlatformName;
}
