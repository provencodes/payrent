export class CreateMailerDto {}
import { IsEmail, IsNotEmpty, IsObject, IsString } from 'class-validator';

export class SendMailDto {
  @IsEmail()
  @IsString()
  to: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsNotEmpty()
  @IsString()
  template: string;

  @IsNotEmpty()
  @IsObject()
  context: {
    [key: string]: string;
  };
}
