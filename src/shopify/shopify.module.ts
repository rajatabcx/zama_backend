import { Module } from '@nestjs/common';
import { ShopifyService } from './shopify.service';
import { ShopifyController } from './shopify.controller';
import { HttpModule } from '@nestjs/axios';
import { ElasticEmailModule } from 'src/elastic-email/elastic-email.module';

@Module({
  controllers: [ShopifyController],
  providers: [ShopifyService],
  imports: [HttpModule, ElasticEmailModule],
})
export class ShopifyModule {}
