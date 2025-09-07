import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { FileObject, PaymentType } from './create-property.dto';
import { Type } from 'class-transformer';

export class RenovationRequestDto {
  @ApiPropertyOptional({ example: '407556c4-d547-4dbe-9d61-8bf570e57f9a' })
  @IsString()
  propertyId: string;

  @ApiPropertyOptional({ example: 'Plumbing' })
  @IsString()
  renovationType: string;

  @ApiPropertyOptional({ example: '6 months' })
  @IsString()
  estimatedTimeline: string;

  @ApiPropertyOptional({ type: [FileObject] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileObject)
  images?: FileObject[];

  @ApiPropertyOptional({
    enum: PaymentType,
    example: PaymentType.ONE_TIME,
    description: 'How the user intends to pay: one_time or installment',
  })
  @IsEnum(PaymentType, {
    message: 'paymentType must be either "one_time" or "installment"',
  })
  paymentType: PaymentType;
}
