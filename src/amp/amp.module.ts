import { Module } from '@nestjs/common';
import { AmpService } from './amp.service';
import { AmpController } from './amp.controller';
import { ShopifyGraphqlModule } from 'src/shopify-graphql/shopify-graphql.module';

@Module({
  controllers: [AmpController],
  providers: [AmpService],
  imports: [ShopifyGraphqlModule],
})
export class AmpModule {}
