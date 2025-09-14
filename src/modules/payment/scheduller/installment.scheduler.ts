// scheduler/installment.scheduler.ts
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Installment } from '../entities/installment.entity';
import { PaymentService } from '../payment.service';
import UserService from '../../user/user.service';

@Injectable()
export class InstallmentScheduler {
  constructor(
    @InjectRepository(Installment)
    private readonly installmentRepo: Repository<Installment>,
    private readonly paymentService: PaymentService,
    private readonly userService: UserService,
  ) {}

  @Cron('0 0 * * *') // every day at midnight
  async checkDueInstallments() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = await this.installmentRepo.find({
      where: { nextPaymentDate: today, paid: false },
      relations: ['user', 'paymentMethod'],
    });

    for (const installment of due) {
      console.log(
        `Installment due for user: ${installment.user.id} on ${today.toDateString()}`,
      );

      if (installment.paymentMethod?.reusable) {
        await this.paymentService.autoDebitUser(installment);
      } else {
        console.log(`Reminder sent to user: ${installment.user.email}`);
      }
    }
  }
}
