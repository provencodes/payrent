import { Injectable, HttpException } from '@nestjs/common';
import axios from 'axios';
import { TransferRecipient } from './gateway.interface';
import { PaystackSubscriptionDto } from './../dto/paystack.dto';
import { CreatePlanType } from './gateway.interface';
import { randomUUID } from 'crypto';
// import { InitiatePaymentDto } from '../dto/initiate-payment.dto';

@Injectable()
export class PaystackGateway {
  private readonly baseUrl = 'https://api.paystack.co';

  private readonly headers = {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json',
  };

  async initiatePayment(dto: any): Promise<any> {
    if (!dto.metadata.userId) {
      throw new HttpException('userId is required in the dto.metadata', 400);
    }

    const defaultRef = `trx_${dto.metadata.userId}_${Date.now()}_${randomUUID()}`;
    try {
      const response = await axios.post(
        `${this.baseUrl}/transaction/initialize`,
        {
          email: dto.email,
          amount: dto.amount * 100, // Paystack expects kobo
          metadata: { ...dto.metadata },
          currency: 'NGN',
          reference: dto?.reference || defaultRef,
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
      `${this.baseUrl}/plan`,
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
      `${this.baseUrl}/subscription`,
      {
        customer: payload.customer,
        plan: payload.plan,
        authorization: payload.authorization,
      },
      { headers: this.headers },
    );

    return response.data.data; // includes subscription_code
  }

  // get all paystack banks /bank/resolve?account_number=0022728151&bank_code=063getPayWithBanks
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

  async getPayWithBanks(): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/bank?country=nigeria&pay_with_bank=true`,
        {
          headers: this.headers,
        },
      );

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

  async createTransferRecipient(payload: TransferRecipient) {
    const response = await axios.post(
      `${this.baseUrl}/transferrecipient`,
      {
        type: 'nuban',
        name: payload.name,
        bank_code: payload.bankCode,
        account_number: payload.accountNumber,
        currency: 'NGN',
      },
      { headers: this.headers },
    );

    return response.data;
  }

  async initiateTransfer(payload) {
    const response = await axios.post(
      `${this.baseUrl}/transferrecipient`,
      {
        source: 'balance',
        amount: payload.amountKobo,
        recipient: payload.recipientCode,
        reason: payload.reason,
        reference: payload.reference,
        currency: 'NGN',
      },
      { headers: this.headers },
    );

    return response.data;
  }
}
