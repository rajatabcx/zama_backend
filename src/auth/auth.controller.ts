import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from 'src/guards';
import {
  ForgotPasswordDTO,
  ResetPasswordDTO,
  SigninDTO,
  SignupDTO,
} from './dto';
import { Request, Response } from 'express';

@Controller('/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('/signup')
  signUp(@Body() data: SignupDTO) {
    return this.authService.signUp(data);
  }

  @Public()
  @Post('/signin')
  signIn(@Body() data: SigninDTO, @Res({ passthrough: true }) res: Response) {
    return this.authService.signIn(data, res);
  }

  @Public()
  @Post('/forgot-password')
  forgotPassword(@Body() data: ForgotPasswordDTO) {
    return this.authService.forgotPassword(data);
  }

  @Public()
  @Post('/reset-password')
  resetPassword(@Body() data: ResetPasswordDTO) {
    return this.authService.resetPassword(data);
  }

  @Public()
  @Post('/refresh')
  refresh(@Req() request: Request) {
    const cookies = request.cookies;
    return this.authService.refreshToken(cookies.refreshToken);
  }

  @Post('/signout')
  signOut(@Req() request: Request, @Res({ passthrough: true }) res: Response) {
    const cookies = request.cookies;
    return this.authService.signOut(cookies.refreshToken, res);
  }
}
