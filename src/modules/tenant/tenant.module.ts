import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantService } from './tenant.service';
import { TenantController } from './tenant.controller';
import { RentSavings } from './entities/rent-savings.entity';
import { LoanApplication } from './entities/loan-application.entity';
import { Rental } from '../property/entities/rental.entity';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RentSavings, LoanApplication, Rental]),
    WalletModule,
  ],
  controllers: [TenantController],
  providers: [TenantService],
  exports: [TenantService],
})
export class TenantModule {}
