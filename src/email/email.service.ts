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
          elasticEmailApiKey: data.elasticEmailApiKey,
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
          elasticEmailApiKey: data.elasticApiKey,
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
          elasticEmailApiKey: true,
        },
      });
      return { data: email, statusCode: 200, message: 'SUCCESS' };
    } catch (err) {
      this.common.generateErrorResponse(err, 'Email Settings');
    }
  }

  async emailTemplates(userId: string) {
    try {
      const { templatesApi } = await this.common.emailClient(userId);
      const { data: templates } = await templatesApi.templatesGet(
        ['Global', 'Personal'],
        ['RawHTML'],
        10,
      );
      return {
        data: templates.map((template) => ({
          name: template.Name,
          createdAt: template.DateAdded,
          subject: template.Subject,
        })),
        statusCode: '200',
        message: 'SUCCESS',
      };
    } catch (err) {
      this.common.generateErrorResponse(err, 'Email Templates');
    }
  }

  // async sendEmail(checkoutId: string) {
  //   const config = new Configuration({
  //     apiKey:
  //       'E99EE013880471A1DF11467400C87C114FFA69F70BF0EF74FE014D4554E9748A14C9D43BA244D1C497621A6CA7A9D0E7',
  //   });

  //   const emailsApi = new EmailsApi(config);

  //   const emailMessageData: EmailTransactionalMessageData = {
  //     Recipients: {
  //       // To: ['srijitasengupta23@gmail.com'],
  //       To: ['rajat.abcx@gmail.com'],
  //     },
  //     Content: {
  //       From: 'rajat.abcx@gmail.com',
  //       Subject: 'Please complete your checkout',
  //       TemplateName: 'Checkout',
  //     },
  //   };

  //   const {
  //     data: { TransactionID, MessageID },
  //   } = await emailsApi.emailsTransactionalPost(emailMessageData);
  //   return {
  //     data: {
  //       TransactionID,
  //       MessageID,
  //     },
  //     message: 'SUCCESS',
  //     statusCode: 200,
  //   };
  // }
}
