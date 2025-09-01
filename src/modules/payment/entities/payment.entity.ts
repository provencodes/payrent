// entities/payment.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity()
@Index(['userId', 'status'])
@Index(['propertyId'])
@Index(['reference'])
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  propertyId: string;

  @Column({ nullable: true })
  investmentType?: string;

  @Column({ nullable: true })
  shares?: number;

  @Column({ type: 'timestamp', nullable: true })
  paidAt?: Date;

  @Column()
  reference: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  customerCode?: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ default: 'pending' })
  status: string;

  @Column('json', { nullable: true })
  metadata?: any;

  @CreateDateColumn()
  createdAt: Date;
}
