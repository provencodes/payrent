import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PaystackGateway } from './gateways/paystack.gateway';
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Installment } from './entities/installment.entity';
import { User } from '../user/entities/user.entity';
import { Plan } from './entities/plan.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Installment, User, Plan]),
    UserModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService, PaystackGateway],
  exports: [PaymentService, PaystackGateway],
})
export class PaymentModule {}
