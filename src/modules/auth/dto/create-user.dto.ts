import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateUserDTO {
  @ApiProperty({
    description: 'The unique email for the new user.',
    example: 'johndoe@test.com',
    required: true,
    type: String,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description:
      'The unique username for the new user, Auto-generated if omitted.',
    example: 'john_doe',
    required: true,
    type: String,
  })
  @IsString()
  username: string;

  @ApiProperty({
    description: 'The password for the new user. Must meet security criteria',
    example: 'SecureP@ssw0rd',
    required: true,
    type: String,
  })
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
}
