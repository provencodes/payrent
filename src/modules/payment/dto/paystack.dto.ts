import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PaystackSubscriptionDto {
  @IsString()
  authorization: string;

  @IsString()
  customer: string;

  @IsString()
  plan: string;
}

export class PaystackCallbackDto {
  @ApiProperty({
    description: 'reference of the transaction',
    example: '9e9936b46z',
  })
  @IsNotEmpty()
  @IsString()
  reference: string;

  @ApiPropertyOptional({
    description: 'reference of the transaction',
    example: '9e9936b46z',
  })
  @IsOptional()
  @IsString()
  trxref?: string;
}

export class VerifyAccountDto {
  @ApiProperty({
    description: 'account number',
    example: '3044567890',
  })
  @IsNotEmpty()
  @IsString()
  accountNumber: string;

  @ApiPropertyOptional({
    description: 'bank code',
    example: '063',
  })
  @IsString()
  bankCode: string;
}

export type CreatePlanType = {
  name: string;
  amount: number;
  interval: string;
  description?: string;
  send_invoices?: boolean;
  send_sms?: boolean;
  currency?: string | 'NGN';
  invoice_limit?: number;
};
