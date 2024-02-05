import { Injectable } from '@nestjs/common';
import { UpdateUserDTO } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CommonService } from 'src/common/common.service';
import { ShopName } from 'src/enum';

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
}
