import { Module } from '@nestjs/common';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { ElasticEmailModule } from 'src/elastic-email/elastic-email.module';

@Module({
  controllers: [EmailController],
  providers: [EmailService],
  imports: [ElasticEmailModule],
})
export class EmailModule {}
