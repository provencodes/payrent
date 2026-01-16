import {
  IsOptional,
  IsString,
  IsBoolean,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
// import { PaymentType } from './create-property.dto';
import { ListingType } from './create-property.dto';
import { PropertyStatus } from './create-property.dto';

export class GetPropertiesDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  listedBy?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() owner?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  approved?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() renovationType?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() constructionStatus?: string;
  @ApiPropertyOptional({
    enum: PropertyStatus,
    example: PropertyStatus.APPROVED,
  })
  @IsOptional()
  @IsEnum(PropertyStatus)
  status?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  interestRate?: number;
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  agreeToTerms?: boolean;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) rentalPrice?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() floorLevel?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() address?: string;
  @ApiPropertyOptional({
    enum: ListingType,
    example: ListingType.RENT,
  })
  @IsEnum(ListingType)
  @IsOptional()
  listingType?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() type?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() title?: string;

  @ApiPropertyOptional({
    type: Boolean,
    description: 'Filter by sold status - false returns only unsold properties',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isSold?: boolean;

  // New: Partial match
  @ApiPropertyOptional() @IsOptional() @IsString() titleSearch?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() addressSearch?: string;

  // New: Range filters
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  rentalPriceMin?: number;
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  rentalPriceMax?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  interestRateMin?: number;
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  interestRateMax?: number;

  @ApiPropertyOptional() @IsOptional() @IsDateString() createdAfter?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() createdBefore?: string;

  // Pagination and sorting
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  page: number = 1;
  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  limit: number = 10;
  @ApiPropertyOptional({ example: 'createdAt' })
  @IsOptional()
  @IsString()
  orderBy: string = 'createdAt';
  @ApiPropertyOptional({ example: 'desc' })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  order: 'asc' | 'desc' = 'desc';
}

export enum PropertyCategory {
  CATEGORY1 = 'category1',
  CATEGORY2 = 'category2',
}

export class FilterPropertyDto {
  @ApiPropertyOptional({
    enum: PropertyCategory,
    description: 'Filter properties by category',
    example: PropertyCategory.CATEGORY1,
  })
  @IsOptional()
  @IsEnum(PropertyCategory, {
    message: 'category must be category1 or category2',
  })
  category?: PropertyCategory;
}
