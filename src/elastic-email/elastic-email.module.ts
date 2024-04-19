import { Global, Module } from '@nestjs/common';
import { ElasticEmailService } from './elastic-email.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  providers: [ElasticEmailService],
  imports: [HttpModule],
  exports: [ElasticEmailService],
})
export class ElasticEmailModule {}
