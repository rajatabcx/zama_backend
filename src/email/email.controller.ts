import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { UserId } from 'src/decorators';
import { EmailService } from './email.service';
import { CreateEmailSettingsDTO, UpdateEmailSettingsDTO } from './dto';

@Controller('/email')
export class EmailController {
  constructor(private emailService: EmailService) {}

  @Post('/')
  addEmailSettings(
    @UserId() userId: string,
    @Body() data: CreateEmailSettingsDTO,
  ) {
    return this.emailService.addEmailSettings(userId, data);
  }

  @Patch('/')
  updateEmailSettings(
    @UserId() userId: string,
    @Body() data: UpdateEmailSettingsDTO,
  ) {
    return this.emailService.updateEmailSettings(userId, data);
  }

  @Get('/templates')
  emailTemplates(@UserId() userId: string) {
    return this.emailService.emailTemplates(userId);
  }
}
