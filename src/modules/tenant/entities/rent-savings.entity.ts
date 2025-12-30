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

@Entity('rent_savings')
export class RentSavings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('decimal', { precision: 12, scale: 2 })
  monthlyAmount: number;

  @Column('decimal', { precision: 12, scale: 2 })
  totalSavingsGoal: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  currentSavings: number;

  @Column()
  duration: number; // in months

  @Column({ type: 'date' })
  maturityDate: Date;

  @Column('decimal', { precision: 5, scale: 2 })
  interestRate: number;

  @Column('decimal', { precision: 12, scale: 2 })
  estimatedReturn: number;

  @Column()
  automation: string; // e.g., "Month end"

  @Column({ default: 'active' })
  status: string; // active, completed, cancelled

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
