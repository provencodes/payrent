import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyPaymentDto {
  @ApiProperty({
    description: 'reference of the transaction',
    example: '9e9936b46z',
  })
  @IsNotEmpty()
  @IsString()
  reference: string;
}
