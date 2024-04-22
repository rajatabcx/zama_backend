import { Module } from '@nestjs/common';
import { JudgeMeService } from './judge-me.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  providers: [JudgeMeService],
  imports: [HttpModule],
  exports: [JudgeMeService],
})
export class JudgeMeModule {}
