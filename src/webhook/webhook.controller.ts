import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
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

  @Patch('/shopify/register')
  registerWebhooks(@UserId() userId: string) {
    return this.webhookService.registerWebhooks(userId);
  }

  @Public()
  @Post('/shopify/uninstall')
  shopifyAppUninstalled(@Body() data: any) {
    return this.webhookService.shopifyAppUninstalled(data);
  }

  @Public()
  @Post('/shopify/checkout-created')
  shopifyCheckoutCreated(@Body() data: any) {
    return this.webhookService.shopifyCheckoutCreated(data);
  }

  @Public()
  @Post('/shopify/cart-created')
  shopifyCartCreated(@Body() data: any) {
    return this.webhookService.shopifyCartCreated();
  }

  @Public()
  @Post('/shopify/checkout-updated')
  shopifyCheckoutUpdated(@Body() data: any) {
    return this.webhookService.shopifyCheckoutUpdated(data);
  }

  @Public()
  @Post('/shopify/order-created')
  shopifyOrderCreated(@Body() data: any) {
    return this.webhookService.shopifyOrderCreated();
  }

  @Public()
  @Post('/shopify/order-updated')
  shopifyOrderUpdated(@Body() data: any) {
    return this.webhookService.shopifyOrderUpdated();
  }
}
