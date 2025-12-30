import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ==================== Payment Initiate Response ====================

export class PaystackAuthorizationDataDto {
  @ApiProperty({ example: 'https://checkout.paystack.com/abc123xyz' })
  authorization_url: string;

  @ApiProperty({ example: 'abc123xyz789' })
  access_code: string;

  @ApiProperty({ example: 'PAY_ref_1234567890' })
  reference: string;
}

export class InitiatePaymentResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Payment initiated successfully' })
  message: string;

  @ApiProperty({ example: 200 })
  status_code: number;

  @ApiProperty({ type: PaystackAuthorizationDataDto })
  data: PaystackAuthorizationDataDto;
}

// ==================== Payment Verify Response ====================

export class VerifyPaymentDataDto {
  @ApiProperty({ example: true })
  verified: boolean;

  @ApiProperty({ example: 'success' })
  status: string;

  @ApiProperty({ example: 'PAY_ref_1234567890' })
  reference: string;

  @ApiProperty({ example: 500000 })
  amount: number;

  @ApiProperty({ example: 'NGN' })
  currency: string;

  @ApiProperty({ example: '2025-01-15T10:30:00.000Z' })
  paid_at: string;

  @ApiPropertyOptional({ example: 'rent-payment' })
  transaction_type?: string;

  @ApiPropertyOptional({ example: 'd3f7a939-4fc0-4a1e-9a0b-92b748c63e2a' })
  property_id?: string;
}

export class VerifyPaymentResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Payment verified successfully' })
  message: string;

  @ApiProperty({ example: 200 })
  status_code: number;

  @ApiProperty({ type: VerifyPaymentDataDto })
  data: VerifyPaymentDataDto;
}

// ==================== Bank List Response ====================

export class BankDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Access Bank' })
  name: string;

  @ApiProperty({ example: 'access bank' })
  slug: string;

  @ApiProperty({ example: '044' })
  code: string;

  @ApiProperty({ example: 'nuban' })
  type: string;

  @ApiProperty({ example: 'NGN' })
  currency: string;

  @ApiProperty({ example: true })
  active: boolean;

  @ApiPropertyOptional({ example: true })
  pay_with_bank?: boolean;
}

export class BankListResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Banks fetched successfully' })
  message: string;

  @ApiProperty({ example: 200 })
  status_code: number;

  @ApiProperty({ type: [BankDto], isArray: true })
  data: BankDto[];
}

// ==================== Verify Account Response ====================

export class VerifyAccountDataDto {
  @ApiProperty({ example: '0123456789' })
  account_number: string;

  @ApiProperty({ example: 'JOHN DOE' })
  account_name: string;

  @ApiProperty({ example: 1 })
  bank_id: number;
}

export class VerifyAccountResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Account verified successfully' })
  message: string;

  @ApiProperty({ example: 200 })
  status_code: number;

  @ApiProperty({ type: VerifyAccountDataDto })
  data: VerifyAccountDataDto;
}

// ==================== Webhook Response ====================

export class WebhookResponseDto {
  @ApiProperty({ example: 200 })
  status: number;

  @ApiProperty({ example: 'Webhook processed successfully' })
  message: string;
}
