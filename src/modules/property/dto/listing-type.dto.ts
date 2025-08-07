// enums/listing-type.enum.ts
export enum ListingType {
  RENT = 'rent',
  SALE = 'sale',
  FLIP = 'flip',
}

// dto/create-property.dto.ts
// import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateListingDto {
  @ApiProperty({
    description: 'The type of listing',
    enum: ListingType,
    enumName: 'ListingType',
    isArray: true,
    example: [ListingType.RENT],
  })
  // @IsEnum(ListingType)
  listingType: ListingType[];
}
