import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Property } from './property.entity';
import { User } from '../../user/entities/user.entity';

@Entity('rentals')
@Index(['userId', 'status'])
@Index(['propertyId'])
export class Rental {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  propertyId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Property)
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @Column('decimal', { precision: 12, scale: 2 })
  rentAmount: number;

  @Column()
  paymentReference: string;

  @Column({ type: 'date' })
  rentStartDate: Date;

  @Column({ type: 'date' })
  rentEndDate: Date;

  @Column({ default: 'active' })
  status: string; // active, expired, terminated

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
