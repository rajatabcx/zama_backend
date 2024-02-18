import { Global, Module } from '@nestjs/common';
import { CheckoutService } from './checkout.service';

@Global()
@Module({
  providers: [CheckoutService],
  exports: [CheckoutService],
})
export class CheckoutModule {}
