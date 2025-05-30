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

class FileObject {
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

export class CreatePropertyDto {
  @ApiProperty({ example: 'Luxury Apartment in Lekki' })
  @IsString()
  title: string;

  @ApiProperty({ example: '3 bedroom apartment' })
  @IsString()
  type: string;

  @ApiProperty({
    example: 'rent',
    enum: [
      'rent',
      'sale',
      'shares',
      'flip',
      'off-plan',
      'co-vest',
      'joint-venture',
    ],
  })
  @IsString()
  listingType: string;

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

  // @ApiPropertyOptional({ example: 'www.image.image-doc-url.jpg' })
  // @IsOptional()
  // @IsString()
  // imageDoc?: string;

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

  // @ApiPropertyOptional()
  // @IsOptional()
  // @IsString()
  // rentalAgreementDoc?: string;

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

  // @ApiPropertyOptional({
  //   type: 'array',
  //   items: {
  //     type: 'object',
  //     properties: {
  //       url: { type: 'string' },
  //       public_id: { type: 'string' },
  //     },
  //   },
  // })
  // @IsOptional()
  // images?: { url: string; public_id: string }[];

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
    example: 'pending',
    description:
      'Status can be ongoing, pending, cancelled, approved, completed, rejected, under-review',
  })
  @IsOptional()
  @IsString()
  status?: string;

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

  // @ApiPropertyOptional()
  // @IsOptional()
  // @IsString()
  // listedBy?: string;
}

// import {
//   IsString,
//   IsNotEmpty,
//   IsNumber,
//   IsBoolean,
//   IsOptional,
//   IsArray,
//   ValidateNested,
// } from 'class-validator';
// import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
// import { Type } from 'class-transformer';

// class ImageObject {
//   @ApiProperty()
//   @IsString()
//   url: string;

//   @ApiProperty()
//   @IsString()
//   public_id: string;
// }

// export class CreatePropertyDto {
//   @ApiProperty({ example: 'Luxury Apartment in Lekki' })
//   @IsString()
//   @IsNotEmpty()
//   title: string;

//   @ApiProperty({ example: '3 Bedroom Apartment' })
//   @IsString()
//   type: string;

//   @ApiProperty({
//     example: 'rent',
//     enum: [
//       'rent',
//       'sale',
//       'shares',
//       'flip',
//       'off-plan',
//       'co-vest',
//       'joint-venture',
//     ],
//   })
//   @IsString()
//   listingType: string;

//   @ApiPropertyOptional({ example: 'apartment' })
//   @IsOptional()
//   @IsString()
//   category?: string;

//   @ApiProperty({ example: 'Lekki Phase 1, Lagos, Nigeria' })
//   @IsString()
//   address: string;

//   @ApiProperty({
//     example: 'A modern apartment with luxury fittings and finishes.',
//   })
//   @IsString()
//   description: string;

//   @ApiPropertyOptional({ example: 'image-doc-url.jpg' })
//   @IsOptional()
//   @IsString()
//   imageDoc?: string;

//   @ApiPropertyOptional({ example: 3 })
//   @IsOptional()
//   @IsNumber()
//   bedrooms?: number;

//   @ApiPropertyOptional({ example: 2 })
//   @IsOptional()
//   @IsNumber()
//   bathrooms?: number;

//   @ApiPropertyOptional({ example: 3 })
//   @IsOptional()
//   @IsNumber()
//   toilets?: number;

//   @ApiProperty({ example: '150 sqm' })
//   @IsString()
//   propertySize: string;

//   @ApiPropertyOptional({ example: '2nd Floor' })
//   @IsOptional()
//   @IsString()
//   floorLevel?: string;

//   @ApiProperty({ example: true })
//   @IsBoolean()
//   parkingAvailable: boolean;

//   @ApiPropertyOptional({
//     example: ['Wi-Fi', 'Air Condition', 'Swimming Pool', 'Gym'],
//     isArray: true,
//   })
//   @IsOptional()
//   @IsArray()
//   @IsString({ each: true })
//   amenities?: string[];

//   @ApiPropertyOptional({ example: 1500000 })
//   @IsOptional()
//   @IsNumber()
//   rentalPrice?: number;

