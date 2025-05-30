import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
  IsOptional,
} from 'class-validator';
import { UserType } from '../../user/entities/user.entity';

export class CreateUserDTO {
  @ApiProperty({
    description: 'The unique email for the new user.',
    example: 'johndoe@test.com',
    required: true,
    type: String,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'The unique username for the new user.',
    example: 'john_doe',
    required: true,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The password for the new user. Must meet security criteria',
    example: 'SecureP@ssw0rd',
    required: true,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/(?=.*[a-z])/, {
    message: 'Password must contain at least one lowercase letter',
  })
  @Matches(/(?=.*[A-Z])/, {
    message: 'Password must contain at least one uppercase letter',
  })
  @Matches(/(?=.*\d)/, { message: 'Password must contain at least one number' })
  @Matches(/(?=.*[\W_])/, {
    message: 'Password must contain at least one special character',
  })
  password: string;

  @ApiProperty({ enum: UserType, description: 'Type of User.' })
  @IsEnum(UserType)
  @IsNotEmpty()
  userType: UserType;

  @ApiProperty({
    description: 'How the user hear about payrent.',
    example: 'agent',
    required: true,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  howYouHear: string;

  @ApiPropertyOptional({
    description: 'Referral code of the person that invite you.',
    example: 'agen-007-uuid',
    type: String,
  })
  @IsString()
  @IsOptional()
  refferalCode: string;
}
