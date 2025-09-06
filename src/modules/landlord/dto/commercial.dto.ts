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
import { PaymentType } from 'src/modules/property/dto/create-property.dto';

export enum InvestType {
  SHARES = 'shares',
  PROPERTY = 'property',
  SALE = 'sale',
  RENT = 'rent',
  JOINT_VENTURE = 'joint-venture',
  CO_VEST = 'co-vest',
  FLIP = 'flip',
}

export enum PaymentFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

export enum PaymentOption {
  CARD = 'card',
  WALLET = 'wallet',
  TRANSFER = 'transfer',
  BANK = 'bank',
}

export class CommercialDto {
  @ApiProperty({
    enum: PaymentOption,
    example: PaymentOption.CARD,
    description: 'Payment option: card, wallet, or transfer',
  })
  @IsEnum(PaymentOption, {
    message: 'payment option can either be card, wallet, bank or transfer',
  })
  paymentOption: PaymentOption;

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

  @ApiPropertyOptional({
    example: '0108696089',
    description: 'User account number',
  })
  @IsOptional()
  @IsString()
  accountNumber: string;

  @ApiPropertyOptional({
    example: '063',
    description: 'Bank code of the selected bank',
  })
  @IsOptional()
  @IsString()
  bankCode: string;
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

  @ApiProperty({
    enum: PaymentOption,
    example: PaymentOption.CARD,
    description: 'Payment option: card, wallet, or transfer',
  })
  paymentOption: PaymentOption;

  @ApiPropertyOptional({
    example: 'monthly',
    description: 'Frequency of automatic charges (used if installment)',
  })
  @IsOptional()
  @IsEnum(PaymentFrequency, {
    message: 'paymentFrequency must be one of "daily", "weekly", or "monthly"',
  })
  paymentFrequency: PaymentFrequency;

  @ApiProperty({
    example: 'joint-venture',
    description: 'What the user is paying for',
  })
  @IsString()
  investmentType: string;

  @ApiPropertyOptional({
    example: '0108696089',
    description: 'User account number',
  })
  @IsOptional()
  @IsString()
  accountNumber: string;

  @ApiPropertyOptional({
    example: '063',
    description: 'Bank code of the selected bank',
  })
  @IsOptional()
  @IsString()
  bankCode: string;
}