//   @ApiPropertyOptional({ example: 150000 })
//   @IsOptional()
//   @IsNumber()
//   serviceCharge?: number;

//   @ApiProperty({ example: true })
//   @IsBoolean()
//   securityDepositRequired: boolean;

//   @ApiPropertyOptional({ example: 300000 })
//   @IsOptional()
//   @IsNumber()
//   advanceRentPayment?: number;

//   @ApiPropertyOptional({ example: 12 })
//   @IsOptional()
//   @IsNumber()
//   numberOfMonths?: number;

//   @ApiPropertyOptional({ example: 'rental-agreement-url.pdf' })
//   @IsOptional()
//   @IsString()
//   rentalAgreementDoc?: string;

//   @ApiPropertyOptional({
//     example: 'Late payment after 5 days attracts ₦5,000 fee.',
//   })
//   @IsOptional()
//   @IsString()
//   latePaymentPolicy?: string;

//   @ApiPropertyOptional({ example: '6 months' })
//   @IsOptional()
//   @IsString()
//   returnDuration?: string;

//   @ApiPropertyOptional({ example: '15%' })
//   @IsOptional()
//   @IsString()
//   percentageReturns?: string;

//   @ApiPropertyOptional({ example: ['img1.jpg', 'img2.jpg'] })
//   @IsOptional()
//   @IsArray()
//   @IsString({ each: true })
//   imageUrls?: string[];

//   @ApiPropertyOptional({ type: [ImageObject] })
//   @IsOptional()
//   @IsArray()
//   @ValidateNested({ each: true })
//   @Type(() => ImageObject)
//   images?: ImageObject[];

//   @ApiPropertyOptional({ example: 12.5 })
//   @IsOptional()
//   @IsNumber()
//   interestRate?: number;

//   @ApiPropertyOptional({ example: 'Property Owner' })
//   @IsOptional()
//   @IsString()
//   owner?: string;

//   @ApiPropertyOptional({ example: 500 })
//   @IsOptional()
//   @IsNumber()
//   pricePerUnit?: number;

//   @ApiPropertyOptional({ example: 50 })
//   @IsOptional()
//   @IsNumber()
//   pricePerShare?: number;

//   @ApiPropertyOptional({ example: 5000 })
//   @IsOptional()
//   @IsNumber()
//   price?: number;

//   @ApiPropertyOptional({ example: 50000 })
//   @IsOptional()
//   @IsNumber()
//   numberOfUnit?: number;

//   @ApiPropertyOptional({ example: 'ongoing' })
//   @IsOptional()
//   @IsString()
//   status?: string;

//   @ApiPropertyOptional({ example: '₦1,200,000' })
//   @IsOptional()
//   @IsString()
//   resaleValue?: string;

//   @ApiPropertyOptional({ example: 18 })
//   @IsOptional()
//   @IsNumber()
//   potentialRoi?: number;

//   @ApiPropertyOptional({ example: 'Needs repainting and minor plumbing fixes' })
//   @IsOptional()
//   @IsString()
//   renovationDetails?: string;

//   @ApiPropertyOptional({ example: 'Roofing in progress' })
//   @IsOptional()
//   @IsString()
//   constructionStatus?: string;

//   @ApiPropertyOptional({ example: 'Q4 2025' })
//   @IsOptional()
//   @IsString()
//   estimatedCompletion?: string;

//   @ApiPropertyOptional({ example: 100000 })
//   @IsOptional()
//   @IsNumber()
//   minimumInvestment?: number;

//   @ApiPropertyOptional({ example: 10000000 })
//   @IsOptional()
//   @IsNumber()
//   fullInvestmentPrice?: number;

//   @ApiPropertyOptional({ example: '18 months' })
//   @IsOptional()
//   @IsString()
//   investmentDuration?: string;

//   @ApiPropertyOptional({ example: 50000000 })
//   @IsOptional()
//   @IsNumber()
//   investmentGoal?: number;

//   @ApiPropertyOptional({ example: 10000000 })
//   @IsOptional()
//   @IsNumber()
//   amountRaised?: number;

//   @ApiPropertyOptional({ example: 250000 })
//   @IsOptional()
//   @IsNumber()
//   estimatedRentalIncomePerMonth?: number;

