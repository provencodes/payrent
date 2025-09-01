import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNumber, IsEnum, IsOptional, Min, Max } from 'class-validator';

export enum PaymentMethod {
  CARD = 'card',
  WALLET = 'wallet',
  BANK_TRANSFER = 'bank_transfer',
}

export class RentPropertyDto {
  @ApiProperty({
    example: 'a9a1b3d2-9124-4d53-87d4-d6a1bc5a2b7d',
    description: 'UUID of the property to rent',
  })
  @IsUUID('4', { message: 'propertyId must be a valid UUID' })
  propertyId: string;

  @ApiProperty({
    example: 12,
    description: 'Rental duration in months (1-24)',
  })
  @IsNumber({}, { message: 'Duration must be a valid number' })
  @Min(1, { message: 'Minimum rental duration is 1 month' })
  @Max(24, { message: 'Maximum rental duration is 24 months' })
  duration: number;

  @ApiProperty({
    enum: PaymentMethod,
    example: PaymentMethod.WALLET,
    description: 'Payment method for rent',
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({
    example: '0108696089',
    description: 'Account number (required for bank transfer)',
    required: false,
  })
  @IsOptional()
  accountNumber?: string;

  @ApiProperty({
    example: '063',
    description: 'Bank code (required for bank transfer)',
    required: false,
  })
  @IsOptional()
  bankCode?: string;
}