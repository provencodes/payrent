import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateBankAccountDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  accountName: string;

  @ApiProperty({ example: '0123456789' })
  @IsString()
  accountNumber: string;

  @ApiProperty({ example: '044' })
  @IsString()
  bankCode: string;

  @ApiProperty({ example: 'Access Bank' })
  @IsString()
  bankName: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  autoCharge?: boolean;
}

export class UpdateBankAccountDto {
  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  accountName?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  autoCharge?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
