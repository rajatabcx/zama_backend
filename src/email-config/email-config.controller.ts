import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { EmailConfigService } from './email-config.service';
import { UserId } from 'src/decorators';
import {
  CreateEmailSettingsDTO,
  EnabledEmailSettingDTO,
  UpdateEmailSettingsDTO,
} from './dto';

@Controller('/email-config')
export class EmailConfigController {
  constructor(private emailConfigService: EmailConfigService) {}

  @Get('/')
  emailSettings(@UserId() userId: string) {
    return this.emailConfigService.emailSettings(userId);
  }

  @Post('/')
  addEmailSettings(
    @UserId() userId: string,
    @Body() data: CreateEmailSettingsDTO,
  ) {
    return this.emailConfigService.addEmailSettings(userId, data);
  }

  @Patch('/')
  updateEmailSettings(
    @UserId() userId: string,
    @Body() data: UpdateEmailSettingsDTO,
  ) {
    return this.emailConfigService.updateEmailSettings(userId, data);
  }

  @Patch('/enable')
  enabledEmailSetting(@Body() data: EnabledEmailSettingDTO) {
    return this.emailConfigService.enabledEmailSetting(data);
  }

  @Get('/templates')
  templates(@UserId() userId: string) {
    return this.emailConfigService.templates(userId);
  }

  @Get('/lists')
  lists(@UserId() userId: string) {
    return this.emailConfigService.lists(userId);
  }
}
