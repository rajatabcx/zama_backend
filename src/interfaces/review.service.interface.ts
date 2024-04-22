import { CreateReviewDTO } from 'src/review-platform/dto';

export interface ReviewServiceInterface {
  createReview(data: CreateReviewDTO): Promise<any>;
}
