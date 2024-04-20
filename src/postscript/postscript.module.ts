import { Module } from '@nestjs/common';
import { PostscriptService } from './postscript.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  providers: [PostscriptService],
  exports: [PostscriptService],
  imports: [HttpModule],
})
export class PostscriptModule {}
