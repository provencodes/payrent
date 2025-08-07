import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserType } from '../../user/entities/user.entity';
import { IsOptional, IsString } from 'class-validator';

export class GoogleAuthPayloadDto {
  @ApiPropertyOptional({
    description: 'Access token provided by Google',
    example: 'ya29.a0AfH6SMBb4JG...',
  })
  @IsString()
  @IsOptional()
  access_token?: string;

  @ApiPropertyOptional({
    description: 'Expiration time in seconds for the access token',
    example: 3599,
  })
  @IsOptional()
  expires_in?: number;

  @ApiPropertyOptional({
    description: 'Refresh token provided by Google',
    example: '1//09gJ...',
  })
  @IsString()
  @IsOptional()
  refresh_token?: string;

  @ApiPropertyOptional({
    description: 'Scope of the access token',
    example: 'https://www.googleapis.com/auth/userinfo.profile',
  })
  @IsString()
  @IsOptional()
  scope?: string;

  @ApiPropertyOptional({
    description: 'Type of the token provided',
    example: 'Bearer',
  })
  @IsString()
  @IsOptional()
  token_type?: string;

  @ApiPropertyOptional({
    description: 'ID token provided by Google',
    example: 'eyJhbGciOiJSUzI1NiIs...',
  })
  @IsString()
  @IsOptional()
  id_token?: string;

  @ApiPropertyOptional({
    description: 'Expiration time in epoch format',
    example: 1629716100,
  })
  @IsOptional()
  expires_at?: number;

  @ApiPropertyOptional({
    description: 'Provider of the authentication service',
    example: 'google',
  })
  @IsString()
  @IsOptional()
  provider?: string;

  @ApiPropertyOptional({
    description: 'Type of the authentication',
    example: 'oauth',
  })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({
    description: 'Provider account ID',
    example: '1234567890',
  })
  @IsString()
  @IsOptional()
  providerAccountId?: string;

  @ApiPropertyOptional({
    description: 'User account Type',
    example: UserType.TENANT,
  })
  @IsOptional()
  userType?: UserType;
}
