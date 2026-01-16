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
  WithdrawFromWalletDto,
} from './dto/wallet.dto';
import { PaystackGateway } from '../payment/gateways/paystack.gateway';
import { WalletTransaction } from './entities/wallet-transaction.entity';
// import { randomUUID } from 'crypto';
import { PaymentProcessorService } from '../../shared/services/payment-processor.service';
import { PaymentOption } from '../commercial/dto/commercial.dto';
import { CurrencyUtil } from '../../shared/utils/currency.util';
import { User } from '../user/entities/user.entity';

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
  ) { }

  async getOrCreateWallet(userId: string) {
    let wallet = await this.walletRepository.findOne({
      where: { userId },
    });
    if (wallet) {
      // Explicitly include balance in naira (calls the getter)
      return {
        ...wallet,
        balance: wallet.balance,
      };
    }

    wallet = this.walletRepository.create({ userId, balanceKobo: '0' });
    const savedWallet = await this.walletRepository.save(wallet);

    // Explicitly include balance in naira (calls the getter)
    return {
      ...savedWallet,
      balance: savedWallet.balance,
    };
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
    const data = verification?.data || {};

    if (status !== 'success') {
      throw new BadRequestException('Transaction not successful');
    }

    // Idempotent credit: if tx with reference exists, no-op
    const exists = await this.walletTransactionRepository.findOne({
      where: { reference },
    });
    if (exists) return { credited: false, reason: 'already-processed' };

    // We need a wallet: get userId from metadata or fallback to reference
    let userId = data.metadata?.userId;
    if (!userId) {
      const parts = reference.split('_');
      userId = parts[1];
    }

    if (!userId) {
      throw new BadRequestException('User ID not found in transaction');
    }

    const wallet = await this.getOrCreateWallet(userId);

    // amountKobo is already in kobo from Paystack, no conversion needed
    await this.applyCredit(
      wallet.id,
      amountKobo,
      'funding',
      reference,
      data.metadata,
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
    const wallet = await this.getOrCreateWallet(userId);
    return {
      message: 'Wallet retrieved successfully',
      ...wallet,
    };
  }

  async verifyWalletFunding(dto: VerifyWalletFundingDto) {
    return await this.verifyAndCredit(dto.reference);
  }

  async withdrawFromWallet(dto: { userId: string; amountNaira: number }) {
    const { userId, amountNaira } = dto;

    return await this.dataSource.transaction(async (manager) => {
      // Get wallet
      let wallet = await manager.findOne(Wallet, { where: { userId } });
      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }

      // Check balance
      const amountKobo = CurrencyUtil.nairaToKobo(amountNaira);
      if (Number(wallet.balanceKobo) < amountKobo) {
        throw new BadRequestException('Insufficient wallet balance');
      }

      // Get user with bank account details
      const user = await manager.findOne(User, {
        where: { id: userId },
        relations: ['bankAccounts'],
        select: ['id', 'name', 'email'],
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Check if user has default bank account
      const defaultBankAccount = user.bankAccounts?.find((acc) => acc.autoCharge);

      if (!defaultBankAccount) {
        throw new BadRequestException(
          'No default bank account found. Please add your bank account details in your profile.',
        );
      }

      // Create transfer recipient on Paystack if needed
      const recipientName = defaultBankAccount.accountName || user.name;
      const recipientResult = await this.paystack.createTransferRecipient({
        name: recipientName,
        accountNumber: defaultBankAccount.accountNumber,
        bankCode: defaultBankAccount.bankCode,
        description: 'Wallet withdrawal recipient',
      });

      if (!recipientResult.status || !recipientResult.data?.recipient_code) {
        throw new BadRequestException('Failed to create transfer recipient');
      }

      // Initiate transfer
      const reference = `withdraw_${userId}_${Date.now()}`;
      const transferResult = await this.paystack.initiateTransfer({
        amountKobo,
        recipientCode: recipientResult.data.recipient_code,
        reason: 'Wallet withdrawal',
        reference,
      });

      if (!transferResult.status) {
        throw new BadRequestException('Failed to initiate transfer');
      }

      // Debit wallet
      wallet.balanceKobo = (Number(wallet.balanceKobo) - amountKobo).toString();
      await manager.save(wallet);

      // Log transaction
      const transaction = manager.create(WalletTransaction, {
        userId,
        walletId: wallet.id,
        type: 'debit',
        amountKobo: amountKobo.toString(),
        reference,
        reason: 'withdrawal',
      });
      await manager.save(transaction);

      return {
        message: 'Withdrawal initiated successfully',
        balanceKobo: wallet.balanceKobo,
        transferCode: transferResult.data?.transfer_code,
        reference,
      };
    });
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
