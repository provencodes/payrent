import {
  Injectable,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PaymentService } from '../../modules/payment/payment.service';
import { WalletService } from '../../modules/wallet/wallet.service';
import { PaymentOption } from '../../modules/commercial/dto/commercial.dto';
import UserService from '../../modules/user/user.service';

export interface PaymentRequest {
  userId: string;
  userEmail: string;
  amount: number;
  paymentOption: PaymentOption;
  propertyId?: string;
  investmentType?: string;
  paymentType?: string;
  shares?: number;
  numberOfMonths?: number;
  paymentFrequency?: string;
  accountNumber?: string;
  bankCode?: string;
  reason: string;
  description: string;
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  success: boolean;
  message: string;
  authorization_url?: string;
  reference?: string;
  paymentMethod: string;
  amount: number;
  balance?: string;
}

@Injectable()
export class PaymentProcessorService {
  constructor(
    @Inject(forwardRef(() => PaymentService))
    private readonly paymentService: PaymentService,
    @Inject(forwardRef(() => WalletService))
    private readonly walletService: WalletService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  async processPayment(
    request: PaymentRequest,
    user: any,
    property?: any,
  ): Promise<PaymentResponse> {
    const { paymentOption, amount } = request;

    switch (paymentOption) {
      case PaymentOption.CARD:
        return this.processCardPayment(request, user, property);

      case PaymentOption.BANK:
        return this.processBankPayment(request, user, property);

      case PaymentOption.TRANSFER:
        return this.processTransferPayment(request, user, property);

      case PaymentOption.WALLET:
        return this.processWalletPayment(request);

      default:
        throw new BadRequestException('Invalid payment option');
    }
  }

  private async processCardPayment(
    request: PaymentRequest,
    user: any,
    property?: any,
  ): Promise<PaymentResponse> {
    const channels = ['card'];

    if (property) {
      const res = await this.paymentService.landLordInvest(
        user,
        property,
        request.amount,
        request,
        channels,
      );
      return {
        success: true,
        message: 'Redirect to payment gateway',
        authorization_url: res.authorization_url,
        reference: res.reference,
        paymentMethod: 'card',
        amount: request.amount,
      };
    }

    const res = await this.paymentService.initiate({
      email: request.userEmail,
      amount: request.amount,
      channels,
      metadata: {
        userId: request.userId,
        ...(request.metadata || {}),
        propertyId: request.propertyId,
        investmentType: request.investmentType,
        paymentType: request.paymentType,
        reason: request.reason,
      },
    });

    return {
      success: true,
      message: 'Redirect to payment gateway',
      authorization_url: res.Data.authorization_url,
      reference: res.Data.reference,
      paymentMethod: 'card',
      amount: request.amount,
    };
  }

  private async processBankPayment(
    request: PaymentRequest,
    user: any,
    property?: any,
  ): Promise<PaymentResponse> {
    let accountNumber = request.accountNumber;
    let bankCode = request.bankCode;

    if (!accountNumber || !bankCode) {
      const defaultBankAccount = await this.userService.getDefaultBankAccount(
        request.userId,
      );
      if (!defaultBankAccount) {
        throw new BadRequestException(
          'No bank account found. Please add a bank account or provide account details.',
        );
      }
      accountNumber = defaultBankAccount.accountNumber;
      bankCode = defaultBankAccount.bankCode;
    }

    const channels = ['bank'];
    const requestWithBankDetails = { ...request, accountNumber, bankCode };

    if (property) {
      const res = await this.paymentService.landLordInvest(
        user,
        property,
        request.amount,
        requestWithBankDetails,
        channels,
      );
      return {
        success: true,
        message: 'Redirect to payment gateway',
        authorization_url: res.authorization_url,
        reference: res.reference,
        paymentMethod: 'bank',
        amount: request.amount,
      };
    }

    const res = await this.paymentService.initiate({
      email: request.userEmail,
      amount: request.amount,
      channels,
      metadata: {
        userId: request.userId,
        ...(request.metadata || {}),
        propertyId: request.propertyId,
        investmentType: request.investmentType,
        paymentType: request.paymentType,
        reason: request.reason,
      },
    });

    return {
      success: true,
      message: 'Redirect to payment gateway',
      authorization_url: res.Data.authorization_url,
      reference: res.Data.reference,
      paymentMethod: 'bank',
      amount: request.amount,
    };
  }

  private async processTransferPayment(
    request: PaymentRequest,
    user: any,
    property?: any,
  ): Promise<PaymentResponse> {
    const channels = ['bank_transfer'];

    if (property) {
      const res = await this.paymentService.landLordInvest(
        user,
        property,
        request.amount,
        request,
        channels,
      );
      return {
        success: true,
        message: 'Redirect to payment gateway',
        authorization_url: res.authorization_url,
        reference: res.reference,
        paymentMethod: 'transfer',
        amount: request.amount,
      };
    }

    const res = await this.paymentService.initiate({
      email: request.userEmail,
      amount: request.amount,
      channels,
      metadata: {
        userId: request.userId,
        ...(request.metadata || {}),
        propertyId: request.propertyId,
        investmentType: request.investmentType,
        paymentType: request.paymentType,
        reason: request.reason,
      },
    });

    return {
      success: true,
      message: 'Redirect to payment gateway',
      authorization_url: res.Data.authorization_url,
      reference: res.Data.reference,
      paymentMethod: 'transfer',
      amount: request.amount,
    };
  }

  private async processWalletPayment(
    request: PaymentRequest,
  ): Promise<PaymentResponse> {
    const paymentResult = await this.walletService.payWithWallet({
      userId: request.userId,
      amountNaira: request.amount,
      reason: request.reason,
      description: request.description,
    });

    if (request.propertyId) {
      await this.paymentService.recordWalletPayment({
        userId: request.userId,
        propertyId: request.propertyId,
        investmentType: request.investmentType || 'payment',
        paymentType: request.paymentType || 'one_time',
        shares: request.shares || null,
        amount: request.amount,
        reference: `wallet_${Date.now()}_${request.userId}`,
        email: request.userEmail,
        status: 'success',
        paidAt: new Date().toISOString(),
        rentDuration: request.numberOfMonths,
      });
    }

    return {
      success: true,
      message: 'Payment successful via wallet',
      paymentMethod: 'wallet',
      amount: request.amount,
      balance: paymentResult.balanceKobo,
    };
  }
}
