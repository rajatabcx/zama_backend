import { BadRequestException, Injectable } from '@nestjs/common';
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
import { ShopifyService } from 'src/shopify/shopify.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private common: CommonService,
    private shopifyGraphql: ShopifyGraphqlService,
    private elasticEmailService: ElasticEmailService,
    private shopify: ShopifyService,
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

      const { data } = await this.elasticEmailService.usersFromList(
        upsell.user.id,
        upsell.listName,
        0,
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

        await this.shopify.productUpsellEmail(
          userId,
          email,
          productUpsellId,
          checkoutId,
          attr.checkoutURL,
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
}
