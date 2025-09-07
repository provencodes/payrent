import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantService } from './tenant.service';
import { TenantController } from './tenant.controller';
import { RentSavings } from './entities/rent-savings.entity';
import { LoanApplication } from './entities/loan-application.entity';
import { Rental } from '../property/entities/rental.entity';
import { Property } from '../property/entities/property.entity';
import { SharedModule } from '../../shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RentSavings, LoanApplication, Rental, Property]),
    forwardRef(() => SharedModule),
  ],
  controllers: [TenantController],
  providers: [TenantService],
  exports: [TenantService],
})
export class TenantModule {}
