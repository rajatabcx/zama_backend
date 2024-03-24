import { Global, Module } from '@nestjs/common';
import { AmpService } from './amp.service';
import { AmpController } from './amp.controller';

@Global()
@Module({
  controllers: [AmpController],
  providers: [AmpService],
  exports: [AmpService],
})
export class AmpModule {}
