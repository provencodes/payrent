import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MinLength,
} from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'The old password of the user',
    example: 'seCure@1',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  oldPassword: string;

  @ApiProperty({
    description: 'The new password of the user',
    example: 'SecureseCure@123',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @IsStrongPassword(
    {},
    {
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
    },
  )
  newPassword: string;
}
