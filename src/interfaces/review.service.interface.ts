import { CreateReviewDTO } from 'src/reviews/dto';

export interface ReviewServiceInterface {
  createReview(data: CreateReviewDTO): Promise<any>;
}
