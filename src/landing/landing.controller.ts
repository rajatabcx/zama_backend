import { Body, Controller, Post } from '@nestjs/common';
import { LandingService } from './landing.service';
import { Public } from 'src/guards';
import { AddToNewsLetterDTO, ContactSupportDTO, DemoEmailDTO } from './dto';

@Public()
@Controller('/landing')
export class LandingController {
  constructor(private readonly landingService: LandingService) {}

  @Post('/contact-support')
  contactSupport(@Body() data: ContactSupportDTO) {
    return this.landingService.contactSupport(data);
  }

  @Public()
  @Post('/demo')
  demoEmail(@Body() data: DemoEmailDTO) {
    return this.landingService.demoEmail(data);
  }

  @Public()
  @Post('/subscribe-newsletter')
  addToNewsLetter(@Body() data: AddToNewsLetterDTO) {
    return this.landingService.addToNewsLetter(data);
  }
}
