import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty()
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @IsStrongPassword(
    {},
    {
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
    }
  )
  newPassword: string;
}
