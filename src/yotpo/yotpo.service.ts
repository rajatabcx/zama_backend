import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ReviewServiceInterface } from 'src/interfaces/review.service.interface';
import { CreateReviewDTO } from 'src/review-platform/dto';

@Injectable()
export class YotpoService implements ReviewServiceInterface {
  constructor(private http: HttpService) {}
  async createReview(data: CreateReviewDTO) {
    return firstValueFrom(
      this.http.post(`https://api.yotpo.com/reviews/dynamic_create`, {
        sku: data.productId,
        product_title: data.productName,
        email: data.reviewerEmail,
        display_name: data.reviewerName,
        review_score: data.rating,
        review_title: data.reviewTitle,
        review_content: data.reviewDescription,
        appkey: data.accessToken,
        reviewer_type: 'verified_buyer',
      }),
    );
  }
}

//
//  {
//   "sku": 7227764572271,
// "product_title":"Something"
//   "email": "rm2932002@gmail.com",
//   "display_name": "Rajat Test",
//   "review_score": 3,
//   "review_title": "Not soo good, but okay!",
//   "review_content": "Abbey ja na chutiye",
//   "appkey":"_hiNgbSUv8NWOjRozM_DFaMdAB8"
// "reviewer_type":"verified_buyer"
// }
