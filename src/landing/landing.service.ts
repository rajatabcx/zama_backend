import { EmailTransactionalMessageData } from '@elasticemail/elasticemail-client-ts-axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AmpService } from 'src/amp/amp.service';
import { AddToNewsLetterDTO, ContactSupportDTO, DemoEmailDTO } from './dto';
import { CommonService } from 'src/common/common.service';
import {
  checkoutFallbackTemplate,
  checkoutTemplate,
  contactSupportEmail,
} from 'src/data';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class LandingService {
  constructor(
    private config: ConfigService,
    private amp: AmpService,
    private common: CommonService,
    private email: EmailService,
  ) {}

  async addToNewsLetter(data: AddToNewsLetterDTO) {
    try {
      await this.email.addUsersToList(
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
      await this.email.sendTransactionalEmailFromMe(emailData);
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

      await this.email.addUsersToList(
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

      await this.email.sendTransactionalEmailFromMe(emailMessageData);

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
