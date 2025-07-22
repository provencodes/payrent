import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Wallet } from './entities/wallet.entity';
import { Repository } from 'typeorm';
import {
  FundWalletDto,
  PayWithWalletDto,
  VerifyWalletFundingDto,
} from './dto/wallet.dto';
import { PaystackGateway } from '../payment/gateways/paystack.gateway';
import { WalletTransaction } from './entities/wallet-transaction.entity';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(WalletTransaction)
    private readonly walletTransactionRepository: Repository<WalletTransaction>,
    private readonly paystackService: PaystackGateway,
  ) {}

  async createWallet(userId: string) {
    // const { userId } = createWalletDto;

    const existingWallet = await this.walletRepository.findOne({
      where: { userId },
    });
    if (existingWallet) {
      throw new BadRequestException('Wallet already exists for this user');
    }

    const wallet = this.walletRepository.create({ userId, balance: 0 });
    return await this.walletRepository.save(wallet);
  }

  async fundWallet(fundWalletDto: FundWalletDto) {
    const { userId, amount } = fundWalletDto;

    const wallet = await this.walletRepository.findOne({ where: { userId } });
    if (!wallet) throw new NotFoundException('Wallet not found');

    // TODO Take the money from the user!
    

    wallet.balance = Number(wallet.balance) + Number(amount);
    return await this.walletRepository.save(wallet);
  }

  async payWithWallet(payWithWalletDto: PayWithWalletDto) {
    const { userId, amount, reason } = payWithWalletDto;

    const wallet = await this.walletRepository.findOne({ where: { userId } });
    if (!wallet) throw new NotFoundException('Wallet not found');

    if (wallet.balance < amount) {
      throw new BadRequestException('Insufficient wallet balance');
    }

    wallet.balance = Number(wallet.balance) - Number(amount);
    const updatedWallet = await this.walletRepository.save(wallet);

    // Optionally, log this transaction
    // e.g., this.logWalletTransaction(userId, amount, reason);
    await this.logTransaction({
      userId,
      walletId: wallet.id,
      type: 'debit',
      amount,
      reason,
    });

    return {
      message: 'Payment successful',
      balance: updatedWallet.balance,
      reason,
    };
  }

  async getWallet(userId: string) {
    const wallet = await this.walletRepository.findOne({ where: { userId } });
    if (!wallet) throw new NotFoundException('Wallet not found');
    return wallet;
  }

  async verifyWalletFunding(dto: VerifyWalletFundingDto) {
    const { reference, userId } = dto;

    // Assume you have a PaystackService that verifies transactions
    const transaction = await this.paystackService.verifyPayment(reference);
    if (!transaction || transaction.status !== 'success') {
      throw new BadRequestException('Transaction verification failed');
    }

    const amount = transaction.amount / 100; // Convert from kobo to naira

    const wallet = await this.walletRepository.findOne({ where: { userId } });
    if (!wallet) throw new NotFoundException('Wallet not found');

    wallet.balance += amount;

    const updatedWallet = await this.walletRepository.save(wallet);

    await this.logTransaction({
      userId,
      walletId: wallet.id,
      type: 'funding',
      amount,
      reference,
      reason: 'Wallet funding',
    });

    return {
      message: 'Wallet funded successfully',
      balance: updatedWallet.balance,
    };
  }

  private async logTransaction(data: {
    userId: string;
    walletId: string;
    type: 'funding' | 'debit';
    amount: number;
    reference?: string;
    reason?: string;
  }) {
    const transaction = this.walletTransactionRepository.create(data);
    return await this.walletTransactionRepository.save(transaction);
  }
}
