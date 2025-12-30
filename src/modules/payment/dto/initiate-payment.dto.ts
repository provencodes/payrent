import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { PaymentMethod } from '../enums/payment-method.enum';
import { TransactionType } from '../enums/transaction-type';

export class InitiatePaymentDto {
  @ApiProperty({
    example: 'johndoe@example.com',
    description: 'Email address for payment notification',
  })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 50000,
    description: 'Amount to pay in kobo',
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    enum: PaymentMethod,
    example: 'card',
    description: 'Payment method: card, bank, transfer',
  })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @ApiProperty({
    enum: TransactionType,
    example: 'rent',
    description: 'Type of transaction',
  })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty({
    example: 'd3f7a939-4fc0-4a1e-9a0b-92b748c63e2a',
    description: 'UUID of the property being paid for',
  })
  @IsString()
  @IsNotEmpty()
  propertyId: string;
}
