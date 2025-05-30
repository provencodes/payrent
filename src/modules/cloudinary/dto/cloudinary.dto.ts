import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsUUID } from 'class-validator';

export enum EntityType {
  PROPERTY = 'property',
  USER = 'user',
  LEGAL = 'legal',
}

export enum EntityFieldName {
  IMAGES = 'images',
  IMAGE_DOC = 'imageDoc',
  RENTAL_AGREEMENT_DOC = 'rentalAgreementDoc',
  SUPPORTING_DOCUMENT = 'supportingDocument',
  PROFILE_PICTURE = 'profilePicture',
}

export class DeleteDto {
  @ApiProperty({
    example: '12345678',
    description: 'the public Id of the image',
  })
  @IsString()
  publicId: string;

  @ApiProperty({
    example: 'd3f7a939-4fc0-4a1e-9a0b-92b748c63e2a',
    description:
      'UUID of the user or property or the legal the file belongs to',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    enum: EntityType,
    example: EntityType.PROPERTY,
    description: 'The entity in which the image or file can be found',
  })
  @IsEnum(EntityType, {
    message: 'EntityType must be either "property" or "user" or "legal"',
  })
  entity: EntityType;

  @ApiProperty({
    enum: EntityFieldName,
    example: EntityFieldName.IMAGES,
    description:
      'The type of file (images or imageDoc or rentalAgreementDoc, supportingDocument, profilePicture)',
  })
  @IsEnum(EntityFieldName, {
    message:
      'EntityFieldName must be either "images" or "imageDoc" or "rentalAgreementDoc" or "supportingDocument" or "profilePicture"',
  })
  entityFieldName: EntityFieldName;
}
