import { Module } from '@nestjs/common';
import UserService from './user.service';
import { UsersController } from './user.controller';
import { FinancialController } from './financial.controller';
import { UserFinancialService } from './user-financial.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Payment } from '../payment/entities/payment.entity';
import { WalletTransaction } from '../wallet/entities/wallet-transaction.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { Rental } from '../property/entities/rental.entity';
import { RentSavings } from '../tenant/entities/rent-savings.entity';
import { LoanApplication } from '../tenant/entities/loan-application.entity';

@Module({
  controllers: [UsersController, FinancialController],
  providers: [UserService, UserFinancialService],
  imports: [
    TypeOrmModule.forFeature([
      User,
      Payment,
      WalletTransaction,
      Wallet,
      Rental,
      RentSavings,
      LoanApplication,
    ]),
  ],
  exports: [UserService, UserFinancialService],
})
export class UserModule {}
