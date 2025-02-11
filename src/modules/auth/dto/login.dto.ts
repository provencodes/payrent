import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'The username of the user',
    example: 'test@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'password123',
  })
  @IsNotEmpty()
  @IsString()
  readonly password: string;
}
