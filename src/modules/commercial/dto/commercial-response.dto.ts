import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ==================== Investment Response ====================

export class InvestmentDataDto {
  @ApiProperty({ example: 'https://checkout.paystack.com/abc123xyz' })
  authorization_url: string;

  @ApiProperty({ example: 'abc123xyz789' })
  access_code: string;

  @ApiProperty({ example: 'PAY_ref_1234567890' })
  reference: string;

  @ApiPropertyOptional({ example: 'd3f7a939-4fc0-4a1e-9a0b-92b748c63e2a' })
  installmentId?: string;

  @ApiPropertyOptional({ example: 'SUB_abc123' })
  subscriptionCode?: string;
}

export class InvestmentResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Investment payment initiated successfully' })
  message: string;

  @ApiProperty({ example: 200 })
  status_code: number;

  @ApiProperty({ type: InvestmentDataDto })
  data: InvestmentDataDto;
}

// ==================== Joint Venture Response ====================

export class JointVentureResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Joint venture payment initiated successfully' })
  message: string;

  @ApiProperty({ example: 200 })
  status_code: number;

  @ApiProperty({ type: InvestmentDataDto })
  data: InvestmentDataDto;
}
