import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ==================== Transaction History Response ====================

export class TransactionDataDto {
  @ApiProperty({ example: 'd3f7a939-4fc0-4a1e-9a0b-92b748c63e2a' })
  id: string;

  @ApiProperty({ example: 'payment' })
  type: string;

  @ApiProperty({ example: 50000 })
  amount: number;

  @ApiProperty({ example: 'success', enum: ['pending', 'success', 'failed'] })
  status: string;

  @ApiProperty({ example: 'Rent payment for Property ABC' })
  description: string;

  @ApiProperty({ example: 'PAY_ref_123456' })
  reference: string;

  @ApiProperty({ example: '2025-01-15T10:30:00.000Z' })
  createdAt: Date;
}

export class TransactionHistoryResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Transaction history fetched successfully' })
  message: string;

  @ApiProperty({ example: 200 })
  status_code: number;

  @ApiProperty({ type: [TransactionDataDto], isArray: true })
  data: TransactionDataDto[];

  @ApiPropertyOptional({
    example: { page: 1, limit: 20, total: 50, totalPages: 3 },
  })
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ==================== Wallet History Response ====================

export class WalletTransactionDataDto {
  @ApiProperty({ example: 'd3f7a939-4fc0-4a1e-9a0b-92b748c63e2a' })
  id: string;

  @ApiProperty({ example: 'credit', enum: ['credit', 'debit'] })
  type: string;

  @ApiProperty({ example: 5000 })
  amount: number;

  @ApiProperty({ example: 10000 })
  balanceAfter: number;

  @ApiProperty({ example: 'Wallet funding' })
  description: string;

  @ApiProperty({ example: '2025-01-15T10:30:00.000Z' })
  createdAt: Date;
}

export class WalletHistoryResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Wallet history fetched successfully' })
  message: string;

  @ApiProperty({ example: 200 })
  status_code: number;

  @ApiProperty({ type: [WalletTransactionDataDto], isArray: true })
  data: WalletTransactionDataDto[];

  @ApiPropertyOptional({
    example: { page: 1, limit: 20, total: 50, totalPages: 3 },
  })
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ==================== Financial Overview Response ====================

export class FinancialOverviewDataDto {
  @ApiProperty({ example: 5000 })
  walletBalance: number;

  @ApiProperty({ example: 250000 })
  totalRentPaid: number;

  @ApiProperty({ example: 50000 })
  totalSavings: number;

  @ApiProperty({ example: 0 })
  outstandingLoan: number;

  @ApiProperty({ example: 2 })
  activeRentals: number;

  @ApiProperty({ example: 5 })
  totalTransactions: number;

  @ApiPropertyOptional({
    example: [
      { month: 'Jan', amount: 50000 },
      { month: 'Feb', amount: 50000 },
    ],
  })
  monthlyBreakdown?: Array<{ month: string; amount: number }>;
}

export class FinancialOverviewResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Financial overview fetched successfully' })
  message: string;

  @ApiProperty({ example: 200 })
  status_code: number;

  @ApiProperty({ type: FinancialOverviewDataDto })
  data: FinancialOverviewDataDto;
}

// ==================== All Payment History Response ====================

export class AllPaymentHistoryResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Complete payment history fetched successfully' })
  message: string;

  @ApiProperty({ example: 200 })
  status_code: number;

  @ApiProperty({ description: 'Array of all payment records', isArray: true })
  data: any[];
}
