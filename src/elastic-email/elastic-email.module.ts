import { Module } from '@nestjs/common';
import { ElasticEmailService } from './elastic-email.service';

@Module({
  providers: [ElasticEmailService],
  exports: [ElasticEmailService],
})
export class ElasticEmailModule {}
