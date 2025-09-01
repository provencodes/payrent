import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SaveRentDto } from './dto/tenant.dto';
import { ApplyLoanDto } from './dto/loan.dto';
import { RentSavings } from './entities/rent-savings.entity';
import { LoanApplication } from './entities/loan-application.entity';
import { Rental } from '../property/entities/rental.entity';
import { WalletService } from '../wallet/wallet.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(RentSavings)
    private readonly rentSavingsRepo: Repository<RentSavings>,
    @InjectRepository(LoanApplication)
    private readonly loanApplicationRepo: Repository<LoanApplication>,
    @InjectRepository(Rental)
    private readonly rentalRepo: Repository<Rental>,
    private readonly walletService: WalletService,
    private readonly configService: ConfigService,
  ) {}

  async createRentSavings(dto: SaveRentDto, userId: string) {
    if (
      !(dto.amount || dto.duration || dto.totalSavingsGoal || dto.maturityDate)
    ) {
      throw new BadRequestException(
        'amount, duration, total savings goal, maturity date, etc must be stated...',
      );
    }
    if (
      dto.amount * dto.duration !== dto.totalSavingsGoal ||
      (dto.interestRate / 100) * dto.totalSavingsGoal + dto.totalSavingsGoal !==
        dto.estimatedReturn
    ) {
      throw new BadRequestException(
        'Error in entries, invalid calculation from values',
      );
    }

    const rentSavings = this.rentSavingsRepo.create({
      userId,
      monthlyAmount: dto.amount,
      totalSavingsGoal: dto.totalSavingsGoal,
      duration: dto.duration,
      maturityDate: dto.maturityDate,
      interestRate: dto.interestRate,
      estimatedReturn: dto.estimatedReturn,
      automation: dto.automation,
    });

    const saved = await this.rentSavingsRepo.save(rentSavings);

    return {
      message: 'Rent savings plan created successfully',
      data: saved,
    };
  }

  async applyForLoan(dto: ApplyLoanDto, userId: string) {
    // Calculate loan terms
    const interestRate = this.calculateInterestRate(
      dto.loanAmount,
      dto.repaymentPeriod,
    );
    const monthlyRepayment = this.calculateMonthlyRepayment(
      dto.loanAmount,
      interestRate,
      dto.repaymentPeriod,
    );
    const totalRepayment = monthlyRepayment * dto.repaymentPeriod;

    // Check if user can afford the loan
    const maxDebtRatio = this.configService.get('loan.maxDebtToIncomeRatio');
    if (monthlyRepayment > dto.monthlyIncome * maxDebtRatio) {
      throw new BadRequestException(
        `Monthly repayment exceeds ${maxDebtRatio * 100}% of your income. Please reduce loan amount or extend repayment period.`,
      );
    }

    const loanApplication = this.loanApplicationRepo.create({
      userId,
      loanAmount: dto.loanAmount,
      loanPurpose: dto.loanPurpose,
      repaymentPeriod: dto.repaymentPeriod,
      interestRate,
      monthlyRepayment,
      totalRepayment,
      employmentStatus: dto.employmentStatus,
      monthlyIncome: dto.monthlyIncome,
      guarantorName: dto.guarantorName,
      guarantorPhone: dto.guarantorPhone,
    });

    const saved = await this.loanApplicationRepo.save(loanApplication);

    return {
      message: 'Loan application submitted successfully',
      data: {
        applicationId: saved.id,
        loanAmount: saved.loanAmount,
        monthlyRepayment: saved.monthlyRepayment,
        totalRepayment: saved.totalRepayment,
        interestRate: saved.interestRate,
        status: saved.status,
      },
    };
  }

  async getRentPayments(userId: string) {
    const rentals = await this.rentalRepo.find({
      where: { userId },
      relations: ['property'],
      select: {
        id: true,
        rentAmount: true,
        rentStartDate: true,
        rentEndDate: true,
        status: true,
        createdAt: true,
        property: {
          id: true,
          title: true,
          address: true,
        },
      },
      order: { createdAt: 'DESC' },
    });

    const totalRentPaid = rentals.reduce(
      (sum, rental) => sum + Number(rental.rentAmount),
      0,
    );
    const activeRentals = rentals.filter((r) => r.status === 'active');

    return {
      message: 'Rent payments fetched successfully',
      data: {
        totalRentPaid,
        totalRentals: rentals.length,
        activeRentals: activeRentals.length,
        rentals,
      },
    };
  }

  async getRentSavings(userId: string) {
    const savings = await this.rentSavingsRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    return {
      message: 'Rent savings fetched successfully',
      data: savings,
    };
  }

  async getLoanApplications(userId: string) {
    const applications = await this.loanApplicationRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    return {
      message: 'Loan applications fetched successfully',
      data: applications,
    };
  }

  async fundRentSavings(savingsId: string, userId: string, amount: number) {
    const savings = await this.rentSavingsRepo.findOne({
      where: { id: savingsId, userId },
    });

    if (!savings) {
      throw new NotFoundException('Rent savings plan not found');
    }

    if (savings.status !== 'active') {
      throw new BadRequestException('Savings plan is not active');
    }

    // Deduct from wallet
    await this.walletService.payWithWallet({
      userId,
      amountNaira: amount,
      reason: 'Rent savings contribution',
      description: `Contribution to rent savings plan`,
    });

    // Update savings
    savings.currentSavings = Number(savings.currentSavings) + amount;

    // Check if goal is reached
    if (savings.currentSavings >= savings.totalSavingsGoal) {
      savings.status = 'completed';
    }

    await this.rentSavingsRepo.save(savings);

    return {
      message: 'Rent savings funded successfully',
      data: {
        currentSavings: savings.currentSavings,
        totalSavingsGoal: savings.totalSavingsGoal,
        progress: (savings.currentSavings / savings.totalSavingsGoal) * 100,
        status: savings.status,
      },
    };
  }

  private calculateInterestRate(
    loanAmount: number,
    repaymentPeriod: number,
  ): number {
    const config = this.configService.get('finance');
    let baseRate = config.baseInterestRate;

    if (loanAmount > config.highAmountThreshold) baseRate += 2;
    if (repaymentPeriod > config.longTermThreshold) baseRate += 1;

    return baseRate;
  }

  private calculateMonthlyRepayment(
    principal: number,
    annualRate: number,
    months: number,
  ): number {
    const monthlyRate = annualRate / 100 / 12;
    const monthlyPayment =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);

    return Math.round(monthlyPayment * 100) / 100;
  }
}
