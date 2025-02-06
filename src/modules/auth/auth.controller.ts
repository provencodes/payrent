import {
  Controller,
  Post,
  Res,
  UseGuards,
  Get,
  Req,
  Headers,
} from '@nestjs/common';
import { Response } from 'express';
import { User } from 'src/modules/user/entities/user.entity';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CurrentUser } from './current-user.decorator';
import { GoogleAuthGuard } from './guards/google-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login(user, response);
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  googleAuthCallback(
    @Req() req,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.googleLogin(req.user, response);
  }

  @Post('google')
  googleAuth(
    @Headers('Authorization') token: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.googleLogin(token, response);
  }
}
