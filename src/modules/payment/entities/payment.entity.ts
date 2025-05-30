// entities/payment.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  propertyId: string;

  @Column()
  investmentType?: string;

  @Column()
  shares?: number;

  @Column({ type: 'date', nullable: true })
  paidAt?: Date;

  @Column()
  reference: string;

  @Column()
  email: string;

  @Column()
  customerCode: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ default: 'pending' })
  status: string;

  @Column('json', { nullable: true })
  metadata?: any;

  @CreateDateColumn()
  createdAt: Date;
}
