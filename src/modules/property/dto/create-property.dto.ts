import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export class FileObject {
  @ApiProperty()
  @IsString()
  url: string;

  @ApiProperty()
  @IsString()
  public_id: string;
}

export enum PaymentType {
  ONE_TIME = 'one_time',
  INSTALLMENT = 'installment',
}

export enum ListingType {
  RENT = 'rent',
  SALE = 'sale',
  SHARES = 'shares',
  FLIP = 'flip',
  OFF_PLAN = 'off-plan',
  CO_VEST = 'co-vest',
  JOINT_VENTURE = 'joint-venture',
}

export enum PropertyStatus {
  ONGOING = 'ongoing',
  PENDING = 'pending',
  CANCELLED = 'cancelled',
  APPROVED = 'approved',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  UNDER_REVIEW = 'under-review',
}

export class CreatePropertyDto {
  @ApiProperty({ example: 'Luxury Apartment in Lekki' })
  @IsString()
  title: string;

  @ApiProperty({ example: '3 bedroom apartment' })
  @IsString()
  type: string;

  @ApiProperty({
    enum: ListingType,
    example: ListingType.RENT,
  })
  @IsEnum(ListingType)
  listingType: ListingType;

  @ApiPropertyOptional({ example: 'apartment' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ example: 'Lekki Phase 1, Lagos, Nigeria' })
  @IsString()
  address: string;

  @ApiProperty({
    example: 'A modern apartment with luxury fittings and finishes.',
  })
  @IsString()
  description: string;

  @ApiPropertyOptional({ type: [FileObject] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileObject)
  imageDoc?: FileObject[];

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsNumber()
  bedrooms?: number;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsNumber()
  bathrooms?: number;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsNumber()
  toilets?: number;

  @ApiPropertyOptional({ example: '150 sqm' })
  @IsOptional()
  @IsString()
  propertySize?: string;

  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  @IsNumber()
  floorLevels?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  parkingAvailable?: boolean;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  amenities?: string[];

  @ApiPropertyOptional({ example: 1000000.0 })
  @IsOptional()
  @IsNumber()
  rentalPrice?: number;

  @ApiPropertyOptional({ example: 1000000.0 })
  @IsOptional()
  @IsNumber()
  serviceCharge?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  securityDepositRequired?: boolean;

  @ApiPropertyOptional({ example: 1000000.0 })
  @IsOptional()
  @IsNumber()
  advanceRentPayment?: number;

  @ApiPropertyOptional({ example: 6 })
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

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  agreeToTerms?: boolean;

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

  @ApiPropertyOptional({ example: 8.5 })
  @IsOptional()
  @IsNumber()
  interestRate?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  owner?: string;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsNumber()
  numberOfUnit?: number;

  @ApiPropertyOptional({ example: 1800 })
  @IsOptional()
  @IsNumber()
  pricePerUnit?: number;

  @ApiPropertyOptional({ example: 180 })
  @IsOptional()
  @IsNumber()
  pricePerShare?: number;

  @ApiPropertyOptional({ example: 18000 })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiPropertyOptional({
    enum: PropertyStatus,
    example: PropertyStatus.PENDING,
    description:
      'Status can be ongoing, pending, cancelled, approved, completed, rejected, under-review',
  })
  @IsOptional()
  @IsEnum(PropertyStatus)
  status?: PropertyStatus;

  @ApiPropertyOptional({ example: 12000 })
  @IsOptional()
  @IsNumber()
  resaleValue?: number;

  @ApiPropertyOptional({ example: 1200 })
  @IsOptional()
  @IsNumber()
  potentialRoi?: number;

  @ApiPropertyOptional({ example: 'Needs repainting and minor plumbing fixes' })
  @IsOptional()
  @IsString()
  renovationDetails?: string;

  @ApiPropertyOptional({ example: 'Roofing in progress' })
  @IsOptional()
  @IsString()
  constructionStatus?: string;

  @ApiPropertyOptional({ example: 'Q4 2025' })
  @IsOptional()
  @IsString()
  estimatedCompletion?: string;

  @ApiPropertyOptional({ example: 1000 })
  @IsOptional()
  @IsNumber()
  minimumInvestment?: number;

  @ApiPropertyOptional({ example: 10000 })
  @IsOptional()
  @IsNumber()
  fullInvestmentPrice?: number;

  @ApiPropertyOptional({ example: 6 })
  @IsOptional()
  @IsNumber()
  investmentDuration?: number;

  @ApiPropertyOptional({ example: 50000000 })
  @IsOptional()
  @IsNumber()
  investmentGoal?: number;

  @ApiPropertyOptional({ example: 500000 })
  @IsOptional()
  @IsNumber()
  amountRaised?: number;

  @ApiPropertyOptional({ example: 50000 })
  @IsOptional()
  @IsNumber()
  estimatedRentalIncomePerMonth?: number;

  @ApiPropertyOptional({ example: '50%' })
  @IsOptional()
  @IsString()
  projectedProfitShareIfSold?: string;

  @ApiPropertyOptional({ example: 'Plumbing' })
  @IsOptional()
  @IsString()
  renovationType?: string;

  @ApiPropertyOptional({
    enum: PaymentType,
    example: PaymentType.INSTALLMENT,
    description: 'How the user intends to pay: one_time or installment',
  })
  @IsEnum(PaymentType, {
    message: 'paymentType must be either "one_time" or "installment"',
  })
  @IsOptional()
  paymentType?: PaymentType;

  @ApiPropertyOptional({ example: '6 months' })
  @IsOptional()
  @IsString()
  estimatedTimeline?: string;

  @ApiPropertyOptional({ example: 'Price is too hig' })
  @IsOptional()
  @IsString()
  reasonForDecline?: string;

  @ApiPropertyOptional({ example: 4000 })
  @IsOptional()
  @IsNumber()
  renovationCost?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  approved?: boolean;
}
