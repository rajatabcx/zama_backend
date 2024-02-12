import { Injectable } from '@nestjs/common';
import { CommonService } from 'src/common/common.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEmailSettingsDTO, UpdateEmailSettingsDTO } from './dto';

@Injectable()
export class EmailService {
  constructor(private prisma: PrismaService, private common: CommonService) {}

  async addEmailSettings(userId: string, data: CreateEmailSettingsDTO) {
    try {
      await this.prisma.emailSettings.create({
        data: {
          stripoApiKey: data.stripoApiKey,
          userId,
        },
      });
    } catch (err) {
      this.common.generateErrorResponse(err, 'Email Settings');
    }
  }

  async updateEmailSettings(userId: string, data: UpdateEmailSettingsDTO) {
    try {
      await this.prisma.emailSettings.update({
        where: {
          userId,
        },
        data: {
          stripoApiKey: data.stripoApiKey,
        },
      });
    } catch (err) {
      this.common.generateErrorResponse(err, 'Email Settings');
    }
  }

  async emailSettings(userId: string) {
    try {
      const email = await this.prisma.emailSettings.findUnique({
        where: {
          userId,
        },
        select: {
          stripoApiKey: true,
        },
      });
      return { data: email, statusCode: 200, message: 'SUCCESS' };
    } catch (err) {
      this.common.generateErrorResponse(err, 'Email Settings');
    }
  }
}
