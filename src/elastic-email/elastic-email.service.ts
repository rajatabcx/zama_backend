import {
  ContactPayload,
  ContactsApi,
  EmailTransactionalMessageData,
  EmailsApi,
  ListsApi,
  TemplatesApi,
} from '@elasticemail/elasticemail-client-ts-axios';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { CommonService } from 'src/common/common.service';
import { EmailServiceInterface } from 'src/interfaces';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ElasticEmailService implements EmailServiceInterface {
  constructor(
    private common: CommonService,
    private httpService: HttpService,
  ) {}

  async emailTemplates(userId: string) {
    try {
      const data = await this.templates(userId);

      const templates = data.map((item, index) => ({
        id: `temp-${index}`,
        name: item.name,
      }));

      return templates;
    } catch (err) {
      this.common.generateErrorResponse(err, 'Email Templates');
    }
  }

  async emailLists(userId: string) {
    try {
      const data = await this.lists(userId);
      return data;
    } catch (err) {
      this.common.generateErrorResponse(err, 'Email Templates');
    }
  }

  async sendTransactionalEmail(
    userId: string,
    data: EmailTransactionalMessageData,
  ) {
    const { config, fromEmail } = await this.common.emailConfig(userId);
    data.Content.From = fromEmail;
    const emailsApi = new EmailsApi(config);
    await emailsApi.emailsTransactionalPost(data);
  }

  async usersFromList(
    userId: string,
    listName: string,
    page: number,
    limit: number,
  ) {
    const offset = page * limit;

    const { elasticEmailApiKey } = await this.common.emailConfig(userId);

    const query = this.common.serialize({
      offset,
      limit,
      listName: listName,
      apikey: elasticEmailApiKey,
    });

    return firstValueFrom(
      this.httpService.get(
        `https://api.elasticemail.com/v2/contact/getcontactsbylist?${query}`,
      ),
    );
  }

  private async lists(userId: string) {
    const { config } = await this.common.emailConfig(userId);
    const listsApi = new ListsApi(config);
    const { data: lists } = await listsApi.listsGet(20);
    const modifiedData = lists.map((list) => ({
      id: list.PublicListID,
      name: list.ListName,
    }));
    return modifiedData;
  }

  private async templates(userId: string) {
    const { config } = await this.common.emailConfig(userId);
    const template = new TemplatesApi(config);
    const { data: templates } = await template.templatesGet(
      ['Global', 'Personal'],
      ['DragDropEditor', 'LandingPageEditor', 'RawHTML'],
      20,
    );
    const modifiedData = templates.map((template) => ({
      createdAt: template.DateAdded,
      name: template.Name,
      subject: template.Subject,
    }));
    return modifiedData;
  }
}
