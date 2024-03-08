import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies';
import { JwtModule } from '@nestjs/jwt';
import { ElasticEmailModule } from 'src/elastic-email/elastic-email.module';

@Module({
  imports: [JwtModule.register({}), ElasticEmailModule],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
