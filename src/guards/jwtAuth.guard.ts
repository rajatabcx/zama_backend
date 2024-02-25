import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from './public.guard';
import { IS_AMP } from './amp.guard';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const isAmp = this.reflector.getAllAndOverride<boolean>(IS_AMP, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isAmp) {
      const request = context.switchToHttp().getRequest();
      const response = context.switchToHttp().getResponse();

      const { __amp_source_origin } = request.query;

      const origin = request.headers.origin;
      const ampEmailSender = request.headers['amp-email-sender'];

      if (ampEmailSender) {
        response.header('AMP-Email-Allow-Sender', ampEmailSender);
      } else if (!ampEmailSender) {
        response.header('Access-Control-Allow-Origin', origin);
        response.header(
          'Access-Control-Expose-Headers',
          'AMP-Access-Control-Allow-Source-Origin',
        );
        response.header(
          'AMP-Access-Control-Allow-Source-Origin',
          __amp_source_origin,
        );
      }
    }

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Please log in');
    }
    return user;
  }
}
