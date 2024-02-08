import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './guards';

@Controller('/')
export class AppController {
  constructor(private appService: AppService) {}

  @Public()
  @Get('/')
  ping() {
    return this.appService.ping();
  }
}
