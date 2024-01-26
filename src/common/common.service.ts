import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as argon2 from 'argon2';

@Injectable()
export class CommonService {
  hashData(password: string) {
    return argon2.hash(password);
  }

  generateErrorResponse(err: any, entity: string) {
    console.log(err);
    if (err?.code === 'P2025') {
      throw new BadRequestException(`${entity} not found`);
    } else if (err?.code === 'P2002' || err.response?.status === 409) {
      throw new ConflictException(`${entity} already exist`);
    }
    throw new InternalServerErrorException('Something went wrong');
  }

  customToken() {
    const bufferValue = Buffer.alloc(64);
    for (let i = 0; i < bufferValue.length; i++) {
      bufferValue[i] = Math.floor(Math.random() * 256);
    }
    const token = bufferValue.toString('base64');
    return token;
  }
}
