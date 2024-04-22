import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { CreateReviewDTO } from '../review-platform/dto';
import { ReviewServiceInterface } from 'src/interfaces/review.service.interface';

@Injectable()
export class JudgeMeService implements ReviewServiceInterface {
  constructor(private http: HttpService) {}

  async createReview(data: CreateReviewDTO) {
    return firstValueFrom(
      this.http.post(`https://judge.me/api/v1/reviews`, {
        shop_domain: data.shopName,
        platform: data.platform,
        id: data.productId,
        email: data.reviewerEmail,
        name: data.reviewerName,
        rating: data.rating,
        title: data.reviewTitle,
        body: data.reviewDescription,
        api_token: data.accessToken,
      }),
    );
  }
}

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
