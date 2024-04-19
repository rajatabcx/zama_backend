import { Body, Controller, Post } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ConnectReviewPlatformDTO } from './dto';
import { UserId } from 'src/decorators';

@Controller('/review')
export class ReviewsController {
  constructor(private reviewService: ReviewsService) {}

  @Post('/connect')
  connectReviewPlatform(
    @UserId() userId: string,
    @Body() data: ConnectReviewPlatformDTO,
  ) {
    return this.reviewService.connectReviewPlatform(userId, data);
  }
}
