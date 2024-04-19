import { Injectable } from '@nestjs/common';
import { ConnectReviewPlatformDTO } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CommonService } from 'src/common/common.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService, private common: CommonService) {}

  connectReviewPlatform(userId: string, data: ConnectReviewPlatformDTO) {
    try {
      await this.prisma.reviewPlatform.create({
        data: {
          name: data.platformName,
          accessToken: data.accessToken,
          userId,
          //   enabled:
        },
      });
    } catch (err) {
      this.common.generateErrorResponse(err, 'Review');
    }
  }
}
