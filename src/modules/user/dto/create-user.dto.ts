import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { UserType } from '../entities/user.entity';

class FileObject {
  @ApiProperty({ example: 'https://example.com/image.jpg' })
  @IsString()
  url: string;

  @ApiProperty({ example: 'cloudinary_public_id' })
  @IsString()
  public_id: string;
}

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsOptional()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'active' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ example: '+2348012345678' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ example: 'Facebook' })
  @IsOptional()
  @IsString()
  howYouFoundUs?: string;

  @ApiProperty({ example: 'REF12345' })
  @IsOptional()
  @IsString()
  referralCode?: string;

  @ApiProperty({ example: 'male' })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiProperty({ example: '123 Main Street' })
  @IsOptional()
  @IsString()
  streetAddress?: string;

  @ApiProperty({ example: 'Lagos' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ example: 'Lagos' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ example: 'Nigeria' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ example: 'NIN' })
  @IsOptional()
  @IsString()
  idType?: string;

  @ApiProperty({ example: '1234567890' })
  @IsOptional()
  @IsString()
  idNumber?: string;

  @ApiProperty({ example: '12345678901' })
  @IsOptional()
  @IsString()
  bvn?: string;

  @ApiProperty({ example: 'https://example.com/id-card.jpg' })
  @IsOptional()
  @IsString()
  idDocument?: string;

  @ApiProperty({ example: '0123456789' })
  @IsOptional()
  @IsString()
  accountNumber?: string;

  @ApiProperty({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  accountName?: string;

  @ApiProperty({ example: 'GTBank' })
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiProperty({ type: [FileObject], required: false })
  @IsOptional()
  @IsArray()
  profilePicture?: FileObject;

  @ApiProperty({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ enum: UserType, example: UserType.TENANT })
  @IsOptional()
  @IsEnum(UserType)
  userType?: UserType;

  @ApiProperty({ example: 'AUTH_abc123' })
  @IsOptional()
  @IsString()
  paystackAuthCode?: string;

  @ApiProperty({ example: false })
  @IsOptional()
  @IsBoolean()
  autoCharge?: boolean;
}
