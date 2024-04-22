import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { SMSServiceInterface } from 'src/interfaces';
import { CreateSubscriberDTO } from 'src/sms-platform/dto';

@Injectable()
export class PostscriptService implements SMSServiceInterface {
  constructor(private httpService: HttpService) {}

  createSubscriber(data: CreateSubscriberDTO): Promise<any> {
    if (!data.keyword || !data.keywordId)
      throw new BadRequestException('Keyword details not found');

    return firstValueFrom(
      this.httpService.post(
        `https://api.postscript.io/api/v2/subscribers`,
        {
          phone_number: data.phoneNumber,
          email: data.email,
          keyword_id: data.keywordId,
          keyword: data.keyword,
        },
        {
          headers: {
            'X-Postscript-Shop-Token': data.accessToken,
          },
        },
      ),
    );
  }

  getKeywords(accessToken: string): Promise<any> {
    return firstValueFrom(
      this.httpService.get(`https://api.postscript.io/api/v2/keywords`, {
        headers: {
          'X-Postscript-Shop-Token': accessToken,
        },
      }),
    );
    return null;
  }
}

// {
// phone_number: '74546465415',
// keyword_id: '65461',
// keyword: '21151554',
// email: 'dfnsdk'
// }

// header;
// 'X-Postscript-Shop-Token': 'sk_94d956ea53661ee4c17d182879b50e37'
