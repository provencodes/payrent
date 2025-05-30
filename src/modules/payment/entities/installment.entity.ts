// entities/installment.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

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

  @Column()
  authorizationCode: string;

  @Column()
  customerCode: string;

  @Column({ default: false })
  paid: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
