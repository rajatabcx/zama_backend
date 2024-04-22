import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CreateProductUpsellDTO,
  UpdateProductUpsellProductsDTO,
  UpdateUserDTO,
} from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CommonService } from 'src/common/common.service';
import { EmailServiceProvider, Prisma, UpsellStatus } from '@prisma/client';
import { UpdateProductUpsellListDTO } from './dto/updateProductUpsellList.dto';
import { ShopifyGraphqlService } from 'src/shopify-graphql/shopify-graphql.service';
import { SelectedProducts } from 'src/shopify/type';
import { EmailTransactionalMessageData } from '@elasticemail/elasticemail-client-ts-axios';
import {
  checkoutFallbackTemplate,
  checkoutTemplate,
  reviewFallbackTemplate,
  reviewTemplate,
  upsellEmailTemplate,
  upsellFallbackTemplate,
} from 'src/data';
import { ConfigService } from '@nestjs/config';
import { AmpService } from 'src/amp/amp.service';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private common: CommonService,
    private shopifyGraphql: ShopifyGraphqlService,
    private config: ConfigService,
    private amp: AmpService,
    private email: EmailService,
  ) {}

  async profile(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          name: true,
          email: true,
          shopifyStore: {
            select: {
              name: true,
            },
          },
        },
      });
      return { data: user, message: 'SUCCESS', statusCode: 200 };
    } catch (err) {
      this.common.generateErrorResponse(err, 'User');
    }
  }

  async update(userId: string, data: UpdateUserDTO) {
    try {
      const user = await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          name: data.name,
        },
      });
      return { data: user, message: 'SUCCESS', statusCode: 200 };
    } catch (err) {
      this.common.generateErrorResponse(err, 'User');
    }
  }

  async integrations(userId: string) {
    try {
      const data = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          integrations: true,
        },
      });
      const integrations = data.integrations;
      return {
        data: integrations,
        statusCode: 200,
        message: 'SUCCESS',
      };
    } catch (err) {
      this.common.generateErrorResponse(err, 'Integrations');
    }
  }

  async productUpsells(userId: string, page: number, limit: number) {
    try {
      const productUpsellsPromise = this.prisma.productUpsell.findMany({
        where: {
          userId,
        },
        select: {
          id: true,
          listName: true,
          name: true,
          emailNotSent: true,
          emailSent: true,
          discountId: true,
          status: true,
          createdAt: true,
        },
        take: limit,
        skip: (page - 1) * limit,
      });
      const totalPromise = this.prisma.productUpsell.count({
        where: {
          userId,
        },
      });

      const [productUpsells, total] = await this.prisma.$transaction([
        productUpsellsPromise,
        totalPromise,
      ]);

      const { hasNextPage, hasPrevPage, nextPage, prevPage, totalPages } =
        this.common.calculatePaginationDetails(total, page, limit);

      return {
        data: {
          productUpsells,
          total,
          hasNextPage,
          hasPrevPage,
          nextPage,
          prevPage,
          totalPages,
        },
        statusCode: 200,
        message: 'SUCCESS',
      };
    } catch (err) {
      this.common.generateErrorResponse(err, 'Checkout');
    }
  }

  async checkouts(userId: string, page: number, limit: number) {
    try {
      const shopifyObj = await this.common.shopifyObjectForShop(userId);

      if (!shopifyObj.connected)
        return {
          data: { connected: false },
          message: 'SUCCESS',
          statusCode: 200,
        };

      const checkoutsPromise = this.prisma.checkout.findMany({
        where: {
          shopifyStore: {
            userId,
          },
        },
        select: {
          id: true,
          email: true,
          orderFulFilled: true,
          createdAt: true,
          reviewEmailSent: true,
          orderPlaced: true,
          checkoutEmailSent: true,
        },
        take: limit,
        skip: (page - 1) * limit,
        orderBy: {
          createdAt: 'desc',
        },
      });
      const totalPromise = this.prisma.checkout.count({
        where: {
          shopifyStore: {
            userId,
          },
        },
      });

      const [checkouts, total] = await this.prisma.$transaction([
        checkoutsPromise,
        totalPromise,
      ]);

      const { hasNextPage, hasPrevPage, nextPage, prevPage, totalPages } =
        this.common.calculatePaginationDetails(total, page, limit);

      return {
        data: {
          checkouts,
          total,
          hasNextPage,
          hasPrevPage,
          nextPage,
          prevPage,
          totalPages,
          connected: true,
        },
        statusCode: 200,
        message: 'SUCCESS',
      };
    } catch (err) {
      this.common.generateErrorResponse(err, 'Checkout');
    }
  }

  async orders(userId: string, limit: string, page_info: string) {
    try {
      const params = page_info ? { limit, page_info } : { limit };
      const shopifyObj = await this.common.shopifyObjectForShop(userId);

      if (!shopifyObj.connected)
        return {
          data: { connected: false },
          message: 'SUCCESS',
          statusCode: 200,
        };

      const orders = await shopifyObj.shopify.order.list({
        status: 'any',
        ...params,
      });

      return {
        data: {
          orders,
          nextPageParams: orders.nextPageParameters || null,
          prevPageParams: orders.previousPageParameters || null,
        },
        message: 'SUCCESS',
        statusCode: 200,
      };
    } catch (err) {
      this.common.generateErrorResponse(err, 'Checkout');
    }
  }

  async createProductUpsells(userId: string, data: CreateProductUpsellDTO) {
    try {
      const res = await this.prisma.productUpsell.create({
        data: {
          name: data.name,
          userId,
        },
        select: {
          id: true,
          name: true,
        },
      });
      return { data: { id: res.id }, message: 'SUCCESS', statusCode: 200 };
    } catch (err) {
      this.common.generateErrorResponse(err, 'Product Upsell');
    }
  }

  async productUpsellsAddProducts(
    productUpsellId: string,
    data: UpdateProductUpsellProductsDTO,
  ) {
    try {
      const updatedData = data.productIds as unknown as Prisma.InputJsonValue[];
      await this.prisma.productUpsell.update({
        where: {
          id: productUpsellId,
        },
        data: {
          productIds: updatedData,
        },
      });
      return { data: {}, message: 'SUCCESS', statusCode: 200 };
    } catch (err) {
      this.common.generateErrorResponse(err, 'Product Upsell');
    }
  }

  async productUpsellsAddListName(
    productUpsellId: string,
    data: UpdateProductUpsellListDTO,
  ) {
    try {
      await this.prisma.productUpsell.update({
        where: {
          id: productUpsellId,
        },
        data: {
          listName: data.listName,
        },
      });
      return { data: {}, message: 'SUCCESS', statusCode: 200 };
    } catch (err) {
      this.common.generateErrorResponse(err, 'Product Upsell');
    }
  }

  async runProductUpsell(userId: string, productUpsellId: string) {
    const runningUpsells = await this.prisma.productUpsell.findMany({
      where: {
        userId,
        status: UpsellStatus.ONGOING,
      },
      select: {
        id: true,
      },
    });

    if (runningUpsells.length)
      throw new BadRequestException('Can run one upsell at a time');

    try {
      await this.prisma.productUpsell.update({
        where: {
          id: productUpsellId,
        },
        data: {
          status: UpsellStatus.ONGOING,
        },
      });
      this.productUpsellTasks(userId, productUpsellId);
      return { data: {}, message: 'SUCCESS', statusCode: 200 };
    } catch (err) {
      this.common.generateErrorResponse(err, 'Product Upsell');
    }
  }

  async productUpsellTasks(userId: string, productUpsellId: string) {
    try {
      const upsell = await this.prisma.productUpsell.update({
        where: {
          id: productUpsellId,
        },
        data: {
          status: UpsellStatus.COMPLETED,
        },
        select: {
          user: {
            select: {
              id: true,
              shopifyStore: {
                select: {
                  storeFrontAccessToken: true,
                  name: true,
                },
              },
              emailSettings: {
                take: 1,
                where: {
                  enabled: true,
                },
                select: {
                  emailServiceProvider: true,
                },
              },
            },
          },
          productIds: true,
          listName: true,
        },
      });

      const shopifyStorefrontClient = this.common.shopifyStoreFrontObject(
        upsell.user.shopifyStore.name,
        upsell.user.shopifyStore.storeFrontAccessToken,
      );

      const productIds = upsell.productIds as unknown as SelectedProducts;

      const lineItems = productIds.map((product) => ({
        variantId: btoa(`gid://shopify/ProductVariant/${product.variantId}`),
        quantity: 1,
      }));

      const emailService = this.email.createEmailService(
        upsell.user.emailSettings[0].emailServiceProvider,
      );

      const { data } = await emailService.usersFromList(
        upsell.user.id,
        upsell.listName,
        0,
        200,
      );
      const emailList = data.data.map((contact) => contact.email);

      for (const email of emailList) {
        const { data: resData } = await this.shopifyGraphql.createCheckout(
          shopifyStorefrontClient,
          lineItems,
        );

        const attr = {
          shopifyStorefrontCheckoutId: resData.checkoutCreate.checkout.id,
          checkoutURL: resData.checkoutCreate.checkout.webUrl,
        };
        const checkoutId = btoa(attr.shopifyStorefrontCheckoutId);

        await this.shopifyGraphql.checkoutEmailUpdate(
          shopifyStorefrontClient,
          checkoutId,
          email,
        );

        await this.productUpsellEmail(
          userId,
          email,
          productUpsellId,
          checkoutId,
          attr.checkoutURL,
          upsell.user.emailSettings[0].emailServiceProvider,
        );
      }
    } catch (err) {
      console.log('---Upsell Task Error---');
      console.log(err.response);
      console.log('---Upsell Task Error End---');
      await this.prisma.productUpsell.update({
        where: {
          id: productUpsellId,
        },
        data: {
          status: UpsellStatus.ERROR,
        },
      });
    }
  }

  async checkoutEmail(userId: string, checkoutId: string) {
    try {
      const checkout = await this.prisma.checkout.findUnique({
        where: {
          id: checkoutId,
        },
        select: {
          email: true,
          shopifyStorefrontCheckoutId: true,
          shopifyStore: {
            select: {
              user: {
                select: {
                  emailSettings: {
                    where: {
                      enabled: true,
                    },
                    select: {
                      emailServiceProvider: true,
                    },
                    take: 1,
                  },
                },
              },
            },
          },
        },
      });

      const checkoutDetails = await this.amp.checkoutEmailData(checkoutId);

      const productsHTML: string[] = checkoutDetails[0].items.map(
        (lineItem) => {
          const html = `
        <div class="product">
                        <div><img src="${lineItem.images[0].src}" height="60" width="60"></div>
                        <div class="productDetails">
                            <div style="margin:auto">${lineItem.title} &nbsp;&nbsp; x&nbsp;&nbsp; ${lineItem.quantity}</div>
                            <div style="margin:auto;margin-left:24px">${lineItem.price}</div>
                        </div>
                    </div>
                    `;
          return html;
        },
      );

      const emailMessageData: EmailTransactionalMessageData = {
        Recipients: {
          To: [checkout.email],
        },
        Content: {
          Subject:
            'Snow Way! Your Board Dreams Await - Complete Your Checkout!',
          Merge: {
            checkoutLink: `${this.config.get(
              'BACKEND_URL',
            )}/amp/shopify/checkout-email/${checkoutId}`,
            bestSellerLink: `${this.config.get(
              'BACKEND_URL',
            )}/amp/shopify/bestseller-email/${checkoutId}`,
            updateLineItemLink: `${this.config.get(
              'BACKEND_URL',
            )}/amp/shopify/checkout-email/update-line-item`,
            addLineItemLink: `${this.config.get(
              'BACKEND_URL',
            )}/amp/shopify/checkout-email/add-line-item`,
            removeLineItemLink: `${this.config.get(
              'BACKEND_URL',
            )}/amp/shopify/checkout-email/remove-line-item`,
            applyDiscountLink: `${this.config.get(
              'BACKEND_URL',
            )}/amp/shopify/checkout-email/apply-discount`,
            removeDiscountLink: `${this.config.get(
              'BACKEND_URL',
            )}/amp/shopify/checkout-email/remove-discount`,
            abandonedCheckoutURL: checkoutDetails[0].checkoutUrl,
          },
          Body: [
            {
              ContentType: 'AMP',
              Content: checkoutTemplate,
            },
            {
              ContentType: 'HTML',
              Content: checkoutFallbackTemplate.replace(
                '{{products}}',
                productsHTML.join('\n'),
              ),
            },
          ],
        },
      };

      const emailService = this.email.createEmailService(
        checkout.shopifyStore.user.emailSettings[0].emailServiceProvider,
      );
      await emailService.sendTransactionalEmail(userId, emailMessageData);

      await this.prisma.checkout.update({
        where: {
          id: checkoutId,
        },
        data: {
          checkoutEmailSent: true,
        },
      });

      return {
        data: {},
        message: 'SUCCESS',
        statusCode: 200,
      };
    } catch (err) {
      this.common.generateErrorResponse(err, 'Checkout email');
    }
  }

  async productUpsellEmail(
    userId: string,
    email: string,
    upsellId: string,
    checkoutId: string,
    checkoutUrl: string,
    emailServiceProvider: EmailServiceProvider,
  ) {
    try {
      const checkoutDetails = await this.amp.productUpsellEmailData(
        upsellId,
        checkoutId,
      );

      const productsHTML: string[] = checkoutDetails[0].items.map(
        (lineItem) => {
          const html = `
        <div class="product">
                        <div><img src="${lineItem.images[0].src}" height="60" width="60"></div>
                        <div class="productDetails">
                            <div style="margin:auto">${lineItem.title} &nbsp;&nbsp; x&nbsp;&nbsp; ${lineItem.quantity}</div>
                            <div style="margin:auto;margin-left:24px">${lineItem.price}</div>
                        </div>
                    </div>
                    `;
          return html;
        },
      );

      const emailMessageData: EmailTransactionalMessageData = {
        Recipients: {
          To: [email],
        },
        Content: {
          Subject: 'Slope Style Upgrade: Shred the Gnar with Our Fresh Boards!',
          Merge: {
            checkoutLink: `${this.config.get(
              'BACKEND_URL',
            )}/amp/shopify/upsell-email/${upsellId}?checkoutId=${encodeURIComponent(
              checkoutId,
            )}`,
            globalCheckoutId: checkoutId,
            recommendationLink: `${this.config.get(
              'BACKEND_URL',
            )}/amp/shopify/recommendation-email/${upsellId}`,
            updateLineItemLink: `${this.config.get(
              'BACKEND_URL',
            )}/amp/shopify/upsell-email/update-line-item`,
            addLineItemLink: `${this.config.get(
              'BACKEND_URL',
            )}/amp/shopify/upsell-email/add-line-item`,
            removeLineItemLink: `${this.config.get(
              'BACKEND_URL',
            )}/amp/shopify/upsell-email/remove-line-item`,
            applyDiscountLink: `${this.config.get(
              'BACKEND_URL',
            )}/amp/shopify/upsell-email/apply-discount`,
            removeDiscountLink: `${this.config.get(
              'BACKEND_URL',
            )}/amp/shopify/upsell-email/remove-discount`,
            abandonedCheckoutURL: checkoutUrl,
          },
          Body: [
            {
              ContentType: 'AMP',
              Content: upsellEmailTemplate,
            },
            {
              ContentType: 'HTML',
              Content: upsellFallbackTemplate.replace(
                '{{products}}',
                productsHTML.join('\n'),
              ),
            },
          ],
        },
      };

      const emailService = this.email.createEmailService(emailServiceProvider);
      await emailService.sendTransactionalEmail(userId, emailMessageData);

      return {
        data: {},
        message: 'SUCCESS',
        statusCode: 200,
      };
    } catch (err) {
      this.common.generateErrorResponse(err, 'Checkout email');
    }
  }

  async reviewEmail(userId: string, checkoutId: string) {
    const checkout = await this.prisma.checkout.findUnique({
      where: {
        id: checkoutId,
      },
      select: {
        email: true,
        shopifyOrderId: true,
        shopifyStore: {
          select: {
            user: {
              select: {
                emailSettings: {
                  where: {
                    enabled: true,
                  },
                  select: {
                    emailServiceProvider: true,
                  },
                  take: 1,
                },
                reviewPlatforms: {
                  where: {
                    enabled: true,
                  },
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!checkout.shopifyStore.user.reviewPlatforms.length)
      throw new BadRequestException(
        'Please connect a review platform in order to send email',
      );

    try {
      const orderDetails = await this.amp.reviewEmailData(
        Number(checkout.shopifyOrderId),
      );

      const timeDifference = Math.abs(
        new Date().getTime() -
          new Date(orderDetails[0].orderCreatedAt).getTime(),
      );
      const diffDays = Math.ceil(timeDifference / (1000 * 3600 * 24));

      const emailMessageData: EmailTransactionalMessageData = {
        Recipients: {
          To: [checkout.email],
        },
        Content: {
          Subject:
            'Hit the Powder and Share Your Thrills: Review Your Recent Snowboard Purchase!',
          Merge: {
            reviewLink: `${this.config.get(
              'BACKEND_URL',
            )}/amp/shopify/review-email/${checkout.shopifyOrderId}`,
            submitReviewLink: `${this.config.get(
              'BACKEND_URL',
            )}/amp/shopify/review-email/${
              checkout.shopifyOrderId
            }/collect-review`,
            dayDifference: `${diffDays}`,
          },
          Body: [
            {
              ContentType: 'AMP',
              Content: reviewTemplate,
            },
            {
              ContentType: 'HTML',
              Content: reviewFallbackTemplate,
            },
          ],
        },
      };

      const emailService = this.email.createEmailService(
        checkout.shopifyStore.user.emailSettings[0].emailServiceProvider,
      );
      await emailService.sendTransactionalEmail(userId, emailMessageData);

      await this.prisma.checkout.update({
        where: {
          id: checkoutId,
        },
        data: {
          reviewEmailSent: true,
        },
      });

      return {
        data: {},
        message: 'SUCCESS',
        statusCode: 200,
      };
    } catch (err) {
      this.common.generateErrorResponse(err, 'Checkout email');
    }
  }
}
