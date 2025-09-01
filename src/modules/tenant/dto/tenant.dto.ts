import { ApiProperty } from '@nestjs/swagger';
// import { PartialType } from '@nestjs/mapped-types';
import { IsNumber, IsString, IsUUID, IsEnum, IsDate } from 'class-validator';

export enum PaymentDuration {
  THREE_MONTH = 3,
  SIX_MONTH = 6,
  NINE_MONTH = 9,
  TWELVE_MONTH = 12,
}

export class SaveRentDto {
  // @ApiProperty({
  //   example: 'd3f7a939-4fc0-4a1e-9a0b-92b748c63e2a',
  //   description: 'UUID of the user creating the wallet',
  // })
  // @IsUUID()
  // userId: string;

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
}

export class FundSavingsDto {
  @ApiProperty({
    example: 5000,
    description: 'Amount to contribute to savings',
  })
  @IsNumber()
  amount: number;
}

// export class UpdateTenantDto extends PartialType(CreateTenantDto) {}
