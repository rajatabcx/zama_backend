import { Module } from '@nestjs/common';
import { EmailConfigService } from './email-config.service';
import { EmailConfigController } from './email-config.controller';

@Module({
  controllers: [EmailConfigController],
  providers: [EmailConfigService],
})
export class EmailConfigModule {}
