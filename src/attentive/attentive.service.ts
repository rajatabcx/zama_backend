import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { SMSServiceInterface } from 'src/interfaces';
import { CreateSubscriberDTO } from 'src/sms-platform/dto';

@Injectable()
export class AttentiveService implements SMSServiceInterface {
  constructor(private httpService: HttpService) {}

  createSubscriber(data: CreateSubscriberDTO): Promise<any> {
    return null;
  }
}
