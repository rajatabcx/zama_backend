import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommonService } from 'src/common/common.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ShopifyGraphqlService } from 'src/shopify-graphql/shopify-graphql.service';

@Injectable()
export class WebhookService {
  constructor(
    private common: CommonService,
    private config: ConfigService,
    private prisma: PrismaService,
    private shopifyGraphql: ShopifyGraphqlService,
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
    console.log('App Uninstalled');

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

  async shopifyCheckoutCreated(data: any) {
    console.log(`\n\ncheckout created from ${data.landing_site}`);

    if (data.landing_site.includes('/api/2023-10/graphql.json')) {
      console.log('Ignoring checkout creation as its coming from api');
      return {};
    }

    const url = new URL(data.abandoned_checkout_url);
    const shopName = url.host;

    console.log('fetching the checkout and store data');
    const checkoutPromise = this.prisma.checkout.findUnique({
      where: {
        shopifyAdminCheckoutToken: data.token,
      },
      select: {
        shopifyStore: {
          select: {
            storeFrontAccessToken: true,
            name: true,
          },
        },
      },
    });

    const storePromise = this.prisma.shopifyStore.findUnique({
      where: {
        name: shopName,
      },
      select: {
        storeFrontAccessToken: true,
        name: true,
      },
    });

    const [checkout, store] = await this.prisma.$transaction([
      checkoutPromise,
      storePromise,
    ]);

    if (checkout) {
      console.log('Ignoring it, as checkout already exist');
      return {};
    }

    try {
      console.log('Not ignoring it');

      const shopifyStoreFront = this.common.shopifyStoreFrontObject(
        store.name,
        store.storeFrontAccessToken,
      );

      const lineItems = data.line_items.map((lineItem) => ({
        variantId: btoa(`gid://shopify/ProductVariant/${lineItem.key}`),
        quantity: lineItem.quantity,
      }));

      // created a new storefront checkout
      console.log('creating storefront checkout');
      const { data: resData } = await this.shopifyGraphql.createCheckout(
        shopifyStoreFront,
        lineItems,
      );

      const storefrontCheckoutData = {
        id: resData.checkoutCreate.checkout.id,
        webUrl: resData.checkoutCreate.checkout.webUrl,
      };

      const storefrontUrl = new URL(storefrontCheckoutData.webUrl);
      const storeFrontToken = storefrontUrl.pathname
        .split('checkouts/')[1]
        .replace('/recover', '');

      console.log('creating record in database');
      await this.prisma.checkout.create({
        data: {
          shopifyAdminCheckoutToken: data.token,
          shopifyStoreFrontCheckoutToken: storeFrontToken,
          shopifyAbandonedCheckoutURL: storefrontCheckoutData.webUrl,
          shopifyStorefrontCheckoutId: storefrontCheckoutData.id,
          shopifyStore: {
            connect: {
              name: shopName,
            },
          },
        },
        select: {
          id: true,
        },
      });
      console.log('Done\n\n');
      return {};
    } catch (err) {
      this.common.generateErrorResponse(err, 'Shopify Checkout');
    }
    return {};
  }

  async shopifyCheckoutUpdated(data: any) {
    console.log('update');
    console.log(data);
    //for address check if there is customer available then attach the checkout with customer or else update the shipping address with billing_address
    // billing adress
    // billing_address: {
    //   first_name: 'Rajat',
    //   address1: 'Durga Nagar North Dumdum',
    //   phone: null,
    //   city: 'Kolkata',
    //   zip: '700065',
    //   province: 'West Bengal',
    //   country: 'India',
    //   last_name: 'Mondal',
    //   address2: null,
    //   company: null,
    //   latitude: null,
    //   longitude: null,
    //   name: 'Rajat Mondal',
    //   country_code: 'IN',
    //   province_code: 'WB'
    // }
    // customer
    // customer:{
    //   id: 6500316905583,
    // }

    if (!data.email) {
      console.log('email not found ignoring');
      return {};
    }

    console.log('Email found');

    const checkout = await this.prisma.checkout.findFirst({
      where: {
        OR: [
          { shopifyStoreFrontCheckoutToken: data.token },
          { shopifyAdminCheckoutToken: data.token },
        ],
      },
      select: {
        id: true,
        email: true,
      },
    });

    if (!checkout) {
      console.log('Checkout not found ignore');
      return {};
    }

    if (!!checkout.email && checkout.email === data.email) {
      console.log(
        'Email already exists and same as incoming email so ignoring it',
      );
      return {};
    }

    try {
      console.log('Updating with email');
      const checkoutDB = await this.prisma.checkout.update({
        where: {
          id: checkout.id,
        },
        data: {
          email: data.email,
        },
        select: {
          shopifyAdminCheckoutToken: true,
          shopifyStorefrontCheckoutId: true,
          shopifyStore: {
            select: {
              name: true,
              storeFrontAccessToken: true,
            },
          },
        },
      });
      const shopifyStoreFront = this.common.shopifyStoreFrontObject(
        checkoutDB.shopifyStore.name,
        checkoutDB.shopifyStore.storeFrontAccessToken,
      );
      const checkoutId = btoa(checkoutDB.shopifyStorefrontCheckoutId);
      await this.shopifyGraphql.checkoutEmailUpdate(
        shopifyStoreFront,
        checkoutId,
        data.email,
      );
    } catch (err) {
      this.common.generateErrorResponse(err, 'Shopify Checkout');
    }
    // return {};
  }

  async shopifyCartCreated() {
    // console.log('Cart Created');
    // console.log(data);
    return {};
  }

  async shopifyOrderCreated() {
    // console.log('Order Created');
    // console.log(data);
    return {};
  }

  async shopifyOrderUpdated() {
    // console.log('Order Updated');
    // console.log(data);
    return {};
  }
}
