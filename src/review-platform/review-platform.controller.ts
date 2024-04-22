import { Body, Controller, Get, Post, Patch } from '@nestjs/common';
import { ReviewPlatformService } from './review-platform.service';
import { UserId } from 'src/decorators';
import { ConnectReviewPlatformDTO, EnableReviewPlatformDTO } from './dto';

@Controller('/review-platform')
export class ReviewPlatformController {
  constructor(private readonly reviewPlatformService: ReviewPlatformService) {}

  @Get('/')
  reviewPlatforms(@UserId() userId: string) {
    return this.reviewPlatformService.reviewPlatforms(userId);
  }

  @Post('/connect')
  connectReviewPlatform(
    @UserId() userId: string,
    @Body() data: ConnectReviewPlatformDTO,
  ) {
    return this.reviewPlatformService.connectReviewPlatform(userId, data);
  }

  @Patch('/enable')
  enableReviewPlatform(@Body() data: EnableReviewPlatformDTO) {
    return this.reviewPlatformService.enabledReviewPlatform(data);
  }
}
