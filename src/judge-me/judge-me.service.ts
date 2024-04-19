import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { CreateReviewDTO } from '../reviews/dto';

@Injectable()
export class JudgeMeService {
  constructor(private http: HttpService) {}

  async createReview(data: CreateReviewDTO) {
    // TODO: add shopdomain and api api token in the body
    return firstValueFrom(
      this.http.post(`https://judge.me/api/v1/reviews`, { ...data }),
    );

    //
    //  {
    //   "shop_domain": "zama-merchant.myshopify.com",
    //   "platform": "shopify",
    //   "id": 7227764572271,
    //   "email": "rm2932002@gmail.com",
    //   "name": "Rajat Test",
    //   "rating": 3,
    //   "title": "Not soo good, but okay!",
    //   "body": "Abbey ja na chutiye",
    //   "api_token":"_hiNgbSUv8NWOjRozM_DFaMdAB8"
    // }
  }
}
