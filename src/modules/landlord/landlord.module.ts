import { Module } from '@nestjs/common';
import { LandlordService } from './landlord.service';
import { LandlordController } from './landlord.controller';
import { PaymentModule } from '../payment/payment.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Property } from '../property/entities/property.entity';
import { UserModule } from '../user/user.module';
import { PaystackGateway } from '../payment/gateways/paystack.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Property]), PaymentModule, UserModule],
  controllers: [LandlordController],
  providers: [LandlordService, PaystackGateway],
})
export class LandlordModule {}
