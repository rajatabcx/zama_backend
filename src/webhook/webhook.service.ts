import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommonService } from 'src/common/common.service';
import { EcommerecePlatform } from 'src/enum';
import { Integration } from 'src/interfaces';
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

  async shopifyAppUninstalled(shopName: string, _data: any) {
    console.log('App Uninstalled');
    console.log(shopName);

    const shopifyStore = await this.prisma.shopifyStore.findUnique({
      where: {
        name: shopName,
      },
      select: {
        id: true,
        userId: true,
        name: true,
        accessToken: true,
        user: {
          select: {
            integrations: true,
          },
        },
      },
    });

    if (!shopifyStore) {
      console.log('Store not found');
      return {};
    }

    const shopify = await this.common.shopifyObject(
      shopifyStore.name,
      shopifyStore.accessToken,
    );

    // Delete all the registered webhooks
    const list = await shopify.webhook.list();
    const promises = [];
    for (const webhook of list) {
      promises.push(shopify.webhook.delete(webhook.id));
    }

    await Promise.all(promises);

    const updatedIntegrations = shopifyStore.user
      .integrations as unknown as Integration;

    delete updatedIntegrations[EcommerecePlatform.SHOPIFY];

    const checkoutDeletePromise = this.prisma.checkout.deleteMany({
      where: {
        shopifyStoreId: shopifyStore.id,
      },
    });

    const productUpsellDeletePromise = this.prisma.productUpsell.deleteMany({
      where: {
        userId: shopifyStore.userId,
      },
    });

    const storeDeletePromise = this.prisma.shopifyStore.delete({
      where: {
        id: shopifyStore.id,
      },
    });

    const userPromise = this.prisma.user.update({
      data: {
        integrations: updatedIntegrations,
      },
      where: {
        id: shopifyStore.userId,
      },
    });

    await this.prisma.$transaction([
      checkoutDeletePromise,
      storeDeletePromise,
      productUpsellDeletePromise,
      userPromise,
    ]);

    return {};
  }

  async shopifyCheckoutCreated(shopName: string, data: any) {
    console.log(
      `\Checkout created from ${data.landing_site} with checkout token ${data.token}`,
    );

    if (data.landing_site.includes('/api/2023-10/graphql.json')) {
      console.log('Ignoring checkout creation as its coming from api');
      return {};
    }

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
        id: btoa(resData.checkoutCreate.checkout.id),
        webUrl: resData.checkoutCreate.checkout.webUrl,
      };

      const regex = /\/([^\/?#]+)\?/;
      const match = regex.exec(resData.checkoutCreate.checkout.id);
      const storefrontCheckoutToken = match && match[1]; // Extracted value

      console.log('creating record in database');
      await this.prisma.checkout.create({
        data: {
          shopifyAdminCheckoutToken: data.token,
          shopifyStorefrontCheckoutToken: storefrontCheckoutToken,
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

  async shopifyCheckoutUpdated(shopName: string, data: any) {
    console.log(
      `\checkout updated from ${data.landing_site} with checkout token ${data.token}`,
    );
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
        shopifyAdminCheckoutToken: data.token,
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

      await this.shopifyGraphql.checkoutEmailUpdate(
        shopifyStoreFront,
        checkoutDB.shopifyStorefrontCheckoutId,
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

  async shopifyOrderCreated(shopName: string, data: any) {
    console.log(
      `\norder created from ${data.landing_site} with checkout token ${data.checkout_token}`,
    );
    if (data.landing_site.includes('/api/2023-10/graphql.json')) {
      console.log('Ignoring checkout creation as its coming from api');
      return {};
    }

    const checkout = await this.prisma.checkout.findUnique({
      where: {
        shopifyStorefrontCheckoutToken: data.checkout_token,
      },
      select: {
        orderPlaced: true,
      },
    });

    if (!checkout) {
      console.log('Checkout not found ignoring');
      return;
    }

    if (checkout.orderPlaced) {
      console.log('Checkout already updated with order details');
      return;
    }

    try {
      await this.prisma.checkout.update({
        where: {
          shopifyStorefrontCheckoutToken: data.checkout_token,
        },
        data: {
          orderPlaced: true,
          shopifyOrderId: data.id,
          shopifyOrderGraphqlId: btoa(data.admin_graphql_api_id),
        },
      });
    } catch (err) {
      this.common.generateErrorResponse(err, 'Order');
    }

    return {};
  }

  async shopifyOrderUpdated(shopName: string, data: any) {
    console.log('Order Updated');

    const checkout = await this.prisma.checkout.findUnique({
      where: {
        shopifyStorefrontCheckoutToken: data.checkout_token,
      },
      select: {
        orderFulFilled: true,
      },
    });

    if (!checkout) {
      console.log('Checkout not found ignoring');
      return {};
    }

    if (checkout.orderFulFilled) {
      console.log('Order already fulfilled ignores');
      return;
    }

    if (data.fulfillment_status !== 'fulfilled') {
      console.log('Order is not fulfilled yet, don"t update anything');
      return;
    }

    console.log('Order found and not fulfilles updating it');
    try {
      await this.prisma.checkout.update({
        where: {
          shopifyStorefrontCheckoutToken: data.checkout_token,
        },
        data: {
          orderFulFilled: !!data.fulfillment_status,
        },
      });
    } catch (err) {
      this.common.generateErrorResponse(err, 'Order');
    }
  }
}
