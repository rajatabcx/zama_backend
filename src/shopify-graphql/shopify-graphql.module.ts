import { Global, Module } from '@nestjs/common';
import { ShopifyGraphqlService } from './shopify-graphql.service';

@Global()
@Module({
  providers: [ShopifyGraphqlService],
  exports: [ShopifyGraphqlService],
})
export class ShopifyGraphqlModule {}
