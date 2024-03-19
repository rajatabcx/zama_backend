import { Module } from '@nestjs/common';
import { ElasticEmailService } from './elastic-email.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  providers: [ElasticEmailService],
  exports: [ElasticEmailService],
  imports: [HttpModule],
})
export class ElasticEmailModule {}
