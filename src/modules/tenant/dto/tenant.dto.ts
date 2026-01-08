import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsString,
  IsEnum,
  IsDate,
  IsOptional,
} from 'class-validator';
import { PaymentOption } from '../../commercial/dto/commercial.dto';

export enum PaymentDuration {
  THREE_MONTH = 3,
  SIX_MONTH = 6,
  NINE_MONTH = 9,
  TWELVE_MONTH = 12,
}

export class SaveRentDto {
  @ApiProperty({
    example: 5000.0,
    description: 'Amount to save for rent',
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    example: 50000.0,
    description: 'Target savings amount',
  })
  @IsNumber()
  totalSavingsGoal: number;

  @ApiProperty({
    example: '06-06-2026',
    description: 'The date the savings will mature',
  })
  @IsDate()
  maturityDate: Date;

  @ApiProperty({
    enum: PaymentDuration,
    example: PaymentDuration.TWELVE_MONTH,
    description: 'Savings duration',
  })
  @IsEnum(PaymentDuration, {
    message: 'Selected payment duration should be 3 or 6 or 9 or 12',
  })
  duration: PaymentDuration;

  @ApiProperty({
    example: 'Month end',
    description: 'Day of the month to auto save',
  })
  @IsString()
  automation: string;

  @ApiProperty({
    example: 5,
    description: 'Percentage Interest rate',
  })
  @IsNumber()
  interestRate: number;

  @ApiProperty({
    example: 5000.0,
    description: 'Savings target plus interest',
  })
  @IsNumber()
  estimatedReturn: number;

  @ApiPropertyOptional({
    enum: PaymentOption,
    example: PaymentOption.WALLET,
    description: 'Payment option: card, wallet, bank, or transfer',
  })
  @IsOptional()
  @IsEnum(PaymentOption)
  paymentOption?: PaymentOption;

  @ApiPropertyOptional({
    example: '0108696089',
    description: 'Account number (required for bank payment)',
  })
  @IsOptional()
  @IsString()
  accountNumber?: string;

  @ApiPropertyOptional({
    example: '063',
    description: 'Bank code (required for bank payment)',
  })
  @IsOptional()
  @IsString()
  bankCode?: string;
}

export class FundSavingsDto {
  @ApiProperty({
    example: 5000,
    description: 'Amount to contribute to savings',
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    enum: PaymentOption,
    example: PaymentOption.WALLET,
    description: 'Payment option: card, wallet, bank, or transfer',
  })
  @IsEnum(PaymentOption)
  paymentOption: PaymentOption;

  @ApiPropertyOptional({
    example: '0108696089',
    description: 'Account number (required for bank payment)',
  })
  @IsOptional()
  @IsString()
  accountNumber?: string;

  @ApiPropertyOptional({
    example: '063',
    description: 'Bank code (required for bank payment)',
  })
  @IsOptional()
  @IsString()
  bankCode?: string;
}

// export class UpdateTenantDto extends PartialType(CreateTenantDto) {}
