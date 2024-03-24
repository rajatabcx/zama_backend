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

@Injectable()
export class ElasticEmailService {
  constructor(
    private common: CommonService,
    private httpService: HttpService,
  ) {}

  async templates(userId: string) {
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

  async addUsersToList(users: ContactPayload[], lists: string[]) {
    const config = this.common.myEmailConfig();
    const contacts = new ContactsApi(config);
    await contacts.contactsPost(users, lists);
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

  async sendTransactionalEmailFromMe(data: EmailTransactionalMessageData) {
    data.Content.From = 'Rajat Mondal <info@zama.agency>';
    const config = this.common.myEmailConfig();
    const emailsApi = new EmailsApi(config);
    await emailsApi.emailsTransactionalPost(data);
  }

  async lists(userId: string) {
    const { config } = await this.common.emailConfig(userId);
    const listsApi = new ListsApi(config);
    const { data: lists } = await listsApi.listsGet(20);
    const modifiedData = lists.map((list) => ({
      id: list.PublicListID,
      name: list.ListName,
    }));
    return modifiedData;
  }

  async usersFromList(userId: string, listName: string, page: number) {
    const limit = 200;
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
}
