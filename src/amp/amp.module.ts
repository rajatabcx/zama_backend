import { Global, Module } from '@nestjs/common';
import { AmpService } from './amp.service';
import { AmpController } from './amp.controller';
import { ReviewPlatformModule } from 'src/review-platform/review-platform.module';

@Global()
@Module({
  controllers: [AmpController],
  providers: [AmpService],
  exports: [AmpService],
  imports: [ReviewPlatformModule],
})
export class AmpModule {}
