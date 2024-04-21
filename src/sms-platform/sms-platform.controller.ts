import { Controller, Get, Post, Patch, Body } from '@nestjs/common';
import { SmsPlatformService } from './sms-platform.service';
import { UserId } from 'src/decorators';
import { ConnectSMSPlatformDTO, EnableSMSPlatformDTO } from './dto';

@Controller('sms-platform')
export class SmsPlatformController {
  constructor(private readonly smsPlatformService: SmsPlatformService) {}

  @Get('/')
  smsPlatforms(@UserId() userId: string) {
    return this.smsPlatformService.smsPlatforms(userId);
  }

  @Post('/connect')
  connectSMSPlatform(
    @UserId() userId: string,
    @Body() data: ConnectSMSPlatformDTO,
  ) {
    return this.smsPlatformService.connectSMSPlatform(userId, data);
  }

  @Patch('/enable')
  enableSMSPlatform(@Body() data: EnableSMSPlatformDTO) {
    return this.smsPlatformService.enabledSMSPlatform(data);
  }
}
