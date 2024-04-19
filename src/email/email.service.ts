import { BadRequestException, Injectable } from '@nestjs/common';
import { CommonService } from 'src/common/common.service';
import {
  ContactPayload,
  ContactsApi,
  EmailsApi,
  EmailTransactionalMessageData,
} from '@elasticemail/elasticemail-client-ts-axios';
import { ElasticEmailService } from 'src/elastic-email/elastic-email.service';
import { EmailServiceInterface } from 'src/interfaces';
import { EmailServiceProvider } from '@prisma/client';

@Injectable()
export class EmailService {
  constructor(
    private common: CommonService,
    private elasticEmailService: ElasticEmailService,
  ) {}

  async sendTransactionalEmailFromMe(data: EmailTransactionalMessageData) {
    data.Content.From = 'Rajat Mondal <info@zama.agency>';
    const config = this.common.myEmailConfig();
    const emailsApi = new EmailsApi(config);
    await emailsApi.emailsTransactionalPost(data);
  }

  async addUsersToList(users: ContactPayload[], lists: string[]) {
    const config = this.common.myEmailConfig();
    const contacts = new ContactsApi(config);
    await contacts.contactsPost(users, lists);
  }

  createEmailService(esp: EmailServiceProvider): EmailServiceInterface {
    switch (esp) {
      case EmailServiceProvider.ELASTICEMAIL:
        return this.elasticEmailService;
      default:
        throw new BadRequestException(
          `Email service for platform ${esp} not found`,
        );
    }
  }
}
