import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsString, IsEnum, Min, Max } from 'class-validator';

export enum LoanPurpose {
  RENT = 'rent',
  DEPOSIT = 'deposit',
  MOVING = 'moving',
  EMERGENCY = 'emergency',
}

export enum EmploymentStatus {
  EMPLOYED = 'employed',
  SELF_EMPLOYED = 'self_employed',
  UNEMPLOYED = 'unemployed',
  STUDENT = 'student',
}

export class ApplyLoanDto {
  @ApiProperty({
    example: 500000,
    description: 'Loan amount requested (10,000 - 5,000,000 NGN)',
  })
  @IsNumber({}, { message: 'Loan amount must be a valid number' })
  @Min(10000, { message: 'Minimum loan amount is ₦10,000' })
  @Max(5000000, { message: 'Maximum loan amount is ₦5,000,000' })
  loanAmount: number;

  @ApiProperty({
    enum: LoanPurpose,
    example: LoanPurpose.RENT,
    description: 'Purpose of the loan',
  })
  @IsEnum(LoanPurpose)
  loanPurpose: LoanPurpose;

  @ApiProperty({
    example: 12,
    description: 'Repayment period in months (3-24 months)',
  })
  @IsNumber({}, { message: 'Repayment period must be a valid number' })
  @Min(3, { message: 'Minimum repayment period is 3 months' })
  @Max(24, { message: 'Maximum repayment period is 24 months' })
  repaymentPeriod: number;

  @ApiProperty({
    enum: EmploymentStatus,
    example: EmploymentStatus.EMPLOYED,
    description: 'Employment status',
  })
  @IsEnum(EmploymentStatus)
  employmentStatus: EmploymentStatus;

  @ApiProperty({
    example: 200000,
    description: 'Monthly income (minimum ₦50,000)',
  })
  @IsNumber({}, { message: 'Monthly income must be a valid number' })
  @Min(50000, { message: 'Minimum monthly income is ₦50,000' })
  monthlyIncome: number;

  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'Guarantor full name',
  })
  @IsString()
  guarantorName?: string;

  @ApiPropertyOptional({
    example: '08012345678',
    description: 'Guarantor phone number',
  })
  @IsString()
  guarantorPhone?: string;
}
