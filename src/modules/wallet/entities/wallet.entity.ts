import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { WalletTransaction } from './wallet-transaction.entity';

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, (user) => user.wallet, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'bigint' })
  balanceKobo: string;

  @Column('text', { nullable: true })
  paystackCustomerCode: string;

  @Column('text', { nullable: true })
  paystackCustomerId: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => WalletTransaction, (transaction) => transaction.wallet)
  transactions: WalletTransaction[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Computed property to get balance in naira
  get balance(): number {
    return Number(this.balanceKobo) / 100;
  }
}
