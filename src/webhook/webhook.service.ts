import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommonService } from 'src/common/common.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class WebhookService {
  constructor(
    private common: CommonService,
    private config: ConfigService,
    private prisma: PrismaService,
  ) {}

  async shopifyWebhook(userId: string) {
    try {
      const shopifyObj = await this.common.shopifyObjectForShop(userId);

      if (!shopifyObj.connected)
        return {
          data: { connected: false },
          message: 'SUCCESS',
          statusCode: 200,
        };
      const { shopifyStore } = shopifyObj;

      return {
        data: { webhookRegistered: shopifyStore.webhookRegistered },
        message: 'SUCCESS',
        statusCode: 200,
      };
    } catch (err) {
      this.common.generateErrorResponse(err, 'Shopify Webhook');
    }
  }

  async registerWebhooks(userId: string) {
    try {
      const shopifyObj = await this.common.shopifyObjectForShop(userId);

      if (!shopifyObj.connected)
        return {
          data: { connected: false },
          message: 'SUCCESS',
          statusCode: 200,
        };
      const { shopify } = shopifyObj;

      const baseUrl = this.config.get('BACKEND_URL');

      //   for deleting store from backend
      const uninstallWebhook = shopify.webhook.create({
        topic: 'app/uninstalled',
        address: `${baseUrl}/webhook/shopify/uninstall`,
        format: 'json',
      });

      //   to store checkout info for future reference if order is done or not
      const createCheckoutWebhook = shopify.webhook.create({
        topic: 'checkouts/create',
        address: `${baseUrl}/webhook/shopify/checkout-created`,
        format: 'json',
      });

      //   to update the checkout and check the time gap, if more than a day then trigger email
      const updateCheckoutWebhook = shopify.webhook.create({
        topic: 'checkouts/update',
        address: `${baseUrl}/webhook/shopify/checkout-updated`,
        format: 'json',
      });

      //   to check if any abandoned checkout is ordered or not
      const orderCreateWebhook = shopify.webhook.create({
        topic: 'orders/create',
        address: `${baseUrl}/webhook/shopify/order-created`,
        format: 'json',
      });

      //   on order fulfillment for review also for selling top seller
      const orderUpdateWebhook = shopify.webhook.create({
        topic: 'orders/updated',
        address: `${baseUrl}/webhook/shopify/order-updated`,
        format: 'json',
      });

      //   cart create, check if customer is coming or not
      const cartCreateWebhook = shopify.webhook.create({
        topic: 'carts/create',
        address: `${baseUrl}/webhook/shopify/cart-created`,
        format: 'json',
      });

      await Promise.all([
        uninstallWebhook,
        createCheckoutWebhook,
        orderCreateWebhook,
        updateCheckoutWebhook,
        orderUpdateWebhook,
        cartCreateWebhook,
      ]);
      await this.prisma.shopifyStore.update({
        where: {
          userId,
        },
        data: {
          webhookRegistered: true,
        },
      });
    } catch (err) {
      this.common.generateErrorResponse(err, 'Shopify sWebhooks');
    }
  }

  async shopifyAppUninstalled(data: any) {
    console.log('App Uninstalled');
    return {};
  }

  async shopifyCartCreated(data: any) {
    console.log('Checkout Created');
    return {};
  }

  async shopifyCheckoutCreated(data: any) {
    console.log('Checkout Created');
    return {};
  }

  async shopifyCheckoutUpdated(data: any) {
    console.log('Checkout Updated');
    return {};
  }

  async shopifyOrderCreated(data: any) {
    console.log('Order Created');
    return {};
  }

  async shopifyOrderUpdated(data: any) {
    console.log('Order Updated');
    return {};
  }
}
