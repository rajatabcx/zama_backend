export interface EmailServiceInterface {
  emailTemplates(userId: string): Promise<{ id: string; name: string }[]>;

  emailLists(userId: string): Promise<{ id: string; name: string }[]>;

  sendTransactionalEmail(userId: string, data: any): any;

  usersFromList(
    userId: string,
    listName: string,
    page: number,
    limit: number,
  ): any;
}
