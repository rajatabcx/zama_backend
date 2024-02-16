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

      // Delete call the registered webhooks
      const list = await shopify.webhook.list();
      const promises = [];
      for (const webhook of list) {
        promises.push(shopify.webhook.delete(webhook.id));
      }

      await Promise.all(promises);

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
      this.common.generateErrorResponse(err, 'Shopify Webhooks');
    }
  }

  async shopifyAppUninstalled(data: any) {
    // console.log('App Uninstalled');

    const shopifyStore = await this.prisma.shopifyStore.findUnique({
      where: {
        name: `${data.name}.myshopify.com`,
      },
      select: {
        id: true,
      },
    });

    if (!shopifyStore) {
      console.log('Store not found');
      return {};
    }

    const checkoutDeletePromise = this.prisma.checkout.deleteMany({
      where: {
        shopifyStoreId: shopifyStore.id,
      },
    });

    const storeDeletePromise = this.prisma.shopifyStore.deleteMany({
      where: {
        id: shopifyStore.id,
      },
    });

    await this.prisma.$transaction([checkoutDeletePromise, storeDeletePromise]);

    return {};
  }

  async shopifyCartCreated(data: any) {
    // console.log('Cart Created');
    // console.log(data);
    return {};
  }

  async shopifyCheckoutCreated(data: any) {
    console.log('create');
    console.log(data);
    try {
      const url = new URL(data.abandoned_checkout_url);
      const shopName = url.host;

      await this.prisma.checkout.create({
        data: {
          shopifyCheckoutId: data.id,
          shopifyCartToken: data.cart_token,
          shopifyCheckoutToken: data.token,
          shopifyAbandonedCheckoutURL: data.abandoned_checkout_url,
          ShopifyStore: {
            connect: {
              name: shopName,
            },
          },
        },
      });
      return {};
    } catch (err) {
      this.common.generateErrorResponse(err, 'Shopify Checkout');
    }
    return {};
  }

  async shopifyCheckoutUpdated(data: any) {
    console.log('update');
    console.log(data);
    const checkout = await this.prisma.checkout.findUnique({
      where: {
        shopifyCheckoutId: data.id,
      },
      select: {
        id: true,
      },
    });

    if (!checkout) {
      return {};
    }

    try {
      await this.prisma.checkout.update({
        where: {
          shopifyCheckoutId: data.id,
        },
        data: {
          shopifyCheckoutId: data.id,
          shopifyCartToken: data.cart_token,
          shopifyCheckoutToken: data.token,
          shopifyAbandonedCheckoutURL: data.abandoned_checkout_url,
        },
      });
    } catch (err) {
      this.common.generateErrorResponse(err, 'Shopify Checkout');
    }
    return {};
  }

  async shopifyOrderCreated(data: any) {
    // console.log('Order Created');
    // console.log(data);
    return {};
  }

  async shopifyOrderUpdated(data: any) {
    // console.log('Order Updated');
    // console.log(data);
    return {};
  }
}
