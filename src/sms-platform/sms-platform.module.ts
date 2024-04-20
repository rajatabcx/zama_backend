import { Module } from '@nestjs/common';
import { SmsPlatformService } from './sms-platform.service';
import { SmsPlatformController } from './sms-platform.controller';
import { AttentiveModule } from 'src/attentive/attentive.module';
import { PostscriptModule } from 'src/postscript/postscript.module';

@Module({
  controllers: [SmsPlatformController],
  providers: [SmsPlatformService],
  imports: [AttentiveModule, PostscriptModule],
})
export class SmsPlatformModule {}
