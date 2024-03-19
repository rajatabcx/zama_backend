import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ElasticEmailModule } from 'src/elastic-email/elastic-email.module';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [ElasticEmailModule],
})
export class UserModule {}
