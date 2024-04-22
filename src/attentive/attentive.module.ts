import { Module } from '@nestjs/common';
import { AttentiveService } from './attentive.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  providers: [AttentiveService],
  exports: [AttentiveService],
  imports: [HttpModule],
})
export class AttentiveModule {}
