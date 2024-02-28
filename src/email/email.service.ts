import { Injectable } from '@nestjs/common';
import { CommonService } from 'src/common/common.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEmailSettingsDTO, UpdateEmailSettingsDTO } from './dto';
import {
  EmailTransactionalMessageData,
  EmailsApi,
  TemplatesApi,
} from '@elasticemail/elasticemail-client-ts-axios';

@Injectable()
export class EmailService {
  constructor(private prisma: PrismaService, private common: CommonService) {}

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
        },
      });
    } catch (err) {
      this.common.generateErrorResponse(err, 'Email Settings');
    }
  }

  async emailTemplates(userId: string) {
    try {
      const config = await this.common.emailConfig(userId);
      const template = new TemplatesApi(config);
      const { data: templates } = await template.templatesGet(
        ['Global', 'Personal'],
        ['DragDropEditor', 'LandingPageEditor', 'RawHTML'],
        10,
      );
      const modifiedData = templates.map((template) => ({
        createdAt: template.DateAdded,
        name: template.Name,
        subject: template.Subject,
      }));
      return { data: modifiedData, statusCode: 200, message: 'SUCCESS' };
    } catch (err) {
      this.common.generateErrorResponse(err, 'Email Templates');
    }
  }

  async checkoutEmail(userId: string) {
    try {
      const config = await this.common.emailConfig(userId);
      const emailsApi = new EmailsApi(config);

      const emailMessageData: EmailTransactionalMessageData = {
        Recipients: {
          To: ['rajat.abcx@gmail.com'],
        },
        Content: {
          From: 'info@zama.agency',
          Subject: 'Please complete your checkout',
          Body: [
            {
              ContentType: 'AMP',
              Content: `<!--
              Below is the mininum valid AMP4EMAIL document. Just type away
              here and the AMP Validator will re-check your document on the fly.
         -->
         <!doctype html>
         <html ⚡4email data-css-strict>
         <head>
           <meta charset="utf-8">
           <script async src="https://cdn.ampproject.org/v0.js"></script>
           <style amp4email-boilerplate>body{visibility:hidden}</style>
         </head>
         <body>
           Hello, AMP4EMAIL world.
         </body>
         </html>`,
            },
            {
              ContentType: 'HTML',
              Content: 'This is the fallback content',
            },
          ],
        },
      };

      const {
        data: { TransactionID, MessageID },
      } = await emailsApi.emailsTransactionalPost(emailMessageData);

      return {
        data: {
          TransactionID,
          MessageID,
        },
        message: 'SUCCESS',
        statusCode: 200,
      };
    } catch (err) {
      console.log(err?.response);
      this.common.generateErrorResponse(err, 'Checkout email');
    }
  }
}
