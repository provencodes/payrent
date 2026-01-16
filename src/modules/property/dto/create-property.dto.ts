import { IsString, IsOptional, IsNumber, IsBoolean, IsArray, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FileObject {
  @ApiProperty()
  @IsString()
  url: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  public_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;
}

export enum PaymentType {
  ONE_TIME = 'one_time',
  INSTALLMENT = 'installment',
}

export enum PropertyStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
}

export enum ListingType {
  RENT = 'rent',
  SALE = 'sale',
  SHARES = 'shares',
  JOINT_VENTURE = 'joint-venture',
  FLIP = 'flip',
  CO_VEST = 'co-vest',
  OFF_PLAN = 'off-plan',
}

export class CreatePropertyDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  type: string;

  @ApiProperty({ enum: ListingType })
  @IsEnum(ListingType)
  listingType: string;

  @ApiProperty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsString()
  description: string;

  // Optional fields based on listing type
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ type: [FileObject] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileObject)
  imageDoc?: FileObject[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  bedrooms?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  bathrooms?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  toilets?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  propertySize?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  floorLevels?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  parkingAvailable?: boolean;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  amenities?: string[];

  // Rental fields
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  rentalPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  serviceCharge?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  securityDepositRequired?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  advanceRentPayment?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  numberOfMonths?: number;

  @ApiPropertyOptional({ type: [FileObject] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileObject)
  rentalAgreementDoc?: FileObject[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  latePaymentPolicy?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  agreeToTerms?: boolean;

  // Investment fields
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  returnDuration?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  percentageReturns?: string;

  @ApiPropertyOptional({ type: [FileObject] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileObject)
  images?: FileObject[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  interestRate?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  owner?: string;

  // Sale/Units fields
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  numberOfUnit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  pricePerUnit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  pricePerShare?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;

  // Flip/Investment fields
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  resaleValue?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  potentialRoi?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  renovationDetails?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  constructionStatus?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  estimatedCompletion?: string;

  // Co-vest fields
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  minimumInvestment?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  fullInvestmentPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  investmentDuration?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  investmentGoal?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  amountRaised?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  estimatedRentalIncomePerMonth?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  projectedProfitShareIfSold?: string;

  // Joint venture fields
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  renovationType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  paymentType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  paymentPlan?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  estimatedTimeline?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reasonForDecline?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  renovationCost?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  minimumDepositForInstallment?: number;

  // Fee fields
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  legalAndAdministrativeFee?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  agentCommission?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  negotiable?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  approved?: boolean;
}

