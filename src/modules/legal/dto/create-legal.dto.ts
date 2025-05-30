import {
  IsArray,
  IsString,
  IsUUID,
  ValidateNested,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class FileObject {
  @ApiProperty()
  @IsString()
  url: string;

  @ApiProperty()
  @IsString()
  public_id: string;
}

export class CreateLegalDto {
  @ApiProperty({
    example: 'a9a1b3d2-9124-4d53-87d4-d6a1bc5a2b7d',
    description: 'UUID of the property to involved',
  })
  @IsUUID('4', { message: 'propertyId must be a valid UUID' })
  propertyId: string;

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
  legalIssue: string;

  @ApiProperty({ example: 'Basic' })
  @IsString()
  legalPackageType: string;

  @ApiProperty({ example: 'Ongoing' })
  @IsString()
  caseStatus: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  approved?: boolean;
}
