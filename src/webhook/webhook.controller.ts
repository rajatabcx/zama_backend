import { Body, Controller, Get, Patch, Post, Headers } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { UserId } from 'src/decorators';
import { Public } from 'src/guards';

@Controller('/webhook')
export class WebhookController {
  constructor(private webhookService: WebhookService) {}

  @Get('/shopify')
  shopifyWebhook(@UserId() userId: string) {
    return this.webhookService.shopifyWebhook(userId);
  }

  @Patch('/shopify')
  registerWebhooks(@UserId() userId: string) {
    return this.webhookService.registerWebhooks(userId);
  }

  @Public()
  @Post('/shopify/uninstall')
  shopifyAppUninstalled(
    @Headers('X-Shopify-Shop-Domain') shopName: string,
    @Body() data: any,
  ) {
    return this.webhookService.shopifyAppUninstalled(shopName, data);
  }

  @Public()
  @Post('/shopify/checkout-created')
  shopifyCheckoutCreated(
    @Headers('X-Shopify-Shop-Domain') shopName: string,
    @Body() data: any,
  ) {
    return this.webhookService.shopifyCheckoutCreated(shopName, data);
  }

  @Public()
  @Post('/shopify/checkout-updated')
  shopifyCheckoutUpdated(
    @Headers('X-Shopify-Shop-Domain') shopName: string,
    @Body() data: any,
  ) {
    return this.webhookService.shopifyCheckoutUpdated(shopName, data);
  }

  @Public()
  @Post('/shopify/cart-created')
  shopifyCartCreated() {
    return this.webhookService.shopifyCartCreated();
  }

  @Public()
  @Post('/shopify/order-created')
  shopifyOrderCreated(
    @Headers('X-Shopify-Shop-Domain') shopName: string,
    @Body() data: any,
  ) {
    return this.webhookService.shopifyOrderCreated(shopName, data);
  }

  @Public()
  @Post('/shopify/order-updated')
  shopifyOrderUpdated(
    @Headers('X-Shopify-Shop-Domain') shopName: string,
    @Body() data: any,
  ) {
    return this.webhookService.shopifyOrderUpdated(shopName, data);
  }
}
