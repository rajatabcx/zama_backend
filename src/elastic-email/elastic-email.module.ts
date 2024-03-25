import { Global, Module } from '@nestjs/common';
import { ElasticEmailService } from './elastic-email.service';
import { HttpModule } from '@nestjs/axios';

@Global()
@Module({
  providers: [ElasticEmailService],
  exports: [ElasticEmailService],
  imports: [HttpModule],
})
export class ElasticEmailModule {}
