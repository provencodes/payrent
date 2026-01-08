import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import {
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  IsUUID,
  Min,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { PaymentOption } from '../../commercial/dto/commercial.dto';

export class CreateWalletDto {
  @ApiProperty({
    example: 'd3f7a939-4fc0-4a1e-9a0b-92b748c63e2a',
    description: 'UUID of the user creating the wallet',
  })
  @IsUUID()
  userId: string;
}

export class FundWalletDto {
  @ApiProperty({
    example: 5000.0,
    description: 'Amount to fund the wallet with',
  })
  @IsInt()
  @IsPositive()
  @Min(100)
  amountNaira: number;

  @ApiProperty({
    example: 'd3f7a939-4fc0-4a1e-9a0b-92b748c63e2a',
    description: 'User ID of the wallet owner',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    example: 'johndoe@exmaple.com',
    description: 'User email',
  })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({
    enum: PaymentOption,
    example: PaymentOption.CARD,
    description: 'Payment option: card, bank, or transfer (wallet not allowed)',
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

export class PayWithWalletDto {
  @ApiProperty({
    example: 1500.0,
    description: 'Amount to deduct from the wallet',
  })
  @IsInt()
  @IsPositive()
  amountNaira: number;

  @ApiProperty({
    example: 'd3f7a939-4fc0-4a1e-9a0b-92b748c63e2a',
    description: 'User ID of the wallet owner',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    example: 'shares',
    description: 'Purpose of the wallet payment',
  })
  @IsString()
  reason: string;

  @ApiProperty({
    example: 'shares',
    description: 'Description of the payment',
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}

export class VerifyWalletFundingDto {
  @ApiProperty({
    example: 'user_id_123',
    description: 'User ID funding the wallet',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    example: 'paystack_reference_abc123',
    description: 'Paystack transaction reference',
  })
  @IsString()
  reference: string;
}

export class WithdrawDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  bankCode: string;

  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @IsInt()
  @IsPositive()
  amountNaira: number;
}

export class UpdateWalletDto extends PartialType(CreateWalletDto) {}
