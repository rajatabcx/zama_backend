import { Module } from '@nestjs/common';
import { YotpoService } from './yotpo.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  providers: [YotpoService],
  exports: [YotpoService],
  imports: [HttpModule],
})
export class YotpoModule {}
