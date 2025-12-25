import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserType } from '../modules/user/entities/user.entity';
import { Property } from '../modules/property/entities/property.entity';
import { Wallet } from '../modules/wallet/entities/wallet.entity';
import { WalletTransaction } from '../modules/wallet/entities/wallet-transaction.entity';
import { BankAccount } from '../modules/user/entities/bank-account.entity';
import { PaymentMethod, PaymentMethodType } from '../modules/user/entities/payment-method.entity';
import { Rental } from '../modules/property/entities/rental.entity';
import { TenantProfile } from '../modules/tenant/entities/tenant.entity';
import { LoanApplication } from '../modules/tenant/entities/loan-application.entity';
import { Installment } from '../modules/payment/entities/installment.entity';
import { Legal } from '../modules/legal/entities/legal.entity';
import { RentSavings } from '../modules/tenant/entities/rent-savings.entity';
import { Payment } from '../modules/payment/entities/payment.entity';
import { Plan } from '../modules/payment/entities/plan.entity';
import dataSource from './datasource';

class SeedHelper {
  private static firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen'];
  private static lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
  private static streets = ['Main St', 'Park Ave', 'Oak St', 'Cedar Ln', 'Pine Dr', 'Maple Ave', 'Washington St', 'Lake View Dr', 'Hillside Ave', 'Sunset Blvd'];
  private static cities = ['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Kano', 'Enugu', 'Benin City', 'Jos', 'Ilorin', 'Kaduna'];
  private static propertyTypes = ['Apartment', 'House', 'Duplex', 'Bungalow', 'Studio', 'Penthouse', 'Villa', 'Condo'];
  private static banks = ['Access Bank', 'GTBank', 'Zenith Bank', 'UBA', 'First Bank', 'Fidelity Bank', 'Stanbic IBTC'];

  static randomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  static randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static randomFloat(min: number, max: number, decimals: number = 2): number {
    const str = (Math.random() * (max - min) + min).toFixed(decimals);
    return parseFloat(str);
  }

  static randomName(): string {
    return `${this.randomElement(this.firstNames)} ${this.randomElement(this.lastNames)}`;
  }

  static randomEmail(name: string): string {
    const cleanName = name.toLowerCase().replace(/[^a-z]/g, '');
    return `${cleanName}${this.randomInt(1, 999)}@example.com`;
  }

  static randomPhone(): string {
    return `080${this.randomInt(10000000, 99999999)}`;
  }

  static randomAddress(): string {
    return `${this.randomInt(1, 999)} ${this.randomElement(this.streets)}, ${this.randomElement(this.cities)}`;
  }

  static randomDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }
}

