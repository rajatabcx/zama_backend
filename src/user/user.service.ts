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

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService, private common: CommonService) {}

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
      await this.prisma.productUpsell.update({
        where: {
          id: productUpsellId,
        },
        data: {
          status: UpsellStatus.ONGOING,
        },
      });
      return { data: {}, message: 'SUCCESS', statusCode: 200 };
    } catch (err) {
      this.common.generateErrorResponse(err, 'Product Upsell');
    }
  }
}
