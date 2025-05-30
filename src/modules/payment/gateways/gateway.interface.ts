// gateways/gateway.interface.ts
import { InitiatePaymentDto } from '../dto/initiate-payment.dto';

export interface PaymentGateway {
  initiatePayment(dto: InitiatePaymentDto): Promise<any>;
  verifyPayment(reference: string): Promise<any>;
}
