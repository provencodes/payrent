import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AbstractBaseEntity } from '../../../entities/base.entity';
import { User } from './user.entity';

export enum PaymentMethodType {
  CARD = 'card',
  BANK = 'bank',
}

@Entity({ name: 'payment_methods' })
export class PaymentMethod extends AbstractBaseEntity {
  @Column({ type: 'text' })
  userId: string;

  @Column({
    type: 'enum',
    enum: PaymentMethodType,
    default: PaymentMethodType.CARD,
  })
  type: PaymentMethodType;

  @Column({ type: 'text' })
  authorizationCode: string;

  @Column({ type: 'text', nullable: true })
  last4: string;

  @Column({ type: 'text', nullable: true })
  cardType: string;

  @Column({ type: 'text', nullable: true })
  bank: string;

  @Column({ type: 'text', nullable: true })
  brand: string;

  @Column({ type: 'text', nullable: true })
  expMonth: string;

  @Column({ type: 'text', nullable: true })
  expYear: string;

  @Column({ default: true })
  reusable: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isDefault: boolean;

  @ManyToOne(() => User, (user) => user.paymentMethods, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}