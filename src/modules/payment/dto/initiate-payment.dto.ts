// dto/initiate-payment.dto.ts
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { PaymentMethod } from '../enums/payment-method.enum';
import { PaymentType } from '../enums/payment-type.enums';

export class InitiatePaymentDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsNumber()
  amount: number;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsEnum(PaymentType)
  type: PaymentType;

  @IsString()
  @IsNotEmpty()
  propertyId: string;
}
