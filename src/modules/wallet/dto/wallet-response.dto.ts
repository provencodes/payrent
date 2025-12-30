import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ==================== Wallet Data DTOs ====================

export class WalletDataDto {
  @ApiProperty({ example: 'd3f7a939-4fc0-4a1e-9a0b-92b748c63e2a' })
  id: string;

  @ApiProperty({ example: 'a1b2c3d4-5678-90ab-cdef-123456789abc' })
  userId: string;

  @ApiProperty({
    example: '500000',
    description: 'Balance in kobo (smallest currency unit)',
  })
  balanceKobo: string;

  @ApiProperty({
    example: 5000,
    description: 'Balance in naira (computed from balanceKobo)',
  })
  balance: number;

  @ApiPropertyOptional({ example: 'CUS_abc123xyz' })
  paystackCustomerCode?: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2025-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-01-15T10:30:00.000Z' })
  updatedAt: Date;
}

// ==================== Create Wallet Response ====================

export class CreateWalletResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Wallet created successfully' })
  message: string;

  @ApiProperty({ example: 201 })
  status_code: number;

  @ApiProperty({ type: WalletDataDto })
  data: WalletDataDto;
}

// ==================== Get Wallet Response ====================

export class GetWalletResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Wallet retrieved successfully' })
  message: string;

  @ApiProperty({ example: 200 })
  status_code: number;

  @ApiProperty({ type: WalletDataDto })
  data: WalletDataDto;
}

// ==================== Fund Wallet Response ====================

export class FundWalletDataDto {
  @ApiProperty({ example: 'https://checkout.paystack.com/abc123xyz' })
  authorization_url: string;

  @ApiProperty({ example: 'abc123xyz789' })
  access_code: string;

  @ApiProperty({ example: 'PAY_ref_1234567890' })
  reference: string;
}

export class FundWalletResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Payment initiated successfully' })
  message: string;

  @ApiProperty({ example: 200 })
  status_code: number;

  @ApiProperty({ type: FundWalletDataDto })
  data: FundWalletDataDto;
}

// ==================== Pay With Wallet Response ====================

export class PayWithWalletDataDto {
  @ApiProperty({ example: 'TXN_1234567890' })
  transactionId: string;

  @ApiProperty({ example: 1500 })
  amountDeducted: number;

  @ApiProperty({ example: 3500 })
  newBalance: number;

  @ApiProperty({ example: 'shares' })
  reason: string;
}

export class PayWithWalletResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Payment successful' })
  message: string;

  @ApiProperty({ example: 200 })
  status_code: number;

  @ApiProperty({ type: PayWithWalletDataDto })
  data: PayWithWalletDataDto;
}

// ==================== Verify Funding Response ====================

export class VerifyFundingDataDto {
  @ApiProperty({ example: true })
  verified: boolean;

  @ApiProperty({ example: 5000 })
  amountFunded: number;

  @ApiProperty({ example: 10000 })
  newBalance: number;

  @ApiProperty({ example: 'PAY_ref_1234567890' })
  reference: string;
}

export class VerifyFundingResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Wallet funded successfully' })
  message: string;

  @ApiProperty({ example: 200 })
  status_code: number;

  @ApiProperty({ type: VerifyFundingDataDto })
  data: VerifyFundingDataDto;
}
