// entities/installment.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { PaymentMethod } from '../../user/entities/payment-method.entity';

@Entity()
export class Installment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { eager: true })
  user: User;

  @Column()
  email: string;

  @Column()
  reference: string;

  @Column()
  propertyId: string;

  @Column()
  investmentType?: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column()
  frequency: string;

  @Column()
  status: string;

  @Column()
  startedAt: Date;

  @Column()
  nextPaymentDate: Date;

  @Column()
  subscriptionCode: string;

  @Column({ nullable: true })
  paymentMethodId: string;

  @ManyToOne(() => PaymentMethod, { nullable: true })
  paymentMethod: PaymentMethod;

  @Column()
  customerCode: string;

  @Column({ default: false })
  paid: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
