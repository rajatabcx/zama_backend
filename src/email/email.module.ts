import { Global, Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { ElasticEmailModule } from 'src/elastic-email/elastic-email.module';

@Global()
@Module({
  providers: [EmailService],
  exports: [EmailService],
  imports: [ElasticEmailModule],
})
export class EmailModule {}
