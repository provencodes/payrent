import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  // IsPositive,
  IsUUID,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum InvestType {
  SHARES = 'shares',
  APARTMENT = 'property',
}

export enum PaymentType {
  ONE_TIME = 'one_time',
  INSTALLMENT = 'installment',
}

export enum PaymentFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

export class CommercialDto {
  @ApiProperty({
    enum: InvestType,
    example: InvestType.SHARES,
    description: 'Type of commercial investment: shares or property',
  })
  @IsEnum(InvestType, {
    message: 'type must be either "shares" or "property"',
  })
  investmentType: InvestType;

  @ApiProperty({
    example: 'a9a1b3d2-9124-4d53-87d4-d6a1bc5a2b7d',
    description: 'UUID of the property to invest in',
  })
  @IsUUID('4', { message: 'propertyId must be a valid UUID' })
  propertyId: string;

  @ApiPropertyOptional({
    example: 10,
    description: 'Number of shares to purchase',
  })
  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'shares must be at least 1' })
  shares?: number;

  @ApiPropertyOptional({
    example: 12,
    description: 'Duration of the investment in months',
  })
  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'numberOfMonths must be at least 1' })
  numberOfMonths?: number;

  @ApiProperty({
    enum: PaymentType,
    example: PaymentType.INSTALLMENT,
    description: 'How the user intends to pay: one_time or installment',
  })
  @IsEnum(PaymentType, {
    message: 'paymentType must be either "one_time" or "installment"',
  })
  paymentType: PaymentType;

  @ApiPropertyOptional({
    enum: PaymentFrequency,
    example: PaymentFrequency.MONTHLY,
    description: 'Frequency of automatic charges (used if installment)',
  })
  @IsOptional()
  @IsEnum(PaymentFrequency, {
    message: 'paymentFrequency must be one of "daily", "weekly", or "monthly"',
  })
  paymentFrequency?: PaymentFrequency;
}

export class JointVentureDto {
  @ApiProperty({
    example: 'a9a1b3d2-9124-4d53-87d4-d6a1bc5a2b7d',
    description: 'UUID of the property to invest in',
  })
  @IsUUID('4', { message: 'propertyId must be a valid UUID' })
  propertyId: string;

  @ApiProperty({
    example: 1000,
    description: 'Amount to invest',
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    example: 'one_time',
    description: 'How the user intends to pay: one_time or installment',
  })
  @IsEnum(PaymentType, {
    message: 'paymentType must be either "one_time" or "installment"',
  })
  paymentType: string;

  @ApiPropertyOptional({
    example: 'monthly',
    description: 'Frequency of automatic charges (used if installment)',
  })
  @IsOptional()
  @IsEnum(PaymentFrequency, {
    message: 'paymentFrequency must be one of "daily", "weekly", or "monthly"',
  })
  paymentFrequency: string;

  @ApiProperty({
    example: 'joint-venture',
    description: 'What the user is paying for',
  })
  @IsString()
  investmentType: string;
}
