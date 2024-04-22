import { BadRequestException, Injectable } from '@nestjs/common';
import { CommonService } from 'src/common/common.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConnectReviewPlatformDTO, EnableReviewPlatformDTO } from './dto';
import { ReviewPlatformName } from '@prisma/client';
import { ReviewServiceInterface } from 'src/interfaces/review.service.interface';
import { JudgeMeService } from 'src/judge-me/judge-me.service';
import { Integration } from 'src/interfaces';
import { EmailTransactionalMessageData } from '@elasticemail/elasticemail-client-ts-axios';
import { reviewPlatformIntegrationSuccessEmail } from 'src/data';
import { EmailService } from 'src/email/email.service';
import { YotpoService } from 'src/yotpo/yotpo.service';

@Injectable()
export class ReviewPlatformService {
  constructor(
    private prisma: PrismaService,
    private common: CommonService,
    private judgeMeService: JudgeMeService,
    private yotpoService: YotpoService,
    private email: EmailService,
  ) {}

  async reviewPlatforms(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        reviewPlatforms: {
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

    return { data: user.reviewPlatforms, statusCode: 200, message: 'SUCCESS' };
  }

  async connectReviewPlatform(userId: string, data: ConnectReviewPlatformDTO) {
    const reviewPlatformsPromise = this.prisma.reviewPlatform.count({
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

    const [reviewPlatforms, userData] = await this.prisma.$transaction([
      reviewPlatformsPromise,
      userDataPromise,
    ]);

    const integrations = userData.integrations as unknown as Integration;
    try {
      const updatedIntegrations: Integration = {
        ...integrations,
        [data.platformName]: true,
      };

      const reviewPlatformPromise = this.prisma.reviewPlatform.create({
        data: {
          name: data.platformName,
          accessToken: data.accessToken,
          userId,
          enabled: !reviewPlatforms,
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

      const [reviewPlatform] = await this.prisma.$transaction([
        reviewPlatformPromise,
        userPromise,
      ]);

      const emailData: EmailTransactionalMessageData = {
        Recipients: {
          To: [reviewPlatform.user.email],
        },
        Content: {
          Subject: 'Successfully integrated Review Platform into Zama!!',
          Body: [
            {
              ContentType: 'HTML',
              Content: reviewPlatformIntegrationSuccessEmail,
            },
          ],
          Merge: {
            name: reviewPlatform.user.name,
            reviewPlatformName: data.platformName,
          },
        },
      };
      await this.email.sendTransactionalEmailFromMe(emailData);
    } catch (err) {
      this.common.generateErrorResponse(err, 'Review');
    }
  }

  async enabledReviewPlatform(data: EnableReviewPlatformDTO) {
    try {
      const disablePromise = this.prisma.reviewPlatform.updateMany({
        where: {
          name: {
            not: data.platformName,
          },
        },
        data: {
          enabled: false,
        },
      });
      const enablePromise = this.prisma.reviewPlatform.updateMany({
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
        message: 'Review platform enabled successfully',
        statusCode: 200,
      };
    } catch (err) {
      this.common.generateErrorResponse(err, 'Review');
    }
  }

  createReviewPlatformService(
    reviewPlatform: ReviewPlatformName,
  ): ReviewServiceInterface {
    switch (reviewPlatform) {
      case ReviewPlatformName.JUDGE_ME:
        return this.judgeMeService;
      case ReviewPlatformName.YOTPO:
        return this.yotpoService;
      default:
        throw new BadRequestException(
          `Review service for platform ${reviewPlatform} not found`,
        );
    }
  }
}
