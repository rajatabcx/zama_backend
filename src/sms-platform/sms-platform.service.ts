import { BadRequestException, Injectable } from '@nestjs/common';
import { CommonService } from 'src/common/common.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConnectSMSPlatformDTO, EnableSMSPlatformDTO } from './dto';
import { Integration, SMSServiceInterface } from 'src/interfaces';
import { EmailTransactionalMessageData } from '@elasticemail/elasticemail-client-ts-axios';
import { EmailService } from 'src/email/email.service';
import { smsPlatformIntegrationSuccessEmail } from 'src/data';
import { SMSPlatformName } from '@prisma/client';
import { PostscriptService } from 'src/postscript/postscript.service';
import { AttentiveService } from 'src/attentive/attentive.service';

@Injectable()
export class SmsPlatformService {
  constructor(
    private prisma: PrismaService,
    private common: CommonService,
    private email: EmailService,
    private postScriptService: PostscriptService,
    private attentiveService: AttentiveService,
  ) {}

  async smsPlatforms(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        smsPlatforms: {
          select: {
            name: true,
            enabled: true,
            accessToken: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    return { data: user.smsPlatforms, statusCode: 200, message: 'SUCCESS' };
  }

  async connectSMSPlatform(userId: string, data: ConnectSMSPlatformDTO) {
    const smsPlatformsPromise = this.prisma.sMSPlatform.count({
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

    const [smsPlatforms, userData] = await this.prisma.$transaction([
      smsPlatformsPromise,
      userDataPromise,
    ]);

    const integrations = userData.integrations as unknown as Integration;
    try {
      const updatedIntegrations: Integration = {
        ...integrations,
        [data.platformName]: true,
      };

      const smsPlatformPromise = this.prisma.sMSPlatform.create({
        data: {
          name: data.platformName,
          accessToken: data.accessToken,
          userId,
          enabled: !smsPlatforms,
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

      const userPromise = this.prisma.user.update({
        where: { id: userId },
        data: {
          integrations: { ...updatedIntegrations },
        },
      });

      const [smsPlatform] = await this.prisma.$transaction([
        smsPlatformPromise,
        userPromise,
      ]);

      const emailData: EmailTransactionalMessageData = {
        Recipients: {
          To: [smsPlatform.user.email],
        },
        Content: {
          Subject: 'Successfully integrated SMS platform into Zama!!',
          Body: [
            {
              ContentType: 'HTML',
              Content: smsPlatformIntegrationSuccessEmail,
            },
          ],
          Merge: {
            name: smsPlatform.user.name,
            smsPlatformName: data.platformName,
          },
        },
      };
      await this.email.sendTransactionalEmailFromMe(emailData);
    } catch (err) {
      this.common.generateErrorResponse(err, 'Review');
    }
  }

  async enabledSMSPlatform(data: EnableSMSPlatformDTO) {
    try {
      const disablePromise = this.prisma.sMSPlatform.updateMany({
        where: {
          name: {
            not: data.platformName,
          },
        },
        data: {
          enabled: false,
        },
      });
      const enablePromise = this.prisma.sMSPlatform.updateMany({
        where: {
          name: data.platformName,
        },
        data: {
          enabled: true,
        },
      });

      await this.prisma.$transaction([disablePromise, enablePromise]);
      return {
        data: {},
        message: 'SMS platform enabled successfully',
        statusCode: 200,
      };
    } catch (err) {
      this.common.generateErrorResponse(err, 'SMS');
    }
  }

  async smsPlatformKeywords(userId: string) {
    const smsPlatform = await this.prisma.sMSPlatform.findFirst({
      where: {
        enabled: true,
        userId,
      },
      select: {
        accessToken: true,
        name: true,
      },
    });

    if (smsPlatform.name !== SMSPlatformName.POSTSCRIPT)
      throw new Error('You cant get keyword for postscript');
    try {
      const smsService = this.createSMSPlatformService(smsPlatform.name);
      const { data } = await smsService.getKeywords(smsPlatform.accessToken);

      return { data, statusCOde: 200, message: 'SUCCESS' };
    } catch (err) {
      this.common.generateErrorResponse(err, 'SMS');
    }
  }

  createSMSPlatformService(smsPlatform: SMSPlatformName): SMSServiceInterface {
    switch (smsPlatform) {
      case SMSPlatformName.POSTSCRIPT:
        return this.postScriptService;
      case SMSPlatformName.ATTENTIVE:
        return this.attentiveService;
      default:
        throw new BadRequestException(
          `SMS service for platform ${smsPlatform} not found`,
        );
    }
  }
}
