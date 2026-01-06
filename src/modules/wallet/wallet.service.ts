import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Wallet } from './entities/wallet.entity';
import { Repository, DataSource } from 'typeorm';
import {
  FundWalletDto,
  PayWithWalletDto,
  VerifyWalletFundingDto,
} from './dto/wallet.dto';
import { PaystackGateway } from '../payment/gateways/paystack.gateway';
import { WalletTransaction } from './entities/wallet-transaction.entity';
// import { randomUUID } from 'crypto';
import { PaymentProcessorService } from '../../shared/services/payment-processor.service';
import { PaymentOption } from '../landlord/dto/commercial.dto';
import { CurrencyUtil } from '../../shared/utils/currency.util';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(WalletTransaction)
    private readonly walletTransactionRepository: Repository<WalletTransaction>,
    private readonly paystack: PaystackGateway,
    private readonly dataSource: DataSource,
    private readonly paymentProcessor: PaymentProcessorService,
  ) {}

  async getOrCreateWallet(userId: string) {
    let wallet = await this.walletRepository.findOne({
      where: { userId },
    });
    if (wallet) {
      return wallet;
    }

    wallet = this.walletRepository.create({ userId, balanceKobo: '0' });
    return await this.walletRepository.save(wallet);
  }

  async fundWallet(
    fundWalletDto: FundWalletDto & {
      paymentOption?: PaymentOption;
      accountNumber?: string;
      bankCode?: string;
    },
  ) {
    const {
      userId,
      amountNaira,
      email,
      paymentOption = PaymentOption.CARD,
    } = fundWalletDto;

    await this.getOrCreateWallet(userId);

    if (paymentOption === PaymentOption.WALLET) {
      throw new BadRequestException('Cannot fund wallet using wallet payment');
    }

    const paymentRequest = {
      userId,
      userEmail: email,
      amount: amountNaira,
      paymentOption,
      accountNumber: fundWalletDto.accountNumber,
      bankCode: fundWalletDto.bankCode,
      reason: 'Wallet funding',
      description: `Fund wallet with ₦${amountNaira}`,
      metadata: {
        userId,
        reason: 'Wallet funding',
      },
    };

    const paymentResult = await this.paymentProcessor.processPayment(
      paymentRequest,
      { email },
    );

    return paymentResult;
  }

  async verifyAndCredit(reference: string) {
    const verification = await this.paystack.verifyPayment(reference);
    const status = verification?.data?.status; // 'success'
    const amountKobo = Number(verification?.data?.amount || 0); // Paystack returns amount in kobo
    const metadata = verification?.data || {};

    if (status !== 'success') {
      throw new BadRequestException('Transaction not successful');
    }

    // Idempotent credit: if tx with reference exists, no-op
    const exists = await this.walletTransactionRepository.findOne({
      where: { reference },
    });
    if (exists) return { credited: false, reason: 'already-processed' };

    // We need a wallet: we can encode userId in reference when initiating.
    const parts = reference.split('_');
    const userId = parts[1];
    const wallet = await this.getOrCreateWallet(userId);

    // amountKobo is already in kobo from Paystack, no conversion needed
    await this.applyCredit(
      wallet.id,
      amountKobo,
      'funding',
      reference,
      metadata,
    );

    return {
      credited: true,
      walletId: wallet.id,
      newBalanceKobo: (await this.walletRepository.findOneBy({
        id: wallet.id,
      }))!.balanceKobo,
    };
  }

  async payWithWallet(payWithWalletDto: PayWithWalletDto) {
    const { userId, amountNaira, reason } = payWithWalletDto;

    return await this.dataSource.transaction(async (manager) => {
      let wallet = await manager.findOne(Wallet, { where: { userId } });
      if (!wallet) {
        wallet = manager.create(Wallet, { userId, balanceKobo: '0' });
        wallet = await manager.save(wallet);
      }

      const amountKobo = CurrencyUtil.nairaToKobo(amountNaira);
      if (Number(wallet.balanceKobo) < amountKobo) {
        throw new BadRequestException('Insufficient wallet balance');
      }

      wallet.balanceKobo = (Number(wallet.balanceKobo) - amountKobo).toString();
      const updatedWallet = await manager.save(wallet);

      const transaction = manager.create(WalletTransaction, {
        userId,
        walletId: wallet.id,
        type: 'debit',
        amountKobo: amountKobo.toString(),
        reason: reason as any,
      });
      await manager.save(transaction);

      return {
        message: 'Payment successful',
        balanceKobo: updatedWallet.balanceKobo,
        reason,
      };
    });
  }

  async getWallet(userId: string) {
    return await this.getOrCreateWallet(userId);
  }

  async verifyWalletFunding(dto: VerifyWalletFundingDto) {
    return await this.verifyAndCredit(dto.reference);
  }

  private async logTransaction(data: {
    userId: string;
    walletId: string;
    type: 'credit' | 'debit';
    amountKobo: string;
    reference?: string;
    reason?: string;
    meta?: any;
  }) {
    const transaction = this.walletTransactionRepository.create({
      ...data,
      reason: data.reason as any,
    });
    return await this.walletTransactionRepository.save(transaction);
  }

  private async applyCredit(
    walletId: string,
    amountKobo: number,
    reason: string,
    reference: string,
    metadata?: any,
  ) {
    const wallet = await this.walletRepository.findOneBy({ id: walletId });
    if (!wallet) throw new NotFoundException('Wallet not found');

    wallet.balanceKobo = (Number(wallet.balanceKobo) + amountKobo).toString();
    await this.walletRepository.save(wallet);

    await this.logTransaction({
      userId: wallet.userId,
      walletId,
      type: 'credit',
      amountKobo: amountKobo.toString(),
      reference,
      reason,
      meta: metadata,
    });
  }
}
