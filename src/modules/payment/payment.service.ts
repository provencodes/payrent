// payment.service.ts
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { PaystackGateway } from './gateways/paystack.gateway';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { Installment } from './entities/installment.entity';
import { User } from '../user/entities/user.entity';
import { Plan } from './entities/plan.entity';
import UserService from '../user/user.service';
import UserIdentifierOptionsType from '../user/options/UserIdentifierOptions';
import { CreatePlanType } from './dto/paystack.dto';

@Injectable()
export class PaymentService {
  constructor(
    private readonly paystack: PaystackGateway,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Installment)
    private readonly installmentRepo: Repository<Installment>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Plan) private readonly planRepo: Repository<Plan>,
  ) {}

  async landLordInvest(user, property, amount, dto) {
    if (dto.paymentType === 'installment') {
      const planName = `${property.title}_${user.id}_${dto.investmentType}`;
      const planExist = await this.planRepo.findOne({
        where: { name: planName },
      });
      if (!planExist) {
        // throw new NotFoundException({
        //   success: false,
        //   message: 'plan already exist',
        // });

        const planData: CreatePlanType = {
          name: planName,
          interval: dto.paymentFrequency,
          amount,
          send_invoices: true,
          send_sms: true,
          description: `${user.name} installment payment for ${property.title}'s ${dto.investmentType}`,
          currency: 'NGN',
          invoice_limit: dto?.invoiceLimit || null,
        };
        const plan = await this.paystack.createPlan(planData);
        if (!plan.plan_code) {
          throw new NotFoundException({
            success: false,
            message: 'unable to create plan',
          });
        }
      }

      const pay = await this.paystack.initiatePayment({
        email: user.email,
        amount,
        metadata: {
          userId: user.id,
          propertyId: property.id,
          investmentType: dto.investmentType, // either buying shares or property
          paymentType: dto.paymentType, // one_time || installment
          numberOfMonth: dto?.numberOfMonths || null, // number of month, if instalment
          paymentFrequency: dto.paymentFrequency || null, // if one time = daily, weekly and monthly
        },
      });
      return pay.data;
    } else {
      const pay = await this.paystack.initiatePayment({
        email: user.email,
        amount,
        metadata: {
          userId: user.id,
          propertyId: property.id,
          investmentType: dto.investmentType, // either buying shares or property
          paymentType: dto.paymentType, // one_time || installment
          numberOfMonth: dto?.numberOfMonths || null, // number of month, if instalment
          shares: dto.shares || null, // amount of shares
          paymentFrequency: dto.paymentFrequency || null, // if one time = daily, weekly and monthly
        },
      });
      return pay.data;
    }
  }

  async initiate(dto: InitiatePaymentDto) {
    const res = await this.paystack.initiatePayment(dto);
    return {
      Status: 201,
      Message: 'Payment initialized',
      Data: res.data,
    };
  }

  async verify(dto: VerifyPaymentDto) {
    const res = await this.paystack.verifyPayment(dto.reference);

    if (res.data.status !== 'success') {
      return {
        Status: 400,
        Message: 'Payment not successful',
      };
    }

    // handle logic like crediting wallet, updating status, etc.
    const status = res.data.status;
    const data = res.data;
    if (status === 'success') {
      // process successful payment
      const metadata = data?.metadata;
      const reference = data.reference;
      const email = data.customer.email;
      const amount = data.amount / 100; // Convert back to Naira

      const identifierOptions: UserIdentifierOptionsType = {
        identifierType: 'email',
        identifier: email,
      };
      const userPayload = {
        identifierOptions,
        updatePayload: {
          paystackAuthCode: data.authorization.authorization_code,
        },
      };

      const user = await this.userService.getUserByEmail(email);

      if (!user.paystackAuthCode) {
        await this.userService.updateUserRecord(userPayload);
      }

      if (metadata.paymentType === 'one_time') {
        await this.paymentRepo.save({
          userId: metadata.userId,
          propertyId: metadata.propertyId,
          investmentType: metadata.investmentType,
          shares: metadata?.shares,
          amount: amount,
          reference,
          email: email,
          status: 'success',
          paidAt: data.paid_at, //new Date(data.paid_at * 1000),
          customerCode: data.customer.customer_code,
        });
      }

      if (metadata.paymentType === 'installment') {
        // create a plan
        const planName = `${metadata.userId}_${metadata.propertyId}`;

        let planExist;
        planExist = await this.planRepo.findOne({
          where: { name: planName },
        });
        if (!planExist) {
          const planData = {
            name: planName,
            interval: metadata.paymentFrequency,
            amount,
          };
          planExist = await this.paystack.createPlan(planData);
        }
        // create subscription
        const subData = {
          authorization: data.authorization.authorization_code,
          customer: email,
          plan: planExist.plan_code,
        };
        const subscription = await this.paystack.subscribeToPlan(subData);

        // save the installment
        await this.installmentRepo.save({
          subscriptionCode: subscription.subscription_code,
          authorizationCode: data.authorization.authorization_code,
          userId: metadata.userId,
          propertyId: metadata.propertyId,
          investmentType: metadata.investmentType,
          amount: amount,
          frequency: metadata.paymentFrequency,
          status: 'active',
          nextPaymentDate: this.calculateNextDate(metadata.paymentFrequency),
          reference,
          startedAt: data.paid_at, // new Date(data.paid_at * 1000),
          email: email,
          customerCode: data.customer.customer_code,
        });
      }
    }
    return {
      message: 'Payment successful',
      data: res.data,
    };
  }

  async handleWebhook(payload: any, signature: string) {
    console.log('payload:', payload);
    const secret = this.configService.get<string>('PAYSTACK_SECRET_KEY');

    const hash = crypto
      .createHmac('sha512', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
    if (hash !== signature) {
      throw new UnauthorizedException('Invalid Paystack signature');
    }

    const event = payload.event;
    const data = payload.data;

    if (event === 'charge.success') {
      // process successful payment
      const metadata = data?.metadata;
      const reference = data.reference;
      const email = data.customer.email;
      const amount = data.amount / 100; // Convert back to Naira

      const userPayload = {
        identifierOptions: {
          identifierType: email,
          identifier: email,
        },
        updatePayload: {
          paystackAuthCode: data.authorization.authorization_code,
        },
      };

      const user = await this.userService.getUserByEmail(email);
      console.log('updatePayload: ', userPayload);

      if (!user.paystackAuthCode) {
        await this.userService.updateUserRecord(userPayload);
      }

      if (metadata.paymentType === 'one_time') {
        await this.paymentRepo.save({
          userId: metadata.userId,
          propertyId: metadata.propertyId,
          investmentType: metadata.investmentType,
          shares: metadata?.shares,
          amount: amount,
          reference,
          email: email,
          status: 'success',
          paidAt: data.paid_at, //new Date(data.paid_at * 1000),
          customerCode: data.customer.customer_code,
        });
      }

      if (metadata.paymentType === 'installment') {
        // create a plan
        const planName = `${metadata.userId}_${metadata.propertyId}`;

        let planExist;
        planExist = await this.planRepo.findOne({
          where: { name: planName },
        });
        if (!planExist) {
          const planData = {
            name: planName,
            interval: metadata.paymentFrequency,
            amount,
          };
          planExist = await this.paystack.createPlan(planData);
        }
        // create subscription
        const subData = {
          authorization: data.authorization.authorization_code,
          customer: email,
          plan: planExist.plan_code,
        };
        const subscription = await this.paystack.subscribeToPlan(subData);

        // save the installment
        await this.installmentRepo.save({
          subscriptionCode: subscription.subscription_code,
          authorizationCode: data.authorization.authorization_code,
          userId: metadata.userId,
          propertyId: metadata.propertyId,
          investmentType: metadata.type,
          amount: amount,
          frequency: metadata.paymentFrequency,
          status: 'active',
          nextPaymentDate: this.calculateNextDate(metadata.paymentFrequency),
          reference,
          startedAt: data.paid_at, // new Date(data.paid_at * 1000),
        });

        // Save successful payment to DB
        // const payment = this.paymentRepo.create({
        //   reference,
        //   email,
        //   amount,
        //   status: 'success',
        //   metadata: data.metadata || {},
        // });

        // await this.paymentRepo.save(payment);

        // // If installment payment, mark installment paid
        // if (data.metadata?.installmentId) {
        //   await this.installmentRepo.update(
        //     { id: data.metadata.installmentId },
        //     { paid: true },
        //   );
        // }

        // return { received: true };
      }
      // Handle other events if needed

      return { received: true };
    }
  }

  async autoDebitUser(installment: Installment) {
    const authorizationCode = installment.user?.paystackAuthCode;
    if (!authorizationCode) return;

    const axios = (await import('axios')).default;
    const secret = this.configService.get<string>('PAYSTACK_SECRET_KEY');

    await axios.post(
      'https://api.paystack.co/transaction/charge_authorization',
      {
        email: installment.user.email,
        amount: installment.amount * 100,
        authorization_code: authorizationCode,
        metadata: { installmentId: installment.id },
      },
      {
        headers: {
          Authorization: `Bearer ${secret}`,
          'Content-Type': 'application/json',
        },
      },
    );
  }

  async triggerAutoDebit(userId: string, amount: number, metadata: any = {}) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user || !user.paystackAuthCode) return;

    const axios = (await import('axios')).default;
    const secret = this.configService.get<string>('PAYSTACK_SECRET_KEY');

    await axios.post(
      'https://api.paystack.co/transaction/charge_authorization',
      {
        email: user.email,
        amount: amount * 100,
        authorization_code: user.paystackAuthCode,
        metadata,
      },
      {
        headers: {
          Authorization: `Bearer ${secret}`,
          'Content-Type': 'application/json',
        },
      },
    );
  }

  private calculateNextDate(frequency: string): Date {
    const now = new Date();

    switch (frequency) {
      case 'daily':
        return new Date(now.setDate(now.getDate() + 1));

      case 'weekly':
        return new Date(now.setDate(now.getDate() + 7));

      case 'monthly':
        return new Date(now.setMonth(now.getMonth() + 1));

      default:
        throw new Error('Invalid payment frequency');
    }
  }
}
