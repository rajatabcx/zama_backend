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
import {
  checkoutFallbackTemplate,
  checkoutTemplate,
  contactSupportEmail,
  emailIntegrationSuccessEmail,
} from './data';
import { AmpService } from 'src/amp/amp.service';

@Injectable()
export class EmailService {
  constructor(
    private prisma: PrismaService,
    private common: CommonService,
    private config: ConfigService,
    private elasticEmail: ElasticEmailService,
    private amp: AmpService,
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

  async checkoutEmail(userId: string, checkoutId: string) {
    try {
      const checkout = await this.prisma.checkout.findUnique({
        where: {
          id: checkoutId,
        },
        select: {
          email: true,
          shopifyStorefrontCheckoutId: true,
        },
      });

      const checkoutDetails = await this.amp.checkoutEmailData(checkoutId);

      const productsHTML: string[] = checkoutDetails[0].items.map(
        (lineItem) => {
          const html = `
        <div class="product">
                        <div><img src="${lineItem.images[0].src}" height="60" width="60"></div>
                        <div class="productDetails">
                            <div style="margin:auto">${lineItem.title} &nbsp;&nbsp; x&nbsp;&nbsp; ${lineItem.quantity}</div>
                            <div style="margin:auto;margin-left:24px">${lineItem.price}</div>
                        </div>
                    </div>
                    `;
          return html;
        },
      );

      const emailMessageData: EmailTransactionalMessageData = {
        Recipients: {
          To: [checkout.email],
        },
        Content: {
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
            abandonedCheckoutURL: checkoutDetails[0].checkoutUrl,
          },
          Body: [
            {
              ContentType: 'AMP',
              Content: checkoutTemplate,
            },
            {
              ContentType: 'HTML',
              Content: checkoutFallbackTemplate.replace(
                '{{products}}',
                productsHTML.join('\n'),
              ),
            },
          ],
        },
      };
      await this.elasticEmail.sendTransactionalEmail(userId, emailMessageData);

      await this.prisma.checkout.update({
        where: {
          id: checkoutId,
        },
        data: {
          emailSent: true,
        },
      });

      return {
        data: {},
        message: 'SUCCESS',
        statusCode: 200,
      };
    } catch (err) {
      this.common.generateErrorResponse(err, 'Checkout email');
    }
  }

  async productUpsellEmail(productUpsellId: string) {
    try {
    } catch (err) {
      this.common.generateErrorResponse(err, 'Upsell Email');
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
          To: ['rajat.abcx@gmail.com', 'rajat@zama.agency'],
        },
        Content: {
          Subject: `${data.name} has some query for ZAMA - Reply Fast`,
          Body: [
            {
              ContentType: 'HTML',
              Content: contactSupportEmail,
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
      const checkoutId = this.config.get('DEMO_CHECKOUT_ID');
      const checkoutDetails = await this.amp.checkoutEmailData(checkoutId);

      const productsHTML: string[] = checkoutDetails[0].items.map(
        (lineItem) => {
          const html = `
        <div class="product">
                        <div><img src="${lineItem.images[0].src}" height="60" width="60"></div>
                        <div class="productDetails">
                            <div style="margin:auto">${lineItem.title} &nbsp;&nbsp; x&nbsp;&nbsp; ${lineItem.quantity}</div>
                            <div style="margin:auto;margin-left:24px">${lineItem.price}</div>
                        </div>
                    </div>
                    `;
          return html;
        },
      );

      await this.elasticEmail.addUsersToList(
        [{ Email: data.email, FirstName: 'Anonymous User' }],
        ['Demo Email'],
      );

      const emailMessageData: EmailTransactionalMessageData = {
        Recipients: {
          To: [data.email],
        },
        Content: {
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
            abandonedCheckoutURL: checkoutDetails[0].checkoutUrl,
          },
          Body: [
            {
              ContentType: 'AMP',
              Content: checkoutTemplate,
            },
            {
              ContentType: 'HTML',
              Content: checkoutFallbackTemplate.replace(
                '{{products}}',
                productsHTML.join('\n'),
              ),
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
      console.log(err);
      this.common.generateErrorResponse(err, 'Contact');
    }
  }
}
