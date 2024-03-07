import { Injectable } from '@nestjs/common';
import { CommonService } from 'src/common/common.service';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  AddToNewsLetterDTO,
  ContactSupportDTO,
  CreateEmailSettingsDTO,
  DemoEmailDTO,
  UpdateEmailSettingsDTO,
} from './dto';
import { EmailTransactionalMessageData } from '@elasticemail/elasticemail-client-ts-axios';
import { ConfigService } from '@nestjs/config';
import { ElasticEmailService } from 'src/elastic-email/elastic-email.service';
import { checkoutTemplate } from './data';

@Injectable()
export class EmailService {
  constructor(
    private prisma: PrismaService,
    private common: CommonService,
    private config: ConfigService,
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

  async checkoutEmail(userId: string, checkoutId: string) {
    try {
      const checkout = await this.prisma.checkout.findUnique({
        where: {
          id: checkoutId,
        },
        select: {
          email: true,
        },
      });

      const emailMessageData: EmailTransactionalMessageData = {
        Recipients: {
          To: [checkout.email],
        },
        Content: {
          From: 'Rajat Mondal <info@zama.agency>',
          Subject: 'Please complete your checkout',
          Merge: {
            checkoutLink: `${this.config.get(
              'BACKEND_URL',
            )}/amp/shopify/checkout-email/${checkoutId}`,
            bestSellerLink: `${this.config.get(
              'BACKEND_URL',
            )}/amp/shopify/bestseller-email/${checkoutId}`,
            updateLineItemLink: `${this.config.get(
              'BACKEND_URL',
            )}/amp/shopify/checkout-email/update-line-item`,
            addLineItemLink: `${this.config.get(
              'BACKEND_URL',
            )}/amp/shopify/checkout-email/add-line-item`,
            removeLineItemLink: `${this.config.get(
              'BACKEND_URL',
            )}/amp/shopify/checkout-email/remove-line-item`,
            applyDiscountLink: `${this.config.get(
              'BACKEND_URL',
            )}/amp/shopify/checkout-email/apply-discount`,
            removeDiscountLink: `${this.config.get(
              'BACKEND_URL',
            )}/amp/shopify/checkout-email/remove-discount`,
          },
          Body: [
            {
              ContentType: 'AMP',
              Content: checkoutTemplate,
            },
            {
              ContentType: 'PlainText',
              Content: 'This is fallback',
            },
          ],
        },
      };
      await this.elasticEmail.sendTransactionalEmail(userId, emailMessageData);

      // await this.prisma.checkout.update({
      //   where: {
      //     id: checkoutId,
      //   },
      //   data: {
      //     emailSent: true,
      //   },
      // });

      return {
        data: {},
        message: 'SUCCESS',
        statusCode: 200,
      };
    } catch (err) {
      this.common.generateErrorResponse(err, 'Checkout email');
    }
  }

  async addToNewsLetter(data: AddToNewsLetterDTO) {
    try {
      await this.elasticEmail.addUsersToList(
        [{ Email: data.email, FirstName: data.name }],
        ['Newsletter'],
      );
    } catch (err) {
      this.common.generateErrorResponse(err, 'Newsletter');
    }
  }

  async contactSupport(data: ContactSupportDTO) {
    try {
      const emailData: EmailTransactionalMessageData = {
        Recipients: {
          To: ['rajat.abcx@gmail.com'],
        },
        Content: {
          Subject: `${data.name} has some query for ZAMA - Reply Fast`,
          From: 'Rajat Mondal <info@zama.agency>',
          Body: [
            {
              ContentType: 'HTML',
              Content: `
                <h1>{name}</h1>
                <p>{email}</p>
                <p>{query}</p>
              `,
            },
          ],
          Merge: {
            name: data.name,
            email: data.email,
            query: data.query,
          },
        },
      };
      await this.elasticEmail.sendTransactionalEmailFromMe(emailData);
    } catch (err) {
      this.common.generateErrorResponse(err, 'Contact');
    }
  }

  async demoEmail(data: DemoEmailDTO) {
    try {
      await this.elasticEmail.addUsersToList(
        [{ Email: data.email }],
        ['Demo Email'],
      );

      const emailMessageData: EmailTransactionalMessageData = {
        Recipients: {
          To: [data.email],
        },
        Content: {
          From: 'Rajat Mondal <info@zama.agency>',
          Subject: 'Please complete your checkout',
          Merge: {
            checkoutLink: `${this.config.get(
              'BACKEND_URL',
            )}/amp/shopify/checkout-email/${this.config.get(
              'DEMO_CHECKOUT_ID',
            )}`,
            bestSellerLink: `${this.config.get(
              'BACKEND_URL',
            )}/amp/shopify/bestseller-email/${this.config.get(
              'DEMO_CHECKOUT_ID',
            )}`,
            updateLineItemLink: `${this.config.get(
              'BACKEND_URL',
            )}/amp/shopify/checkout-email/update-line-item`,
            addLineItemLink: `${this.config.get(
              'BACKEND_URL',
            )}/amp/shopify/checkout-email/add-line-item`,
            removeLineItemLink: `${this.config.get(
              'BACKEND_URL',
            )}/amp/shopify/checkout-email/remove-line-item`,
            applyDiscountLink: `${this.config.get(
              'BACKEND_URL',
            )}/amp/shopify/checkout-email/apply-discount`,
            removeDiscountLink: `${this.config.get(
              'BACKEND_URL',
            )}/amp/shopify/checkout-email/remove-discount`,
          },
          Body: [
            {
              ContentType: 'AMP',
              Content: checkoutTemplate,
            },
            {
              ContentType: 'PlainText',
              Content: 'This is fallback',
            },
          ],
        },
      };

      await this.elasticEmail.sendTransactionalEmailFromMe(emailMessageData);

      return {
        data: {},
        message: 'SUCCESS',
        statusCode: 200,
      };
    } catch (err) {
      this.common.generateErrorResponse(err, 'Contact');
    }
  }
}
