import { Injectable } from '@nestjs/common';
import { CommonService } from 'src/common/common.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEmailSettingsDTO, UpdateEmailSettingsDTO } from './dto';
import { EmailTransactionalMessageData } from '@elasticemail/elasticemail-client-ts-axios';
import { ElasticEmailService } from 'src/elastic-email/elastic-email.service';
import { emailIntegrationSuccessEmail } from './data';

@Injectable()
export class EmailService {
  constructor(
    private prisma: PrismaService,
    private common: CommonService,
    private elasticEmail: ElasticEmailService,
  ) {}

  async emailSettings(userId: string) {
    try {
      const email = await this.prisma.emailSettings.findUnique({
        where: {
          userId,
        },
        select: {
          elasticEmailApiKey: true,
          checkoutTemplateName: true,
          productUpsellTemplateName: true,
          fromEmail: true,
        },
      });
      return { data: email, statusCode: 200, message: 'SUCCESS' };
    } catch (err) {
      this.common.generateErrorResponse(err, 'Email');
    }
  }

  async addEmailSettings(userId: string, data: CreateEmailSettingsDTO) {
    try {
      const emailSettings = await this.prisma.emailSettings.create({
        data: {
          elasticEmailApiKey: data.elasticEmailApiKey,
          userId,
        },
        select: {
          user: {
            select: {
              email: true,
              name: true,
            },
          },
        },
      });

      const emailData: EmailTransactionalMessageData = {
        Recipients: {
          To: [emailSettings.user.email],
        },
        Content: {
          Subject: 'Successfully integrated Elastic Email into Zama!!',
          Body: [
            {
              ContentType: 'HTML',
              Content: emailIntegrationSuccessEmail,
            },
          ],
          Merge: {
            name: emailSettings.user.name,
          },
        },
      };
      await this.elasticEmail.sendTransactionalEmailFromMe(emailData);
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
          elasticEmailApiKey: data.elasticEmailApiKey,
          checkoutTemplateName: data.checkoutTemplateName,
          productUpsellTemplateName: data.productUpsellTemplateName,
          fromEmail: data.fromEmail,
        },
      });
    } catch (err) {
      this.common.generateErrorResponse(err, 'Email Settings');
    }
  }

  async emailTemplates(userId: string) {
    try {
      const data = await this.elasticEmail.templates(userId);

      return { data, statusCode: 200, message: 'SUCCESS' };
    } catch (err) {
      this.common.generateErrorResponse(err, 'Email Templates');
    }
  }

  async emailLists(userId: string) {
    try {
      const data = await this.elasticEmail.lists(userId);
      return { data, statusCode: 200, message: 'SUCCESS' };
    } catch (err) {
      this.common.generateErrorResponse(err, 'Email Templates');
    }
  }
}
