import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsEmail, IsNumber, IsOptional, IsString, IsUUID, IsObject, ValidateNested, } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";


export class CreateAccountDto {
  @ApiProperty()
  @IsString()
  name?: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  password?: string;
}

export class CreateUserDto {

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  name?: string;
}


export class UserDto {
  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiProperty({ required: false, nullable: true, })
  @IsString()
  @IsOptional()
  firstName: string | null;

  @ApiProperty({ required: false, nullable: true })
  @IsString()
  @IsOptional()
  lastName: string | null;

  @ApiProperty({ required: false, nullable: true })
  @IsString()
  @IsOptional()
  name: string | null;

  @ApiProperty({ required: false, nullable: true })
  @IsString()
  @IsOptional()
  phone: string | null;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsBoolean()
  isVerified: boolean;

  @ApiProperty()
  @IsString()
  userType: string;

  @ApiProperty()
  @IsString()
  status: string;

  @ApiProperty()
  @IsDate()
  createdAt: Date;

  @ApiProperty()
  @IsDate()
  updatedAt: Date;

  @ApiProperty({ required: false, nullable: true })
  @IsDate()
  @IsOptional()
  deletedAt: Date | null;
}   

export class CreateAccountResponseDto {
  @ApiProperty({ enum: [201] })
  @IsNumber()
  responseCode: number;

  @ApiProperty()
  @IsBoolean()
  success: boolean;

  @ApiProperty({ example: 'User created successfully' })
  @IsString()
  message: string;

  @ApiProperty()
  @IsObject()
  @ValidateNested()
  @Type(() => UserDto)
  user: UserDto;
}