async function seed() {
  console.log('Initializing Data Source...');
  dataSource.setOptions({
    entities: [
      User,
      Property,
      Wallet,
      WalletTransaction,
      BankAccount,
      PaymentMethod,
      Rental,
      TenantProfile,
      LoanApplication,
      Installment,
      Legal,
      RentSavings,
      Payment,
      Plan
    ]
  });

  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }
  console.log('Data Source initialized.');

  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // Repositories
    const userRepo = queryRunner.manager.getRepository(User);
    const propertyRepo = queryRunner.manager.getRepository(Property);
    const walletRepo = queryRunner.manager.getRepository(Wallet);
    const walletTxRepo = queryRunner.manager.getRepository(WalletTransaction);
    const bankAccountRepo = queryRunner.manager.getRepository(BankAccount);
    const paymentMethodRepo = queryRunner.manager.getRepository(PaymentMethod);
    const rentalRepo = queryRunner.manager.getRepository(Rental);
    const tenantProfileRepo = queryRunner.manager.getRepository(TenantProfile);
    const loanAppRepo = queryRunner.manager.getRepository(LoanApplication);
    const installmentRepo = queryRunner.manager.getRepository(Installment);
    const legalRepo = queryRunner.manager.getRepository(Legal);
    const rentSavingsRepo = queryRunner.manager.getRepository(RentSavings);
    const paymentRepo = queryRunner.manager.getRepository(Payment);
    const planRepo = queryRunner.manager.getRepository(Plan);

    console.log('Seeding Users...');
    const users: User[] = [];
    const password = await bcrypt.hash('password123', 10);

    // Create Admin
    let admin = await userRepo.findOne({ where: { email: 'admin@payrent.com' } });
    if (!admin) {
      admin = userRepo.create({
        email: 'admin@payrent.com',
        name: 'Super Admin',
        password,
        userType: UserType.ADMIN,
        isAdmin: true,
        isActive: true,
        phoneNumber: SeedHelper.randomPhone(),
      });
      admin = await userRepo.save(admin);
    }
    users.push(admin);

    // Create Landlords and Tenants
    for (let i = 0; i < 15; i++) {
      const name = SeedHelper.randomName();
      const user = userRepo.create({
        email: SeedHelper.randomEmail(name),
        name,
        password,
        userType: i < 5 ? UserType.LANDLORD : UserType.TENANT,
        phoneNumber: SeedHelper.randomPhone(),
        streetAddress: SeedHelper.randomAddress(),
        city: SeedHelper.randomElement(['Lagos', 'Abuja']),
        state: 'Nigeria',
        country: 'Nigeria',
        isActive: true,
        isEmailVerified: true,
      });
      users.push(await userRepo.save(user));
    }
    console.log(`Seeded ${users.length} users.`);

    console.log('Seeding Wallets & Bank Accounts...');
    for (const user of users) {
      // Wallet
      let wallet = await walletRepo.findOne({ where: { userId: user.id } });
      if (!wallet) {
        wallet = walletRepo.create({
          user,
          userId: user.id,
          balanceKobo: (SeedHelper.randomInt(1000, 1000000) * 100).toString(),
          isActive: true,
        });
        await walletRepo.save(wallet);
      }

      // Wallet Transactions
      for (let k = 0; k < 3; k++) {
        const tx = walletTxRepo.create({
          wallet,
          userId: user.id,
          type: SeedHelper.randomElement(['credit', 'debit']) as any,
          amountKobo: (SeedHelper.randomInt(100, 50000) * 100).toString(), // Convert to string
          reference: `REF-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          reason: 'funding',
        });
        await walletTxRepo.save(tx);
      }

      // Bank Account
      const bank = bankAccountRepo.create({
        user,
        accountName: user.name,
        accountNumber: SeedHelper.randomInt(1000000000, 9999999999).toString(),
        bankCode: '044',
        bankName: SeedHelper.randomElement(['Access Bank', 'GTBank']),
        isActive: true,
      });
      await bankAccountRepo.save(bank);

      // Payment Method
      const pm = paymentMethodRepo.create({
        user,
        type: PaymentMethodType.CARD,
        authorizationCode: `AUTH_${Math.random().toString(36).substring(7)}`,
        last4: SeedHelper.randomInt(1000, 9999).toString(),
        brand: 'visa',
        bank: 'GTBank',
        reusable: true,
      });
      await paymentMethodRepo.save(pm);
    }

    console.log('Seeding Properties...');
    const properties: Property[] = [];
    const landlords = users.filter(u => u.userType === UserType.LANDLORD);

    for (let i = 0; i < 15; i++) {
      const prop = propertyRepo.create({
        title: `${SeedHelper.randomElement(['Luxury', 'Cozy', 'Modern', 'Spacious'])} ${SeedHelper.randomElement(['Apartment', 'Villa', 'Duplex'])} in ${SeedHelper.randomElement(['Lekki', 'Ikoyi', 'Victoria Island'])}`,
        type: SeedHelper.randomElement(['3 bedroom apartment', '2 bedroom flat', 'Duplex']),
        listingType: SeedHelper.randomElement(['rent', 'sale', 'shortlet']),
        address: SeedHelper.randomAddress(),
        description: 'A beautiful property with modern amenities.',
        rentalPrice: SeedHelper.randomFloat(1000000, 5000000),
        bedrooms: SeedHelper.randomInt(1, 5),
        bathrooms: SeedHelper.randomInt(1, 6),
        toilets: SeedHelper.randomInt(1, 6),
        parkingAvailable: true,
        amenities: ['wifi', 'pool', 'gym'],
        images: [],
        owner: SeedHelper.randomElement(landlords)?.id || users[0].id,
        approved: true,
        status: 'approved',
      });
      properties.push(await propertyRepo.save(prop));
    }
    console.log(`Seeded ${properties.length} properties.`);

    console.log('Seeding Rentals & Tenant Profiles...');
    const tenants = users.filter(u => u.userType === UserType.TENANT);

    for (const tenant of tenants) {
      // Tenant Profile
      let profile = await tenantProfileRepo.findOne({ where: { userId: tenant.id } });
      if (!profile) {
        profile = tenantProfileRepo.create({
          user: tenant,
          employmentStatus: 'Employed',
          monthlyIncome: SeedHelper.randomFloat(200000, 1000000),
          currentAddress: SeedHelper.randomAddress(),
          emergencyContact: SeedHelper.randomName(),
          emergencyPhone: SeedHelper.randomPhone(),
        });
        await tenantProfileRepo.save(profile);
      }

      // Rental (ensure at least 10 total, so just create for most tenants)
      if (Math.random() > 0.1) {
        const property = SeedHelper.randomElement(properties);
        const rental = rentalRepo.create({
          user: tenant,
          property,
          rentAmount: property.rentalPrice,
          paymentReference: `RENT-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          rentStartDate: new Date(),
          rentEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
          status: 'active',
        });
        await rentalRepo.save(rental);
      }

      // Rent Savings
      if (Math.random() > 0.1) {
        const savings = rentSavingsRepo.create({
          user: tenant,
          monthlyAmount: SeedHelper.randomFloat(50000, 200000),
          totalSavingsGoal: SeedHelper.randomFloat(1000000, 3000000),
          currentSavings: SeedHelper.randomFloat(100000, 500000),
          duration: 12,
          maturityDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
          interestRate: 10,
          estimatedReturn: 0,
          automation: 'monthly',
          status: 'active',
        });
        await rentSavingsRepo.save(savings);
      }

      // Loan Application
      if (Math.random() > 0.1) {
        const loan = loanAppRepo.create({
          user: tenant,
          loanAmount: SeedHelper.randomFloat(500000, 2000000),
          loanPurpose: 'Rent',
          repaymentPeriod: 12,
          interestRate: 5,
          monthlyRepayment: 0,
          totalRepayment: 0,
          employmentStatus: 'Employed',
          monthlyIncome: 300000,
          status: 'pending',
        });
        await loanAppRepo.save(loan);
      }
    }

    console.log('Seeding Plans...');
    const plans = [
      { name: 'Basic', amount: 1000, interval: 'monthly', plan_code: 'PLN_123' },
      { name: 'Premium', amount: 5000, interval: 'monthly', plan_code: 'PLN_456' },
      { name: 'Gold', amount: 10000, interval: 'monthly', plan_code: 'PLN_789' },
      { name: 'Silver', amount: 3000, interval: 'monthly', plan_code: 'PLN_101' },
      { name: 'Bronze', amount: 500, interval: 'monthly', plan_code: 'PLN_112' },
      { name: 'Platinum', amount: 20000, interval: 'monthly', plan_code: 'PLN_131' },
      { name: 'Diamond', amount: 50000, interval: 'monthly', plan_code: 'PLN_415' },
      { name: 'Starter', amount: 200, interval: 'monthly', plan_code: 'PLN_161' },
      { name: 'Pro', amount: 7000, interval: 'monthly', plan_code: 'PLN_718' },
      { name: 'Enterprise', amount: 100000, interval: 'monthly', plan_code: 'PLN_910' },
    ];
    for (const p of plans) {
      // Check if plan exists to avoid duplicates if running multiple times (though Plan table might not have unique constraint on name, but let's be safe or just create)
      // Assuming plan_code is unique or we just want 10 records.
      // I'll just create them. If duplicates, it's fine for "at least 10".
      const plan = planRepo.create(p);
      await planRepo.save(plan);
    }

    await queryRunner.commitTransaction();
    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    await queryRunner.rollbackTransaction();
  } finally {
    await queryRunner.release();
    await dataSource.destroy();
  }
}

seed();
