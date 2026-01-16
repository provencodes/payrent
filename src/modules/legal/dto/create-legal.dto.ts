import {
  IsArray,
  IsString,
  IsUUID,
  ValidateNested,
  IsOptional,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class FileObject {
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

  @ApiPropertyOptional({ example: 'image/jpeg' })
  @IsOptional()
  @IsString()
  type?: string;
}

export enum CaseStatus {
  IN_PROGRESS = 'in-progress',
  RESOLVED = 'resolved',
  CANCELLED = 'cancelled',
  UNDER_REVIEW = 'under-review',
}

export class CreateLegalDto {
  @ApiProperty({
    example: 'b7c2e1a3-4f56-4d89-9c3b-1a2b3c4d5e6f',
    description: 'UUID of the user creating the request',
  })
  @IsUUID('4', { message: 'userId must be a valid UUID' })
  userId: string;

  @ApiProperty({
    example: 'a9a1b3d2-9124-4d53-87d4-d6a1bc5a2b7d',
    description: 'UUID of the property to involved',
  })
  @IsUUID('4', { message: 'propertyId must be a valid UUID' })
  propertyId: string;

  @ApiProperty({ example: 'Duplex in Lekki' })
  @IsOptional()
  @IsString()
  propertyTitle: string;

  @ApiPropertyOptional({ type: [FileObject] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileObject)
  supportingDocument?: FileObject[];

  @ApiProperty({ example: 'Court case' })
  @IsString()
  preferredLegalAction: string;

  @ApiProperty({ example: 'Tenant refused to pay' })
  @IsString()
  type: string;

  @ApiProperty({
    example:
      'A new tenant that just packed in refused to pay her rent and it is getting out of hand',
  })
  @IsString()
  description: string;

  @ApiPropertyOptional({ example: 'Basic' })
  @IsOptional()
  @IsString()
  legalPackageType?: string;

  @ApiProperty({ enum: CaseStatus, example: CaseStatus.IN_PROGRESS })
  @IsEnum(CaseStatus)
  caseStatus: CaseStatus;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  approved?: boolean;
}
