import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length } from 'class-validator';

export class VerifyIdentityDto {
  @ApiProperty({ example: '12345678901' })
  @IsString()
  @IsNotEmpty()
  @Length(11, 11, { message: 'Number must be exactly 11 digits' })
  number: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: '1990-01-01' })
  @IsString()
  @IsNotEmpty()
  dob: string;
}
