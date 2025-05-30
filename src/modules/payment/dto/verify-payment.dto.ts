// dto/verify-payment.dto.ts
import { IsString } from 'class-validator';

export class VerifyPaymentDto {
  @IsString()
  reference: string;
}
