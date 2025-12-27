import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserType } from '../../user/entities/user.entity';

/**
 * User info object that Apple sends on first login only
 */
class AppleUserInfo {
  @ApiPropertyOptional({
    description: "User's first name (only on first login)",
    example: 'John',
  })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({
    description: "User's last name (only on first login)",
    example: 'Doe',
  })
  @IsString()
  @IsOptional()
  lastName?: string;
}

class AppleUserData {
  @ApiPropertyOptional({
    description: "User's email (only on first login if not hidden)",
    example: 'user@example.com',
  })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: "User's name info",
  })
  @IsOptional()
  name?: AppleUserInfo;
}

export class AppleAuthPayloadDto {
  @ApiProperty({
    description: 'Identity token (JWT) from Apple Sign In',
    example: 'eyJraWQiOiJXNldjT0tC...',
  })
  @IsString()
  @IsNotEmpty()
  identityToken: string;

  @ApiPropertyOptional({
    description: 'Authorization code from Apple (for server-side validation)',
    example: 'c1234567890abcdef...',
  })
  @IsString()
  @IsOptional()
  authorizationCode?: string;

  @ApiPropertyOptional({
    description: 'User data from Apple (only provided on first login)',
  })
  @IsOptional()
  user?: AppleUserData;

  @ApiPropertyOptional({
    description: 'User account type',
    example: UserType.TENANT,
    enum: UserType,
  })
  @IsOptional()
  userType?: UserType;

  @ApiPropertyOptional({
    description: 'Nonce used for verification (if provided during sign in)',
    example: 'random-nonce-string',
  })
  @IsString()
  @IsOptional()
  nonce?: string;
}
