import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as crypto from 'crypto';
// import { InitiatePaymentDto } from './dto/initiate-payment.dto';
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
import { VerifyAccountDto } from './dto/paystack.dto';
import { CreatePlanType } from './gateways/gateway.interface';
import { Rental } from '../property/entities/rental.entity';
import { Property } from '../property/entities/property.entity';
import { DataSource } from 'typeorm';
import {
  PaymentMethod,
  PaymentMethodType,
} from '../user/entities/payment-method.entity';

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
    @InjectRepository(Rental) private readonly rentalRepo: Repository<Rental>,
    @InjectRepository(Property)
    private readonly propertyRepo: Repository<Property>,
    private readonly dataSource: DataSource,
  ) {}

  async landLordInvest(user, property, amount, dto, channels) {
    try {
      if (dto.paymentType === 'installment') {
        const planName = `${property.title}_${user.id}_${dto.investmentType}`;
        const planExist = await this.planRepo.findOne({
          where: { name: planName },
        });
        if (!planExist) {
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
            paymentType: dto.paymentType, // installment
            numberOfMonth: dto?.numberOfMonths || null, // number of month, if instalment
            paymentFrequency: dto.paymentFrequency || null, // if one time = daily, weekly and monthly
          },
        });
        return pay.data;
      } else {
        const pay = await this.paystack.initiatePayment({
          email: user.email,
          amount,
          channels,
          metadata: {
            userId: user.id,
            propertyId: property.id,
            investmentType: dto.investmentType, // either buying shares or property
            paymentType: dto.paymentType, // one_time
            numberOfMonth: dto?.numberOfMonths || null, // number of month, if instalment
            shares: dto.shares || null, // amount of shares
            paymentFrequency: dto.paymentFrequency || null, // if one time = daily, weekly and monthly
          },
        });
        return pay.data;
      }
    } catch (error) {
      console.error(error);
    }
  }

  async initiate(dto: any) {
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

      // check if payment have been verified already
      const verified =
        (await this.paymentRepo.findOne({ where: { reference } })) ||
        (await this.installmentRepo.findOne({ where: { reference } }));
      console.log('payment or installment record: ', verified);
      if (verified) {
        return {
          message: 'Payment already verified successfully',
          data: res.data,
        };
      }

      const identifierOptions: UserIdentifierOptionsType = {
        identifierType: 'email',
        identifier: email,
      };
      const user = await this.userService.getUserByEmail(email);

      // Store payment method if it's a card payment
      if (data.authorization && data.authorization.authorization_code) {
        const existingMethod =
          await this.userService.getPaymentMethodByAuthCode(
            metadata.userId,
            data.authorization.authorization_code,
          );

        if (!existingMethod) {
          await this.userService.addPaymentMethod(metadata.userId, {
            authorizationCode: data.authorization.authorization_code,
            last4: data.authorization.last4,
            cardType: data.authorization.card_type,
            bank: data.authorization.bank,
            brand: data.authorization.brand,
            expMonth: data.authorization.exp_month,
            expYear: data.authorization.exp_year,
            reusable: data.authorization.reusable,
            type: PaymentMethodType.CARD,
          });
        }
      }

      if (metadata.paymentType === 'one_time') {
        await this.paymentRepo.save({
          userId: metadata.userId,
          propertyId: metadata.propertyId,
          investmentType: metadata.investmentType,
          shares:
            metadata?.shares && metadata.shares !== ''
              ? Number(metadata.shares)
              : null,
          amount: amount,
          reference,
          email: email,
          status: 'success',
          paidAt: data.paid_at,
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

        // Get or create payment method
        let paymentMethod = await this.userService.getPaymentMethodByAuthCode(
          metadata.userId,
          data.authorization.authorization_code,
        );

        if (!paymentMethod) {
          const result = await this.userService.addPaymentMethod(
            metadata.userId,
            {
              authorizationCode: data.authorization.authorization_code,
              last4: data.authorization.last4,
              cardType: data.authorization.card_type,
              bank: data.authorization.bank,
              brand: data.authorization.brand,
              expMonth: data.authorization.exp_month,
              expYear: data.authorization.exp_year,
              reusable: data.authorization.reusable,
              type: PaymentMethodType.CARD,
            },
          );
          paymentMethod = result.data;
        }

        // save the installment
        await this.installmentRepo.save({
          subscriptionCode: subscription.subscription_code,
          paymentMethodId: paymentMethod.id,
          userId: metadata.userId,
          propertyId: metadata.propertyId,
          investmentType: metadata.investmentType,
          amount: amount,
          frequency: metadata.paymentFrequency,
          status: 'active',
          nextPaymentDate: this.calculateNextDate(metadata.paymentFrequency),
          reference,
          startedAt: data.paid_at,
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

      const user = await this.userService.getUserByEmail(email);
      console.log('Processing webhook for user: ', user.email);

      // Store payment method if it's a card payment
      if (data.authorization && data.authorization.authorization_code) {
        const existingMethod =
          await this.userService.getPaymentMethodByAuthCode(
            metadata.userId,
            data.authorization.authorization_code,
          );

        if (!existingMethod) {
          await this.userService.addPaymentMethod(metadata.userId, {
            authorizationCode: data.authorization.authorization_code,
            last4: data.authorization.last4,
            cardType: data.authorization.card_type,
            bank: data.authorization.bank,
            brand: data.authorization.brand,
            expMonth: data.authorization.exp_month,
            expYear: data.authorization.exp_year,
            reusable: data.authorization.reusable,
            type: PaymentMethodType.CARD,
          });
        }
      }

      if (metadata.paymentType === 'one_time') {
        await this.paymentRepo.save({
          userId: metadata.userId,
          propertyId: metadata.propertyId,
          investmentType: metadata.investmentType,
          shares:
            metadata?.shares && metadata.shares !== ''
              ? Number(metadata.shares)
              : null,
          amount: amount,
          reference,
          email: email,
          status: 'success',
          paidAt: data.paid_at,
          customerCode: data.customer.customer_code,
        });

        // Update property based on investment type
        await this.updatePropertyAfterPayment({
          propertyId: metadata.propertyId,
          userId: metadata.userId,
          investmentType: metadata.investmentType,
          amount: amount,
          shares: metadata?.shares,
        });

        // Create rental record if it's a rent payment
        if (metadata.investmentType === 'rent') {
          await this.createRentalRecord({
            userId: metadata.userId,
            propertyId: metadata.propertyId,
            rentAmount: amount,
            paymentReference: reference,
            rentDuration: metadata.numberOfMonth || 12,
          });
        }
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
          startedAt: data.paid_at,
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
    if (!installment.paymentMethod?.authorizationCode) return;

    const axios = (await import('axios')).default;
    const secret = this.configService.get<string>('PAYSTACK_SECRET_KEY');

    await axios.post(
      'https://api.paystack.co/transaction/charge_authorization',
      {
        email: installment.user.email,
        amount: installment.amount * 100,
        authorization_code: installment.paymentMethod.authorizationCode,
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
    if (!user) return;

    const defaultPaymentMethod =
      await this.userService.getDefaultPaymentMethod(userId);
    if (!defaultPaymentMethod?.authorizationCode) return;

    const axios = (await import('axios')).default;
    const secret = this.configService.get<string>('PAYSTACK_SECRET_KEY');

    await axios.post(
      'https://api.paystack.co/transaction/charge_authorization',
      {
        email: user.email,
        amount: amount * 100,
        authorization_code: defaultPaymentMethod.authorizationCode,
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

  async getBanks() {
    return this.paystack.getBanks();
  }

  async getPayWithBanks() {
    return this.paystack.getPayWithBanks();
  }

  async verifyAccount(query: VerifyAccountDto) {
    return this.paystack.verifyAccount(query.accountNumber, query.bankCode);
  }

  async recordWalletPayment(paymentData: {
    userId: string;
    propertyId: string;
    investmentType: string;
    paymentType: string;
    shares?: number;
    amount: number;
    reference: string;
    email: string;
    status: string;
    paidAt: string;
    rentDuration?: number;
  }) {
    return await this.dataSource.transaction(async (manager) => {
      const payment = await manager.save(Payment, {
        userId: paymentData.userId,
        propertyId: paymentData.propertyId,
        investmentType: paymentData.investmentType,
        shares: paymentData.shares,
        amount: paymentData.amount,
        reference: paymentData.reference,
        email: paymentData.email,
        status: paymentData.status,
        paidAt: paymentData.paidAt,
        customerCode: null,
      });

      // Update property based on investment type
      await this.updatePropertyAfterPaymentWithManager(manager, {
        propertyId: paymentData.propertyId,
        userId: paymentData.userId,
        investmentType: paymentData.investmentType,
        amount: paymentData.amount,
        shares: paymentData.shares,
      });

      // If this is a rental payment, create rental record
      if (paymentData.investmentType === 'rent') {
        await this.createRentalRecordWithManager(manager, {
          userId: paymentData.userId,
          propertyId: paymentData.propertyId,
          rentAmount: paymentData.amount,
          paymentReference: paymentData.reference,
          rentDuration: paymentData.rentDuration || 12,
        });
      }

      return payment;
    });
  }

  async createRentalRecord(data: {
    userId: string;
    propertyId: string;
    rentAmount: number;
    paymentReference: string;
    rentDuration: number;
  }) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(startDate.getMonth() + data.rentDuration);

    return await this.rentalRepo.save({
      userId: data.userId,
      propertyId: data.propertyId,
      rentAmount: data.rentAmount,
      paymentReference: data.paymentReference,
      rentStartDate: startDate,
      rentEndDate: endDate,
      status: 'active',
    });
  }

  async createRentalRecordWithManager(
    manager: any,
    data: {
      userId: string;
      propertyId: string;
      rentAmount: number;
      paymentReference: string;
      rentDuration: number;
    },
  ) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(startDate.getMonth() + data.rentDuration);

    return await manager.save(Rental, {
      userId: data.userId,
      propertyId: data.propertyId,
      rentAmount: data.rentAmount,
      paymentReference: data.paymentReference,
      rentStartDate: startDate,
      rentEndDate: endDate,
      status: 'active',
    });
  }

  async updatePropertyAfterPayment(data: {
    propertyId: string;
    userId: string;
    investmentType: string;
    amount: number;
    shares?: number;
  }) {
    const property = await this.propertyRepo.findOne({
      where: { id: data.propertyId },
    });
    if (!property) return;

    switch (data.investmentType) {
      case 'property':
      case 'sale':
        property.isSold = true;
        property.owner = data.userId;
        property.soldAt = new Date();
        break;

      case 'shares':
        property.totalSharesSold =
          Number(property.totalSharesSold || 0) + (data.shares || 0);
        if (
          property.numberOfUnit &&
          property.totalSharesSold >= property.numberOfUnit
        ) {
          property.isSold = true;
          property.soldAt = new Date();
        }
        break;

      case 'joint-venture':
      case 'co-vest':
        property.totalInvestmentRaised =
          Number(property.totalInvestmentRaised || 0) + data.amount;
        if (
          property.investmentGoal &&
          property.totalInvestmentRaised >= property.investmentGoal
        ) {
          property.status = 'funded';
        }
        break;

      case 'rent':
        break;

      case 'flip':
        property.isSold = true;
        property.owner = data.userId;
        property.soldAt = new Date();
        break;
    }

    await this.propertyRepo.save(property);
  }

  async updatePropertyAfterPaymentWithManager(
    manager: any,
    data: {
      propertyId: string;
      userId: string;
      investmentType: string;
      amount: number;
      shares?: number;
    },
  ) {
    const property = await manager.findOne(Property, {
      where: { id: data.propertyId },
    });
    if (!property) return;

    switch (data.investmentType) {
      case 'property':
      case 'sale':
        property.isSold = true;
        property.owner = data.userId;
        property.soldAt = new Date();
        break;

      case 'shares':
        property.totalSharesSold =
          Number(property.totalSharesSold || 0) + (data.shares || 0);
        if (
          property.numberOfUnit &&
          property.totalSharesSold >= property.numberOfUnit
        ) {
          property.isSold = true;
          property.soldAt = new Date();
        }
        break;

      case 'joint-venture':
      case 'co-vest':
        property.totalInvestmentRaised =
          Number(property.totalInvestmentRaised || 0) + data.amount;
        if (
          property.investmentGoal &&
          property.totalInvestmentRaised >= property.investmentGoal
        ) {
          property.status = 'funded';
        }
        break;

      case 'rent':
        break;

      case 'flip':
        property.isSold = true;
        property.owner = data.userId;
        property.soldAt = new Date();
        break;
    }

    await manager.save(property);
  }
}
