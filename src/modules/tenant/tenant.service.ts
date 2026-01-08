import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SaveRentDto } from './dto/tenant.dto';
import { ApplyLoanDto } from './dto/loan.dto';
import { RentPropertyDto, PaymentMethod } from './dto/rent-property.dto';
import { Property } from '../property/entities/property.entity';
import { RentSavings } from './entities/rent-savings.entity';
import { LoanApplication } from './entities/loan-application.entity';
import { Rental } from '../property/entities/rental.entity';
import { ConfigService } from '@nestjs/config';
import { PaymentProcessorService } from '../../shared/services/payment-processor.service';
import { PaymentOption } from '../commercial/dto/commercial.dto';

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(RentSavings)
    private readonly rentSavingsRepo: Repository<RentSavings>,
    @InjectRepository(LoanApplication)
    private readonly loanApplicationRepo: Repository<LoanApplication>,
    @InjectRepository(Rental)
    private readonly rentalRepo: Repository<Rental>,
    @InjectRepository(Property)
    private readonly propertyRepo: Repository<Property>,
    private readonly paymentProcessor: PaymentProcessorService,
    private readonly configService: ConfigService,
  ) { }

  async createRentSavings(dto: SaveRentDto, userId: string, userEmail: string) {
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

    const paymentRequest = {
      userId,
      userEmail,
      amount: dto.amount,
      paymentOption: dto.paymentOption || PaymentOption.WALLET,
      accountNumber: dto.accountNumber,
      bankCode: dto.bankCode,
      reason: 'Rent savings plan creation',
      description: `Initial payment for rent savings plan - ₦${dto.amount}`,
    };

    const paymentResult = await this.paymentProcessor.processPayment(
      paymentRequest,
      { email: userEmail },
    );

    const rentSavings = this.rentSavingsRepo.create({
      userId,
      monthlyAmount: dto.amount,
      totalSavingsGoal: dto.totalSavingsGoal,
      duration: dto.duration,
      maturityDate: dto.maturityDate,
      interestRate: dto.interestRate,
      estimatedReturn: dto.estimatedReturn,
      automation: dto.automation,
      currentSavings: paymentResult.success ? dto.amount : 0,
    });

    const saved = await this.rentSavingsRepo.save(rentSavings);

    return {
      message: 'Rent savings plan created successfully',
      data: { ...saved, paymentResult },
    };
  }

  async applyForLoan(dto: ApplyLoanDto, userId: string) {
    // Calculate loan terms
    // TODO  COLLECT THE MONEY
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

  async fundRentSavings(
    savingsId: string,
    userId: string,
    userEmail: string,
    amount: number,
    paymentOption: PaymentOption,
    accountNumber?: string,
    bankCode?: string,
  ) {
    const savings = await this.rentSavingsRepo.findOne({
      where: { id: savingsId, userId },
    });

    if (!savings) {
      throw new NotFoundException('Rent savings plan not found');
    }

    if (savings.status !== 'active') {
      throw new BadRequestException('Savings plan is not active');
    }

    const paymentRequest = {
      userId,
      userEmail,
      amount,
      paymentOption,
      accountNumber,
      bankCode,
      reason: 'Rent savings contribution',
      description: `Contribution to rent savings plan - ₦${amount}`,
    };

    const paymentResult = await this.paymentProcessor.processPayment(
      paymentRequest,
      { email: userEmail },
    );

    if (paymentResult.success) {
      savings.currentSavings = Number(savings.currentSavings) + amount;

      if (savings.currentSavings >= savings.totalSavingsGoal) {
        savings.status = 'completed';
      }

      await this.rentSavingsRepo.save(savings);
    }

    return {
      message: 'Rent savings funded successfully',
      data: {
        currentSavings: savings.currentSavings,
        totalSavingsGoal: savings.totalSavingsGoal,
        progress: (savings.currentSavings / savings.totalSavingsGoal) * 100,
        status: savings.status,
        paymentResult,
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

  async getAvailableRentals(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const maxLimit = Math.min(limit, 100);

    const [properties, total] = await this.propertyRepo.findAndCount({
      where: {
        listingType: 'rent',
        approved: true,
      },
      order: { createdAt: 'DESC' },
      skip,
      take: maxLimit,
    });

    return {
      message: 'Available rental properties fetched successfully',
      data: {
        properties: properties.map((p) => ({
          id: p.id,
          title: p.title,
          type: p.type,
          address: p.address,
          description: p.description,
          bedrooms: p.bedrooms,
          bathrooms: p.bathrooms,
          rentalPrice: p.rentalPrice,
          serviceCharge: p.serviceCharge,
          amenities: p.amenities,
          images: p.images,
          numberOfMonths: p.numberOfMonths,
        })),
        pagination: {
          page,
          limit: maxLimit,
          total,
          totalPages: Math.ceil(total / maxLimit),
        },
      },
    };
  }

  async rentProperty(dto: RentPropertyDto, userId: string, userEmail: string) {
    const property = await this.propertyRepo.findOne({
      where: { id: dto.propertyId },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    if (property.listingType !== 'rent') {
      throw new BadRequestException('This property is not available for rent');
    }

    if (!property.approved) {
      throw new BadRequestException('Property not approved for rental');
    }

    if (!property.rentalPrice) {
      throw new BadRequestException('Rental price not set for this property');
    }

    const totalAmount = Number(property.rentalPrice) * dto.duration;

    const paymentOptionMap = {
      [PaymentMethod.WALLET]: PaymentOption.WALLET,
      [PaymentMethod.BANK]: PaymentOption.BANK,
      [PaymentMethod.CARD]: PaymentOption.CARD,
      [PaymentMethod.TRANSFER]: PaymentOption.TRANSFER,
    };

    const paymentRequest = {
      userId,
      userEmail,
      amount: totalAmount,
      paymentOption: paymentOptionMap[dto.paymentMethod],
      propertyId: dto.propertyId,
      investmentType: 'rent',
      paymentType: 'one_time',
      numberOfMonths: dto.duration,
      accountNumber: dto.accountNumber,
      bankCode: dto.bankCode,
      reason: `Rent payment for ${property.title}`,
      description: `${dto.duration} months rent for ${property.title}`,
    };

    const paymentResult = await this.paymentProcessor.processPayment(
      paymentRequest,
      { email: userEmail },
      property,
    );

    return {
      message: paymentResult.success
        ? 'Property rented successfully'
        : 'Payment initiated',
      data: {
        propertyId: property.id,
        propertyTitle: property.title,
        duration: dto.duration,
        totalAmount,
        paymentResult,
      },
    };
  }
}
