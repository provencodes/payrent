import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Property } from './../entities/property.entity';

// ==================== File Object DTO ====================

export class FileObjectDto {
  @ApiProperty({
    example: 'https://res.cloudinary.com/demo/image/upload/property1.jpg',
  })
  url: string;

  @ApiProperty({ example: 'payrent/properties/prop_123' })
  public_id: string;
}

// ==================== Property Data DTO ====================

export class PropertyDataDto {
  @ApiProperty({ example: 'd3f7a939-4fc0-4a1e-9a0b-92b748c63e2a' })
  id: string;

  @ApiProperty({ example: 'Luxury 3 Bedroom Apartment' })
  title: string;

  @ApiProperty({ example: '3 bedroom apartment' })
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
  listingType: string;

  @ApiPropertyOptional({
    example: 'apartment',
    enum: ['apartment', 'home', 'office', 'land', 'shortlet', 'shop', 'hotel'],
  })
  category?: string;

  @ApiProperty({ example: '123 Lekki Phase 1, Lagos' })
  address: string;

  @ApiProperty({
    example: 'A beautiful 3 bedroom apartment with modern amenities...',
  })
  description: string;

  @ApiPropertyOptional({ type: [FileObjectDto], isArray: true })
  imageDoc?: FileObjectDto[];

  @ApiPropertyOptional({ example: 3 })
  bedrooms?: number;

  @ApiPropertyOptional({ example: 2 })
  bathrooms?: number;

  @ApiPropertyOptional({ example: 3 })
  toilets?: number;

  @ApiPropertyOptional({ example: '150 sqm' })
  propertySize?: string;

  @ApiPropertyOptional({ example: 2 })
  floorLevels?: number;

  @ApiProperty({ example: true })
  parkingAvailable: boolean;

  @ApiPropertyOptional({ example: ['wifi', 'gym', 'pool', 'security'] })
  amenities?: string[];

  @ApiPropertyOptional({ example: 2500000.0 })
  rentalPrice?: number;

  @ApiPropertyOptional({ example: 250000.0 })
  serviceCharge?: number;

  @ApiProperty({ example: false })
  securityDepositRequired: boolean;

  @ApiPropertyOptional({ example: 500000.0 })
  advanceRentPayment?: number;

  @ApiPropertyOptional({ example: 12 })
  numberOfMonths?: number;

  @ApiPropertyOptional({
    example: 'ongoing',
    enum: [
      'ongoing',
      'pending',
      'cancelled',
      'approved',
      'completed',
      'rejected',
      'under-review',
    ],
  })
  status?: string;

  @ApiPropertyOptional({ example: 50000000.0 })
  price?: number;

  @ApiPropertyOptional({ example: 5000000.0 })
  minimumInvestment?: number;

  @ApiPropertyOptional({ example: 15.5 })
  interestRate?: number;

  @ApiPropertyOptional({ example: '12 months' })
  returnDuration?: string;

  @ApiPropertyOptional({ example: '25%' })
  percentageReturns?: string;

  @ApiProperty({ example: false })
  negotiable: boolean;

  @ApiProperty({ example: true })
  approved: boolean;

  @ApiPropertyOptional({ example: 'user-uuid-123' })
  listedBy?: string;

  @ApiProperty({ example: false })
  isSold: boolean;

  @ApiProperty({ example: '2025-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-01-15T10:30:00.000Z' })
  updatedAt: Date;
}

// ==================== Response DTOs ====================

export class GetAllPropertyDto {
  @ApiPropertyOptional({ example: true })
  success?: boolean;

  @ApiProperty({ example: 'Properties fetched successfully' })
  message: string;

  @ApiPropertyOptional({ example: 200 })
  status_code?: number;

  @ApiProperty({ type: [PropertyDataDto], isArray: true })
  data: Property[];
}

export class PropertyResponseDto {
  @ApiPropertyOptional({ example: true })
  success?: boolean;

  @ApiProperty({ example: 'Property created successfully' })
  message: string;

  @ApiPropertyOptional({ example: 201 })
  status_code?: number;

  @ApiProperty({ type: PropertyDataDto })
  data: Property;
}

// ==================== Property Metrics Response ====================

export class PropertyMetricsDto {
  @ApiProperty({ example: 10 })
  totalProperties: number;

  @ApiProperty({ example: 5 })
  rentedProperties: number;

  @ApiProperty({ example: 5 })
  availableProperties: number;

  @ApiProperty({ example: 15000000.0 })
  totalRentalIncome: number;

  @ApiProperty({ example: 3 })
  pendingApplications: number;
}

export class PropertyMetricsResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Metrics fetched successfully' })
  message: string;

  @ApiProperty({ example: 200 })
  status_code: number;

  @ApiProperty({ type: PropertyMetricsDto })
  data: PropertyMetricsDto;
}

// ==================== Property Renters Response ====================

export class RenterDataDto {
  @ApiProperty({ example: 'user-uuid-123' })
  renterId: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: 'johndoe@example.com' })
  email: string;

  @ApiProperty({ example: '2025-01-01T00:00:00.000Z' })
  startDate: Date;

  @ApiPropertyOptional({ example: '2026-01-01T00:00:00.000Z' })
  endDate?: Date;

  @ApiProperty({ example: 'active', enum: ['active', 'expired', 'cancelled'] })
  status: string;
}

export class PropertyRentersResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Property renters fetched successfully' })
  message: string;

  @ApiProperty({ example: 200 })
  status_code: number;

  @ApiProperty({ type: [RenterDataDto], isArray: true })
  data: RenterDataDto[];
}
