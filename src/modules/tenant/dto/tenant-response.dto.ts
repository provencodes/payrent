import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ==================== Rent Savings Response ====================

export class RentSavingsDataDto {
  @ApiProperty({ example: 'd3f7a939-4fc0-4a1e-9a0b-92b748c63e2a' })
  id: string;

  @ApiProperty({ example: 'user-uuid-123' })
  userId: string;

  @ApiProperty({ example: 500000 })
  targetAmount: number;

  @ApiProperty({ example: 120000 })
  currentAmount: number;

  @ApiProperty({ example: 50000 })
  monthlyContribution: number;

  @ApiProperty({
    example: 'active',
    enum: ['active', 'completed', 'cancelled'],
  })
  status: string;

  @ApiProperty({ example: '2025-01-01T00:00:00.000Z' })
  startDate: Date;

  @ApiPropertyOptional({ example: '2025-12-01T00:00:00.000Z' })
  targetDate?: Date;

  @ApiProperty({ example: '2025-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-01-15T10:30:00.000Z' })
  updatedAt: Date;
}

export class RentSavingsResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Rent savings plan created successfully' })
  message: string;

  @ApiProperty({ example: 201 })
  status_code: number;

  @ApiProperty({ type: RentSavingsDataDto })
  data: RentSavingsDataDto;
}

export class RentSavingsListResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Rent savings fetched successfully' })
  message: string;

  @ApiProperty({ example: 200 })
  status_code: number;

  @ApiProperty({ type: [RentSavingsDataDto], isArray: true })
  data: RentSavingsDataDto[];
}

// ==================== Loan Application Response ====================

export class LoanApplicationDataDto {
  @ApiProperty({ example: 'd3f7a939-4fc0-4a1e-9a0b-92b748c63e2a' })
  id: string;

  @ApiProperty({ example: 'user-uuid-123' })
  userId: string;

  @ApiProperty({ example: 500000 })
  amount: number;

  @ApiProperty({ example: 12 })
  tenure: number;

  @ApiProperty({ example: 'rent' })
  purpose: string;

  @ApiProperty({
    example: 'pending',
    enum: ['pending', 'approved', 'rejected', 'disbursed', 'repaid'],
  })
  status: string;

  @ApiPropertyOptional({ example: 15.5 })
  interestRate?: number;

  @ApiPropertyOptional({ example: 55000 })
  monthlyRepayment?: number;

  @ApiProperty({ example: '2025-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-01-15T10:30:00.000Z' })
  updatedAt: Date;
}

export class LoanApplicationResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Loan application submitted successfully' })
  message: string;

  @ApiProperty({ example: 201 })
  status_code: number;

  @ApiProperty({ type: LoanApplicationDataDto })
  data: LoanApplicationDataDto;
}

export class LoanApplicationListResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Loan applications fetched successfully' })
  message: string;

  @ApiProperty({ example: 200 })
  status_code: number;

  @ApiProperty({ type: [LoanApplicationDataDto], isArray: true })
  data: LoanApplicationDataDto[];
}

// ==================== Rent Payment Response ====================

export class RentPaymentDataDto {
  @ApiProperty({ example: 'd3f7a939-4fc0-4a1e-9a0b-92b748c63e2a' })
  id: string;

  @ApiProperty({ example: 'property-uuid-123' })
  propertyId: string;

  @ApiProperty({ example: 250000 })
  amount: number;

  @ApiProperty({ example: 'success', enum: ['pending', 'success', 'failed'] })
  status: string;

  @ApiProperty({ example: 'PAY_ref_123456' })
  reference: string;

  @ApiProperty({ example: '2025-01-01T00:00:00.000Z' })
  paidAt: Date;
}

export class RentPaymentHistoryResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Rent payments fetched successfully' })
  message: string;

  @ApiProperty({ example: 200 })
  status_code: number;

  @ApiProperty({ type: [RentPaymentDataDto], isArray: true })
  data: RentPaymentDataDto[];
}

// ==================== Rent Property Response ====================

export class RentPropertyDataDto {
  @ApiProperty({ example: 'd3f7a939-4fc0-4a1e-9a0b-92b748c63e2a' })
  rentalId: string;

  @ApiProperty({ example: 'property-uuid-123' })
  propertyId: string;

  @ApiProperty({ example: 'https://checkout.paystack.com/abc123xyz' })
  authorization_url: string;

  @ApiProperty({ example: 'abc123xyz789' })
  access_code: string;

  @ApiProperty({ example: 'PAY_ref_1234567890' })
  reference: string;
}

export class RentPropertyResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Rent payment initiated successfully' })
  message: string;

  @ApiProperty({ example: 200 })
  status_code: number;

  @ApiProperty({ type: RentPropertyDataDto })
  data: RentPropertyDataDto;
}

// ==================== Fund Savings Response ====================

export class FundSavingsDataDto {
  @ApiProperty({ example: 'https://checkout.paystack.com/abc123xyz' })
  authorization_url: string;

  @ApiProperty({ example: 'abc123xyz789' })
  access_code: string;

  @ApiProperty({ example: 'PAY_ref_1234567890' })
  reference: string;
}

export class FundSavingsResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Savings funding initiated successfully' })
  message: string;

  @ApiProperty({ example: 200 })
  status_code: number;

  @ApiProperty({ type: FundSavingsDataDto })
  data: FundSavingsDataDto;
}

// ==================== Available Rentals Response ====================

export class AvailableRentalsResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Available rentals fetched successfully' })
  message: string;

  @ApiProperty({ example: 200 })
  status_code: number;

  @ApiProperty({
    description: 'Array of available rental properties',
    isArray: true,
  })
  data: any[];

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
