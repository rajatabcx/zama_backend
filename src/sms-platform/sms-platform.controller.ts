import { Controller, Get, Post, Patch, Body } from '@nestjs/common';
import { SmsPlatformService } from './sms-platform.service';
import { UserId } from 'src/decorators';
import { ConnectSMSPlatformDTO, EnableSMSPlatformDTO } from './dto';

@Controller('sms-platform')
export class SmsPlatformController {
  constructor(private readonly smsPlatformService: SmsPlatformService) {}

  @Get('/')
  reviewPlatforms(@UserId() userId: string) {
    return this.smsPlatformService.reviewPlatforms(userId);
  }

  @Post('/connect')
  connectReviewPlatform(
    @UserId() userId: string,
    @Body() data: ConnectSMSPlatformDTO,
  ) {
    return this.smsPlatformService.connectReviewPlatform(userId, data);
  }

  @Patch('/enable')
  enableReviewPlatform(@Body() data: EnableSMSPlatformDTO) {
    return this.smsPlatformService.enabledReviewPlatform(data);
  }
}
