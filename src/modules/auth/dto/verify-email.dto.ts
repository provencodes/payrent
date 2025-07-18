import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsJWT, IsString } from 'class-validator';

export class EmailVerificationDto {
  @ApiProperty({ type: 'string', description: 'A valid JWT token' })
  @IsJWT()
  token: string;
}

export class ResendEmailVerificationDto {
  @ApiProperty({
    type: 'string',
    description: 'A valid email',
    example: 'test@example.com',
  })
  @IsEmail()
  email: string;
}

export class VerifyOtpDto {
  @ApiProperty({
    type: 'string',
    description: 'A valid OTP',
    example: '123456',
  })
  @IsString()
  otp: string;
}
