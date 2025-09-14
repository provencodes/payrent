import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AbstractBaseEntity } from '../../../entities/base.entity';
import { User } from './user.entity';

@Entity({ name: 'bank_accounts' })
export class BankAccount extends AbstractBaseEntity {
  @Column({ type: 'text' })
  accountName: string;

  @Column({ type: 'text' })
  accountNumber: string;

  @Column({ type: 'text' })
  bankCode: string;

  @Column({ type: 'text' })
  bankName: string;

  @Column({ default: false })
  autoCharge: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'text' })
  userId: string;

  @ManyToOne(() => User, (user) => user.bankAccounts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}