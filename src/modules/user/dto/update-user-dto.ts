import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsBoolean,
  IsObject,
} from 'class-validator';
import { UserType } from '../entities/user.entity';
import { FileObject } from './create-user.dto';
export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;
}

export class UpdateProfileDto {
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

  @ApiProperty({ type: FileObject, required: false })
  @IsOptional()
  @IsObject()
  profilePicture?: FileObject;

  @ApiProperty({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ example: 'Facebook' })
  @IsOptional()
  @IsString()
  howYouFoundUs?: string;

  @ApiProperty({ enum: UserType, example: UserType.TENANT })
  @IsOptional()
  @IsEnum(UserType)
  userType?: UserType;
}
