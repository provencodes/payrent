import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token to exchange for new tokens',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsNotEmpty()
  refresh_token: string;
}

export class TokenResponseDto {
  @ApiProperty({ description: 'JWT access token for API authentication' })
  access_token: string;

  @ApiProperty({ description: 'Refresh token for obtaining new access tokens' })
  refresh_token: string;

  @ApiPropertyOptional({ description: 'Success message' })
  message?: string;

  @ApiProperty({ description: 'HTTP status code' })
  status_code: number;

  @ApiProperty({
    description: 'User data',
    example: {
      user: {
        id: 'uuid',
        email: 'user@example.com',
        name: 'John Doe',
      },
    },
  })
  data: {
    user: {
      id: string;
      email: string;
      name: string;
      profilePicture?: { url: string; public_id: string };
      userType?: string;
    };
  };
}

export class LogoutResponseDto {
  @ApiProperty({ example: 'Logged out successfully' })
  message: string;

  @ApiProperty({ example: 200 })
  status_code: number;
}

export class LogoutAllResponseDto {
  @ApiProperty({ example: 'All sessions terminated successfully' })
  message: string;

  @ApiProperty({ example: 200 })
  status_code: number;

  @ApiPropertyOptional({
    example: 5,
    description: 'Number of sessions terminated',
  })
  sessions_terminated?: number;
}
