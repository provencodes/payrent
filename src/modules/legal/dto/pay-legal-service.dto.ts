import { IsString, IsNumber, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PayLegalServiceDto {
  @ApiProperty({ example: 'package-uuid-here' })
  @IsUUID()
  legalPackageId: string;

  @ApiProperty({ example: 200000 })
  @IsNumber()
  amountPaid: number;

  @ApiProperty({ example: 'wallet' })
  @IsString()
  paymentMethod: string;

  @ApiProperty({ example: 'PAY-123456789' })
  @IsString()
  transactionRef: string;
}
