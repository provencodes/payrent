import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { PaymentMethod } from '../enums/payment-method.enum';
import { TransactionType } from '../enums/transaction-type';

export class InitiatePaymentDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsNumber()
  amount: number;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsString()
  @IsNotEmpty()
  propertyId: string;
}
