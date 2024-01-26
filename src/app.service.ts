import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  ping() {
    return {
      message: 'Hello World!',
      name: 'ZAMA BACKEND',
      version: '1.0.0',
    };
  }
}
