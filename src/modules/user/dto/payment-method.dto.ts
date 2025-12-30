import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsEnum } from 'class-validator';
import { PaymentMethodType } from '../entities/payment-method.entity';

export class CreatePaymentMethodDto {
  @ApiProperty({ example: 'AUTH_8ln2biprvf' })
  @IsString()
  authorizationCode: string;

  @ApiPropertyOptional({ example: '4081' })
  @IsOptional()
  @IsString()
  last4?: string;

  @ApiPropertyOptional({ example: 'visa' })
  @IsOptional()
  @IsString()
  cardType?: string;

  @ApiPropertyOptional({ example: 'TEST BANK' })
  @IsOptional()
  @IsString()
  bank?: string;

  @ApiPropertyOptional({ example: 'visa' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ example: '12' })
  @IsOptional()
  @IsString()
  expMonth?: string;

  @ApiPropertyOptional({ example: '2030' })
  @IsOptional()
  @IsString()
  expYear?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  reusable?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({
    enum: PaymentMethodType,
    example: PaymentMethodType.CARD,
  })
  @IsOptional()
  @IsEnum(PaymentMethodType)
  type?: PaymentMethodType;
}

export class UpdatePaymentMethodDto {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
