import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class CronService {
  //   constructor() {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleSendTopScoreFirst() {
    console.log('Every hour cron job');
    const date = new Date();
    console.log(`Time ${date.toISOString()}`);
  }
}
