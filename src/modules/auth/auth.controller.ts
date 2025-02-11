import {
  Body,
  Controller,
  Get,
  HttpCode,
  // HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBody,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';

import { skipAuth } from '../../helpers/skipAuth';
import AuthenticationService from './auth.service';
import { CreateUserDTO } from './dto/create-user.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { LoginDto } from './dto/login.dto';

import { AuthGuard } from '@nestjs/passport';
import {
  CreateUserErrorResponse,
  CreateUserSuccessResponse,
} from '../user/dto/user-response.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import GoogleAuthPayload from './interfaces/GoogleAuthPayloadInterface';
import { ChangePasswordDto } from './dto/change-password.dto';
import { GoogleAuthPayloadDto } from './dto/google-auth.dto';
import { FacebookAuthPayloadDto } from './dto/facebook-auth.dto';
import FacebookAuthPayload from './interfaces/FacebookAuthPayloadInterface';
import {
  EmailVerificationDto,
  ResendEmailVerificationDto,
} from './dto/verify-email.dto';
import {
  ApiVerificationEmailResponsesDoc,
  ApiResendVerificationEmailResponsesDoc,
  changePasswordWithOtp,
} from './docs/email-verification.docs';
import { ResetPasswordDto } from './dto/reset-password-dto';

@ApiTags('Authentication')
@Controller('auth')
export default class RegistrationController {
  constructor(private authService: AuthenticationService) {}

  @Post('register')
  @skipAuth()
  @ApiOperation({ summary: 'User Registration' })
  @ApiResponse({
    status: 201,
    description: 'Register a new user',
    type: CreateUserSuccessResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
    type: CreateUserErrorResponse,
  })
  @ApiInternalServerErrorResponse({
    description: 'Something went wrong on the server',
    // status: HttpStatus.INTERNAL_SERVER_ERROR,
    schema: {
      properties: {
        message: { type: 'string', example: 'An error occurred' },
        error: { type: 'string', example: 'Failed to send verification email' },
        status_code: { type: 'integer', example: 500 },
      },
    },
  })
  @HttpCode(201)
  public async register(@Body() body: CreateUserDTO) {
    return this.authService.createNewUser(body);
  }

  @skipAuth()
  @Post('login')
  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(200)
  async login(
    @Body() loginDto: LoginDto,
  ): Promise<LoginResponseDto | { status_code: number; message: string }> {
    return this.authService.loginUser(loginDto);
  }

  @skipAuth()
  @Post('google')
  @ApiOperation({ summary: 'Google authentication' })
  @ApiBody({ type: GoogleAuthPayloadDto })
  @ApiResponse({
    status: 200,
    description: 'Verify payload sent from google',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Google authentication failed!' })
  @HttpCode(200)
  async googleAuth(@Body() body: GoogleAuthPayload) {
    return await this.authService.googleAuth(body);
  }

  @skipAuth()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req) {
    return req.user;
  }

  @skipAuth()
  @Post('facebook')
  @ApiOperation({ summary: 'Facebook authentication' })
  @ApiBody({ type: FacebookAuthPayloadDto })
  @ApiResponse({
    status: 200,
    description: 'Verify payload sent from facebook',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Facebook authentication failed!' })
  async facebookLogin(@Body() body: FacebookAuthPayload) {
    return await this.authService.facebookAuth(body);
  }

  @ApiOperation({ summary: 'Change password' })
  @ApiResponse({
    status: 200,
    description: 'Change users password',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid credentials' })
  @HttpCode(400)
  @Post('change-password/:userId')
  async changePassword(
    @Param() userId: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(userId, changePasswordDto);
  }

  @skipAuth()
  @ApiOperation({ summary: 'Password reset' })
  @ApiResponse({
    status: 200,
    description: 'Password reset link has been sent to your email',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({ description: 'invalid email' })
  @HttpCode(400)
  @Post('reset-password')
  async resetPassword(@Body() data: { email: string }) {
    return await this.authService.sendResetPasswordPin(data.email);
  }

  @skipAuth()
  @ApiOperation({ summary: 'OTP verification' })
  @ApiResponse({
    status: 200,
    description: 'OTP verified',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({ description: 'invalid OTP' })
  @HttpCode(400)
  @Post('reset-password/:email')
  async verifyOtp(
    @Param('email') email: string,
    @Body() data: { otp: string },
  ) {
    return await this.authService.verifyOtp(
      email.toString(),
      data.otp.toString(),
    );
  }

  @skipAuth()
  @ApiVerificationEmailResponsesDoc()
  @Get('verify-email/:token')
  async verifyEmail(@Param() verifyEmailDto: EmailVerificationDto) {
    const { token } = verifyEmailDto;
    return await this.authService.verifyEmail(token);
  }

  @skipAuth()
  @ApiResendVerificationEmailResponsesDoc()
  @Post('resend-verification-email')
  async resendVerificationEmail(
    @Body() resendEmailVerificationDto: ResendEmailVerificationDto,
  ) {
    const { email } = resendEmailVerificationDto;
    return await this.authService.resendVerificationEmail(email);
  }

  @skipAuth()
  @changePasswordWithOtp()
  @Post('new-password')
  async newPassword(@Body() newPassworddto: ResetPasswordDto) {
    const { newPassword, email } = newPassworddto;
    return await this.authService.resetPassword(email, newPassword);
  }
}
