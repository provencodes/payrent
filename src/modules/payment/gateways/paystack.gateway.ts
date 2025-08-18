import { Injectable, HttpException } from '@nestjs/common';
import axios from 'axios';
import { PaymentGateway } from './gateway.interface';
import { CreatePlanType, PaystackSubscriptionDto } from './../dto/paystack.dto';
// import { InitiatePaymentDto } from '../dto/initiate-payment.dto';

@Injectable()
export class PaystackGateway implements PaymentGateway {
  private readonly baseUrl = 'https://api.paystack.co';

  private readonly headers = {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json',
  };

  async initiatePayment(dto: any): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/transaction/initialize`,
        {
          email: dto.email,
          amount: dto.amount * 100, // Paystack expects kobo
          metadata: { ...dto.metadata },
        },
        { headers: this.headers },
      );

      return response.data;
    } catch (error) {
      throw new HttpException('Paystack initiation failed', 500);
    }
  }

  async verifyPayment(reference: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/transaction/verify/${reference}`,
        { headers: this.headers },
      );

      return response.data;
    } catch (error) {
      throw new HttpException('Verification failed', 500);
    }
  }

  // paystack.service.ts
  async createPlan(payload: CreatePlanType) {
    const response = await axios.post(
      'https://api.paystack.co/plan',
      {
        name: payload.name || `Auto plan ${Date.now()}`,
        interval: payload.interval,
        amount: payload.amount * 100, // amount in kobo
        description: payload?.description,
        send_invoices: payload?.send_invoices,
        send_sms: payload.send_sms,
      },
      { headers: this.headers },
    );

    return response.data.data; // includes plan_code
  }

  async subscribeToPlan(payload: PaystackSubscriptionDto) {
    const response = await axios.post(
      'https://api.paystack.co/subscription',
      {
        customer: payload.customer,
        plan: payload.plan,
        authorization: payload.authorization,
      },
      { headers: this.headers },
    );

    return response.data.data; // includes subscription_code
  }

  // get all paystack banks /bank/resolve?account_number=0022728151&bank_code=063
  async getBanks(): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/bank?country=nigeria`, {
        headers: this.headers,
      });

      return response.data;
    } catch (err) {
      console.error(err.message || err);
      throw new HttpException('Unable to get bank list', 404);
    }
  }

  async verifyAccount(accountNumber: string, bankCode: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
        {
          headers: this.headers,
        },
      );

      return response.data;
    } catch (error) {
      throw new HttpException('Unable to verify account', 404);
    }
  }
}
