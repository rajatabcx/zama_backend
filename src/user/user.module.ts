import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ShopifyModule } from 'src/shopify/shopify.module';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [ShopifyModule],
})
export class UserModule {}
