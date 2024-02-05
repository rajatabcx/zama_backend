import { Module } from '@nestjs/common';
import { ShopifyService } from './shopify.service';
import { ShopifyController } from './shopify.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  controllers: [ShopifyController],
  providers: [ShopifyService],
  imports: [HttpModule],
})
export class ShopifyModule {}
