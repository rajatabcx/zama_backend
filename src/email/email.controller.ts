import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { UserId } from 'src/decorators';
import { EmailService } from './email.service';
import {
  AddToNewsLetterDTO,
  ContactSupportDTO,
  CreateEmailSettingsDTO,
  DemoEmailDTO,
  UpdateEmailSettingsDTO,
} from './dto';
import { Public } from 'src/guards';

@Controller('/email')
export class EmailController {
  constructor(private emailService: EmailService) {}

  @Get('/')
  emailSettings(@UserId() userId: string) {
    return this.emailService.emailSettings(userId);
  }

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

  @Get('/lists')
  emailLists(@UserId() userId: string) {
    return this.emailService.emailLists(userId);
  }

  @Post('/send-checkout-email/:checkoutId')
  checkoutEmail(
    @UserId() userId: string,
    @Param('checkoutId') checkoutId: string,
  ) {
    return this.emailService.checkoutEmail(userId, checkoutId);
  }

  @Public()
  @Post('/contact-support')
  contactSupport(@Body() data: ContactSupportDTO) {
    return this.emailService.contactSupport(data);
  }

  @Public()
  @Post('/demo')
  demoEmail(@Body() data: DemoEmailDTO) {
    return this.emailService.demoEmail(data);
  }

  @Public()
  @Post('/subscribe-newsletter')
  addToNewsLetter(@Body() data: AddToNewsLetterDTO) {
    return this.emailService.addToNewsLetter(data);
  }
}
