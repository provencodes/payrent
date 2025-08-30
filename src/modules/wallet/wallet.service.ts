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
import { randomUUID } from 'crypto';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(WalletTransaction)
    private readonly walletTransactionRepository: Repository<WalletTransaction>,
    private readonly paystack: PaystackGateway,
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

  async fundWallet(fundWalletDto: FundWalletDto) {
    const { userId, amountNaira } = fundWalletDto;

    const wallet = await this.walletRepository.findOne({ where: { userId } });
    if (!wallet) throw new NotFoundException('Wallet not found');

    // TODO Take the money from the user!

    const reference = `fund_${userId}_${Date.now()}_${randomUUID()}`;

    const payload = {
      email: fundWalletDto.email,
      amount: amountNaira,
      reference,
      metadata: {
        userId,
        walletId: wallet.id,
        purpose: 'wallet_funding',
      },
    };
    const init = await this.paystack.initiatePayment(payload);
    return init.data.authorization_url;
    // return { ...init, reference, amount, walletId: wallet.id };
  }

  async verifyAndCredit(reference: string) {
    const verification = await this.paystack.verifyPayment(reference);
    const status = verification?.data?.status; // 'success'
    const amount = Number(verification?.data?.amount || 0); // in kobo
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

    await this.applyCredit(wallet.id, amount, 'funding', reference, metadata);

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

    const wallet = await this.walletRepository.findOne({ where: { userId } });
    if (!wallet) throw new NotFoundException('Wallet not found');

    const amountKobo = amountNaira * 100;
    if (Number(wallet.balanceKobo) < amountKobo) {
      throw new BadRequestException('Insufficient wallet balance');
    }

    wallet.balanceKobo = (Number(wallet.balanceKobo) - amountKobo).toString();
    const updatedWallet = await this.walletRepository.save(wallet);

    await this.logTransaction({
      userId,
      walletId: wallet.id,
      type: 'debit',
      amountKobo: amountKobo.toString(),
      reason,
    });

    return {
      message: 'Payment successful',
      balanceKobo: updatedWallet.balanceKobo,
      reason,
    };
  }

  async getWallet(userId: string) {
    const wallet = await this.walletRepository.findOne({ where: { userId } });
    if (!wallet) throw new NotFoundException('Wallet not found');
    return wallet;
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
