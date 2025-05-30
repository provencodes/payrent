import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { IsNumber, IsString, IsUUID } from 'class-validator';

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
  @IsNumber()
  amount: number;

  @ApiProperty({
    example: 'd3f7a939-4fc0-4a1e-9a0b-92b748c63e2a',
    description: 'User ID of the wallet owner',
  })
  @IsNumber()
  userId: string;
}

export class PayWithWalletDto {
  @ApiProperty({
    example: 1500.0,
    description: 'Amount to deduct from the wallet',
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    example: 'd3f7a939-4fc0-4a1e-9a0b-92b748c63e2a',
    description: 'User ID of the wallet owner',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    example: 'Bingo ticket purchase',
    description: 'Purpose of the wallet payment',
  })
  @IsString()
  reason: string;
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

export class UpdateWalletDto extends PartialType(CreateWalletDto) {}
