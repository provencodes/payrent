import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../payment/entities/payment.entity';
import { WalletTransaction } from '../wallet/entities/wallet-transaction.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { Rental } from '../property/entities/rental.entity';
import { RentSavings } from '../tenant/entities/rent-savings.entity';
import { LoanApplication } from '../tenant/entities/loan-application.entity';

@Injectable()
export class UserFinancialService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(WalletTransaction)
    private readonly walletTransactionRepo: Repository<WalletTransaction>,
    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,
    @InjectRepository(Rental)
    private readonly rentalRepo: Repository<Rental>,
    @InjectRepository(RentSavings)
    private readonly rentSavingsRepo: Repository<RentSavings>,
    @InjectRepository(LoanApplication)
    private readonly loanApplicationRepo: Repository<LoanApplication>,
  ) {}

  async getTransactionHistory(userId: string, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;
      const maxLimit = Math.min(limit, 100); // Prevent excessive queries

      const [payments, paymentsTotal] = await this.paymentRepo.findAndCount({
        where: { userId },
        order: { createdAt: 'DESC' },
        skip,
        take: maxLimit,
      });

      return {
        message: 'Transaction history fetched successfully',
        data: {
          transactions: payments.map((payment) => ({
            id: payment.id,
            type: 'payment',
            amount: payment.amount,
            investmentType: payment.investmentType,
            shares: payment.shares,
            reference: payment.reference,
            status: payment.status,
            date: payment.createdAt,
            description: `${payment.investmentType} payment`,
          })),
          pagination: {
            page,
            limit: maxLimit,
            total: paymentsTotal,
            totalPages: Math.ceil(paymentsTotal / maxLimit),
          },
        },
      };
    } catch (error) {
      throw new Error(`Failed to fetch transaction history: ${error.message}`);
    }
  }

  async getWalletHistory(userId: string, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;
      const maxLimit = Math.min(limit, 100);

      const [transactions, total] =
        await this.walletTransactionRepo.findAndCount({
          where: { userId },
          order: { createdAt: 'DESC' },
          skip,
          take: maxLimit,
        });

      const wallet = await this.walletRepo.findOne({ where: { userId } });

      return {
        message: 'Wallet history fetched successfully',
        data: {
          currentBalance: wallet ? wallet.balance : 0,
          transactions: transactions.map((tx) => ({
            id: tx.id,
            type: tx.type,
            amount: Number(tx.amountKobo) / 100,
            reason: tx.reason,
            reference: tx.reference,
            date: tx.createdAt,
            meta: tx.meta,
          })),
          pagination: {
            page,
            limit: maxLimit,
            total,
            totalPages: Math.ceil(total / maxLimit),
          },
        },
      };
    } catch (error) {
      throw new Error(`Failed to fetch wallet history: ${error.message}`);
    }
  }

  async getAllPaymentHistory(userId: string) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    try {
      // Get all payment types
      const [payments, rentals, rentSavings, loans] = await Promise.all([
        this.paymentRepo.find({
          where: { userId },
          order: { createdAt: 'DESC' },
        }),
        this.rentalRepo.find({
          where: { userId },
          relations: ['property'],
          order: { createdAt: 'DESC' },
        }),
        this.rentSavingsRepo.find({
          where: { userId },
          order: { createdAt: 'DESC' },
        }),
        this.loanApplicationRepo.find({
          where: { userId },
          order: { createdAt: 'DESC' },
        }),
      ]);

      // Combine all payment history
      const allPayments = [
        ...payments.map((p) => ({
          id: p.id,
          type: 'investment_payment',
          category: p.investmentType,
          amount: p.amount,
          status: p.status,
          date: p.createdAt,
          reference: p.reference,
          description: `${p.investmentType} investment`,
        })),
        ...rentals.map((r) => ({
          id: r.id,
          type: 'rent_payment',
          category: 'rent',
          amount: Number(r.rentAmount),
          status: r.status,
          date: r.createdAt,
          reference: r.paymentReference,
          description: `Rent for ${r.property?.title || 'Property'}`,
          property: r.property?.title,
        })),
        ...rentSavings.map((s) => ({
          id: s.id,
          type: 'rent_savings',
          category: 'savings',
          amount: Number(s.currentSavings),
          status: s.status,
          date: s.createdAt,
          description: 'Rent savings plan',
          goal: Number(s.totalSavingsGoal),
          progress:
            (Number(s.currentSavings) / Number(s.totalSavingsGoal)) * 100,
        })),
        ...loans.map((l) => ({
          id: l.id,
          type: 'loan_application',
          category: 'loan',
          amount: Number(l.loanAmount),
          status: l.status,
          date: l.createdAt,
          description: `${l.loanPurpose} loan application`,
          purpose: l.loanPurpose,
        })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return {
        message: 'Complete payment history fetched successfully',
        data: {
          totalTransactions: allPayments.length,
          transactions: allPayments,
        },
      };
    } catch (error) {
      throw new Error(
        `Failed to fetch complete payment history: ${error.message}`,
      );
    }
  }
  async getUserFinancialOverview(userId: string) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    try {
      const [
        wallet,
        totalPayments,
        totalRentPaid,
        totalSavings,
        activeLoans,
        walletTransactions,
      ] = await Promise.all([
        this.walletRepo.findOne({ where: { userId } }),
        this.paymentRepo
          .createQueryBuilder('payment')
          .select('SUM(payment.amount)', 'total')
          .addSelect('COUNT(payment.id)', 'count')
          .where('payment.userId = :userId', { userId })
          .andWhere('payment.status = :status', { status: 'success' })
          .getRawOne(),
        this.rentalRepo
          .createQueryBuilder('rental')
          .select('SUM(rental.rentAmount)', 'total')
          .addSelect('COUNT(rental.id)', 'count')
          .where('rental.userId = :userId', { userId })
          .getRawOne(),
        this.rentSavingsRepo
          .createQueryBuilder('savings')
          .select('SUM(savings.currentSavings)', 'total')
          .addSelect('COUNT(savings.id)', 'count')
          .where('savings.userId = :userId', { userId })
          .getRawOne(),
        this.loanApplicationRepo.count({
          where: { userId, status: 'approved' },
        }),
        this.walletTransactionRepo
          .createQueryBuilder('wt')
          .select(
            'SUM(CASE WHEN wt.type = :credit THEN wt.amountKobo ELSE 0 END)',
            'totalCredits',
          )
          .addSelect(
            'SUM(CASE WHEN wt.type = :debit THEN wt.amountKobo ELSE 0 END)',
            'totalDebits',
          )
          .where('wt.userId = :userId', { userId })
          .setParameters({ credit: 'credit', debit: 'debit' })
          .getRawOne(),
      ]);

      const currentBalance = wallet ? wallet.balance : 0;
      const totalInvestments = Number(totalPayments?.total || 0);
      const totalRent = Number(totalRentPaid?.total || 0);
      const totalSaved = Number(totalSavings?.total || 0);
      const totalCredits = Number(walletTransactions?.totalCredits || 0) / 100;
      const totalDebits = Number(walletTransactions?.totalDebits || 0) / 100;

      return {
        message: 'Financial overview fetched successfully',
        data: {
          wallet: {
            currentBalance,
            totalCredits,
            totalDebits,
            netFlow: totalCredits - totalDebits,
          },
          investments: {
            totalInvestments,
            totalTransactions: Number(totalPayments?.count || 0),
          },
          rentals: {
            totalRentPaid: totalRent,
            totalRentals: Number(totalRentPaid?.count || 0),
          },
          savings: {
            totalSaved,
            activePlans: Number(totalSavings?.count || 0),
          },
          loans: {
            activeLoans,
          },
          summary: {
            totalMoneySpent: totalInvestments + totalRent + totalDebits,
            totalMoneyReceived: totalCredits,
            netPosition:
              totalCredits - (totalInvestments + totalRent + totalDebits),
          },
        },
      };
    } catch (error) {
      throw new Error(`Failed to fetch financial overview: ${error.message}`);
    }
  }
}
