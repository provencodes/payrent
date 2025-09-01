import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('loan_applications')
export class LoanApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('decimal', { precision: 12, scale: 2 })
  loanAmount: number;

  @Column()
  loanPurpose: string; // rent, deposit, etc.

  @Column()
  repaymentPeriod: number; // in months

  @Column('decimal', { precision: 5, scale: 2 })
  interestRate: number;

  @Column('decimal', { precision: 12, scale: 2 })
  monthlyRepayment: number;

  @Column('decimal', { precision: 12, scale: 2 })
  totalRepayment: number;

  @Column()
  employmentStatus: string;

  @Column('decimal', { precision: 12, scale: 2 })
  monthlyIncome: number;

  @Column({ nullable: true })
  guarantorName: string;

  @Column({ nullable: true })
  guarantorPhone: string;

  @Column({ default: 'pending' })
  status: string; // pending, approved, rejected, disbursed, completed

  @Column({ nullable: true })
  rejectionReason: string;

  @Column({ type: 'date', nullable: true })
  approvedAt: Date;

  @Column({ type: 'date', nullable: true })
  disbursedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}