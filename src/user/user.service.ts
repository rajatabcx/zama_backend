import { Injectable } from '@nestjs/common';
import {
  CreateProductUpsellDTO,
  UpdateProductUpsellProductsDTO,
  UpdateUserDTO,
} from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CommonService } from 'src/common/common.service';
import { ShopName } from 'src/enum';
import { Prisma, UpsellStatus } from '@prisma/client';
import { UpdateProductUpsellListDTO } from './dto/updateProductUpsellList.dto';
import { ShopifyGraphqlService } from 'src/shopify-graphql/shopify-graphql.service';
import { SelectedProducts } from 'src/shopify/type';
import { ElasticEmailService } from 'src/elastic-email/elastic-email.service';
import {
  ContactsApi,
  EmailTransactionalMessageData,
} from '@elasticemail/elasticemail-client-ts-axios';
import { ConfigService } from '@nestjs/config';
import { upsellEmail, upsellFallbackEmail } from 'src/email/data';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private common: CommonService,
    private shopifyGraphql: ShopifyGraphqlService,
    private elasticEmailService: ElasticEmailService,
    private config: ConfigService,
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
          shopifyStore: {
            select: {
              name: true,
              scope: true,
            },
          },
        },
      });
      return {
        data: {
          [ShopName.SHOPIFY]: data.shopifyStore
            ? {
                shopName: data.shopifyStore.name,
                scope: data.shopifyStore.scope,
              }
            : null,
        },
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

  async runProductUpsell(productUpsellId: string) {
    try {
      // TODO: Add a limiter to run a single upsell at a time, if another one is running, it wont run
      await this.prisma.productUpsell.update({
        where: {
          id: productUpsellId,
        },
        data: {
          status: UpsellStatus.ONGOING,
        },
      });
      this.productUpsellTasks(productUpsellId);
      return { data: {}, message: 'SUCCESS', statusCode: 200 };
    } catch (err) {
      this.common.generateErrorResponse(err, 'Product Upsell');
    }
  }

  async productUpsellTasks(productUpsellId: string) {
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

      // TODO: get all users from the list

      const { data } = await this.elasticEmailService.usersFromList(
        upsell.user.id,
        upsell.listName,
        0,
      );
      const emailList = data.data.map((contact) => contact.email);
      console.log(emailList);

      // TODO: update their custom fields
      for (const email of emailList) {
        const { data: resData } = await this.shopifyGraphql.createCheckout(
          shopifyStorefrontClient,
          lineItems,
        );

        const attr = {
          shopifyStorefrontCheckoutId: resData.checkoutCreate.checkout.id, // this is global id, need this to update, send on the email as btoa format
          checkoutURL: resData.checkoutCreate.checkout.webUrl,
        };
        const checkoutId = btoa(attr.shopifyStorefrontCheckoutId);
        await this.shopifyGraphql.checkoutEmailUpdate(
          shopifyStorefrontClient,
          checkoutId,
          email,
        );

        await this.elasticEmailService.updateUserAttributes(
          upsell.user.id,
          email,
          attr,
        );
        console.log('---product upsell links---');
        console.log(attr);
        console.log('---product upsell links---');
        // const emailData: EmailTransactionalMessageData = {
        //   Recipients: {
        //     To: [email],
        //   },
        //   Content: {
        //     Subject: 'Checkout our new products',
        //     Merge: {
        //       upsellLink: `${this.config.get(
        //         'BACKEND_URL',
        //       )}/amp/shopify/upsell-email/${productUpsellId}`,
        //       recommendationLink: `${this.config.get(
        //         'BACKEND_URL',
        //       )}/amp/shopify/bestseller-email/${productUpsellId}`,
        //       updateLineItemLink: `${this.config.get(
        //         'BACKEND_URL',
        //       )}/amp/shopify/checkout-email/update-line-item`,
        //       addLineItemLink: `${this.config.get(
        //         'BACKEND_URL',
        //       )}/amp/shopify/checkout-email/add-line-item`,
        //       removeLineItemLink: `${this.config.get(
        //         'BACKEND_URL',
        //       )}/amp/shopify/checkout-email/remove-line-item`,
        //       applyDiscountLink: `${this.config.get(
        //         'BACKEND_URL',
        //       )}/amp/shopify/checkout-email/apply-discount`,
        //       removeDiscountLink: `${this.config.get(
        //         'BACKEND_URL',
        //       )}/amp/shopify/checkout-email/remove-discount`,
        //       abandonedCheckoutURL: attr.checkoutURL,
        //     },
        //     Body: [
        //       {
        //         ContentType: 'AMP',
        //         Content: upsellEmail,
        //       },
        //       {
        //         ContentType: 'HTML',
        //         Content: upsellFallbackEmail,
        //       },
        //     ],
        //   },
        // };
        // await this.elasticEmailService.sendTransactionalEmail(
        //   upsell.user.id,
        //   emailData,
        // );
      }
    } catch (err) {
      console.log(err.response);
      await this.prisma.productUpsell.update({
        where: {
          id: productUpsellId,
        },
        data: {
          status: UpsellStatus.ERROR,
        },
      });
      // this.common.generateErrorResponse(err, 'Upsell');
    }
  }
}
