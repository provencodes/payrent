import { IsString, IsNumber, IsArray, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLegalPackageDto {
  @ApiProperty({ example: 'Basic Package' })
  @IsString()
  name: string;

  @ApiProperty({ example: 200000 })
  @IsNumber()
  price: number;

  @ApiProperty({
    example: [
      'One-time consultation with a legal expert',
      'General legal advice on landlord-tenant issues',
      'Explanation of legal rights and responsibilities',
      'Guidance on lease agreements and basic disputes',
    ],
  })
  @IsArray()
  features: string[];

  @ApiPropertyOptional({ example: 'Basic legal consultation package' })
  @IsOptional()
  @IsString()
  description?: string;
}