//   @ApiPropertyOptional({ example: '50%' })
//   @IsOptional()
//   @IsString()
//   projectedProfitShareIfSold?: string;

//   @ApiPropertyOptional({ example: 'Full renovation' })
//   @IsOptional()
//   @IsString()
//   renovationType?: string;

//   @ApiPropertyOptional({ example: '6 months' })
//   @IsOptional()
//   @IsString()
//   estimatedTimeline?: string;

//   @ApiPropertyOptional({ example: true })
//   @IsOptional()
//   @IsBoolean()
//   approved?: boolean;

//   @ApiPropertyOptional({ example: 'admin_user_id_123' })
//   @IsOptional()
//   @IsString()
//   listedBy?: string;

//   @ApiProperty({ example: true })
//   @IsBoolean()
//   agreeToTerms: boolean;
// }

// import {
//   IsString,
//   IsNotEmpty,
//   IsNumber,
//   IsBoolean,
//   IsOptional,
//   IsArray,
// } from 'class-validator';
// import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// export class CreatePropertyDto {
//   @ApiProperty({ example: 'Luxury Apartment in Lekki' })
//   @IsString()
//   @IsNotEmpty()
//   title: string;

//   @ApiProperty({ example: '3 Bedroom Apartment' })
//   @IsString()
//   type: string;

//   @ApiProperty({ example: 'rent', enum: ['rent', 'sale'] })
//   @IsString()
//   listingType: string;

//   @ApiProperty({ example: 'Lekki Phase 1, Lagos, Nigeria' })
//   @IsString()
//   address: string;

//   @ApiProperty({
//     example: 'A modern apartment with luxury fittings and finishes.',
//   })
//   @IsString()
//   description: string;

//   @ApiPropertyOptional({ example: 'image-doc-url.jpg' })
//   @IsOptional()
//   @IsString()
//   imageDoc?: string;

//   @ApiProperty({
//     type: 'array',
//     items: {
//       type: 'string',
//       format: 'binary',
//     },
//   })
//   images?: any;

//   @ApiProperty({ example: 3 })
//   @IsNumber()
//   bedrooms: number;

//   @ApiProperty({ example: 2 })
//   @IsNumber()
//   bathrooms: number;

//   @ApiProperty({ example: 3 })
//   @IsNumber()
//   toilets: number;

//   @ApiProperty({ example: '150 sqm' })
//   @IsString()
//   propertySize: string;

//   @ApiPropertyOptional({ example: '2nd Floor' })
//   @IsOptional()
//   @IsString()
//   floorLevel?: string;

//   @ApiProperty({ example: true })
//   @IsBoolean()
//   parkingAvailable: boolean;

//   @ApiPropertyOptional({
//     example: ['Wi-Fi', 'Air Condition', 'Swimming Pool', 'Gym'],
//     isArray: true,
//   })
//   @IsOptional()
//   @IsArray()
//   @IsString({ each: true })
//   amenities?: string[];

//   @ApiProperty({ example: 1500000 }) // per year
//   @IsNumber()
//   rentalPrice: number;

//   @ApiPropertyOptional({ example: 150000 })
//   @IsOptional()
//   @IsNumber()
//   serviceCharge?: number;

//   @ApiProperty({ example: true })
//   @IsBoolean()
//   securityDepositRequired: boolean;

//   @ApiPropertyOptional({ example: 300000 })
//   @IsOptional()
//   @IsNumber()
//   advanceRentPayment?: number;

//   @ApiPropertyOptional({ example: 12 })
//   @IsOptional()
//   @IsNumber()
//   numberOfMonths?: number;

//   @ApiPropertyOptional({ example: 'rental-agreement-url.pdf' })
//   @IsOptional()
//   @IsString()
//   rentalAgreementDoc?: string;

//   @ApiPropertyOptional({
//     example: 'Late payment after 5 days attracts a fee of ₦5,000',
//   })
//   @IsOptional()
//   @IsString()
//   latePaymentPolicy?: string;

//   @ApiProperty({ example: true })
//   @IsBoolean()
//   agreeToTerms: boolean;
// }
