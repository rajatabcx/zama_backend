import { CreateSubscriberDTO } from 'src/sms-platform/dto';

export interface SMSServiceInterface {
  createSubscriber(data: CreateSubscriberDTO): Promise<any>;
  getKeywords?: (accessToken: string) => Promise<any>;
}
