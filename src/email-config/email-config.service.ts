import { Injectable } from '@nestjs/common';
import { CommonService } from 'src/common/common.service';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateEmailSettingsDTO,
  EnabledEmailSettingDTO,
  UpdateEmailSettingsDTO,
} from './dto';
import { EmailTransactionalMessageData } from '@elasticemail/elasticemail-client-ts-axios';
import { emailIntegrationSuccessEmail } from 'src/data';
import { EmailService } from 'src/email/email.service';
import { Integration } from 'src/interfaces';

@Injectable()
export class EmailConfigService {
  constructor(
    private prisma: PrismaService,
    private common: CommonService,
    private email: EmailService,
  ) {}

  async emailSettings(userId: string) {
    try {
      const email = await this.prisma.emailSettings.findMany({
        where: {
          userId,
        },
        select: {
          apiKey: true,
          checkoutTemplate: true,
          productUpsellTemplate: true,
          reviewTemplate: true,
          fromEmail: true,
          enabled: true,
          emailServiceProvider: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return { data: email, statusCode: 200, message: 'SUCCESS' };
    } catch (err) {
      this.common.generateErrorResponse(err, 'Email');
    }
  }

  async addEmailSettings(userId: string, data: CreateEmailSettingsDTO) {
    const noOfSettingsPromise = this.prisma.emailSettings.count({
      where: {
        userId,
      },
    });
    const userDataPromise = this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        integrations: true,
      },
    });

    const [noOfSettings, userData] = await this.prisma.$transaction([
      noOfSettingsPromise,
      userDataPromise,
    ]);

    const integrations = userData.integrations as unknown as Integration;
    try {
      const emailSettingsPromise = this.prisma.emailSettings.create({
        data: {
          apiKey: data.apiKey,
          emailServiceProvider: data.emailServiceProvider,
          userId,
          enabled: !noOfSettings,
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

      const updatedIntegrations: Integration = {
        ...integrations,
        elasticEmail: true,
      };

      const userPromise = this.prisma.user.update({
        where: { id: userId },
        data: {
          integrations: { ...updatedIntegrations },
        },
      });

      const [emailSettings] = await this.prisma.$transaction([
        emailSettingsPromise,
        userPromise,
      ]);

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
      await this.email.sendTransactionalEmailFromMe(emailData);
    } catch (err) {
      this.common.generateErrorResponse(err, 'Email Settings');
    }
  }

  async updateEmailSettings(userId: string, data: UpdateEmailSettingsDTO) {
    try {
      await this.prisma.emailSettings.updateMany({
        where: {
          userId,
          emailServiceProvider: data.emailServiceProvider,
        },
        data: {
          apiKey: data.apiKey,
          checkoutTemplate: data.checkoutTemplate,
          productUpsellTemplate: data.productUpsellTemplate,
          reviewTemplate: data.reviewTemplate,
          fromEmail: data.fromEmail,
        },
      });

      return {
        data: {},
        message: 'Email settings updated successfully',
        statusCode: 200,
      };
    } catch (err) {
      this.common.generateErrorResponse(err, 'Email Settings');
    }
  }

  async enabledEmailSetting(data: EnabledEmailSettingDTO) {
    try {
      const enabledPromise = this.prisma.emailSettings.updateMany({
        where: {
          emailServiceProvider: data.emailServiceProvider,
        },
        data: {
          enabled: true,
        },
      });
      const disabledPromise = this.prisma.emailSettings.updateMany({
        where: {
          emailServiceProvider: {
            not: data.emailServiceProvider,
          },
        },
        data: {
          enabled: false,
        },
      });

      await this.prisma.$transaction([enabledPromise, disabledPromise]);
    } catch (err) {
      this.common.generateErrorResponse(err, 'Email Settings');
    }
  }

  async templates(userId: string) {
    const emailSetting = await this.prisma.emailSettings.findFirst({
      where: {
        userId,
        enabled: true,
      },
      select: {
        emailServiceProvider: true,
      },
    });
    try {
      const emailService = this.email.createEmailService(
        emailSetting.emailServiceProvider,
      );
      const data = await emailService.emailTemplates(userId);

      return { data, statusCode: 200, message: 'SUCCESS' };
    } catch (err) {
      this.common.generateErrorResponse(err, 'Templates');
    }
  }

  async lists(userId: string) {
    const emailSetting = await this.prisma.emailSettings.findFirst({
      where: {
        userId,
        enabled: true,
      },
      select: {
        emailServiceProvider: true,
      },
    });
    try {
      const emailService = this.email.createEmailService(
        emailSetting.emailServiceProvider,
      );
      const data = await emailService.emailLists(userId);

      return { data, statusCode: 200, message: 'SUCCESS' };
    } catch (err) {
      this.common.generateErrorResponse(err, 'Templates');
    }
  }
}
