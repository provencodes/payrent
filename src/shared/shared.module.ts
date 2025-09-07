import { Module, forwardRef } from '@nestjs/common';
import { PaymentProcessorService } from './services/payment-processor.service';
import { PaymentModule } from '../modules/payment/payment.module';
import { WalletModule } from '../modules/wallet/wallet.module';

@Module({
  imports: [forwardRef(() => PaymentModule), forwardRef(() => WalletModule)],
  providers: [PaymentProcessorService],
  exports: [PaymentProcessorService],
})
export class SharedModule {}
