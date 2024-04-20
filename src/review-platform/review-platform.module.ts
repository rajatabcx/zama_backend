import { Module } from '@nestjs/common';
import { ReviewPlatformService } from './review-platform.service';
import { ReviewPlatformController } from './review-platform.controller';
import { JudgeMeModule } from 'src/judge-me/judge-me.module';
import { YotpoModule } from 'src/yotpo/yotpo.module';

@Module({
  controllers: [ReviewPlatformController],
  providers: [ReviewPlatformService],
  exports: [ReviewPlatformService],
  imports: [JudgeMeModule, YotpoModule],
})
export class ReviewPlatformModule {}
