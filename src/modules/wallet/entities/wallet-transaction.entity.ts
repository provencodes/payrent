import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { Wallet } from './wallet.entity';

export type WalletTxType = 'credit' | 'debit';
export type WalletTxReason =
  | 'funding'
  | 'spend'
  | 'withdrawal'
  | 'reversal'
  | 'referral_bonus';

@Entity('wallet_transactions')
@Index(['userId', 'type'])
@Index(['walletId'])
export class WalletTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  walletId: string;

  @ManyToOne(() => Wallet, (wallet) => wallet.transactions, { eager: true })
  wallet: Wallet;

  @Column()
  userId: string;

  @Column()
  type: WalletTxType;

  @Column({ type: 'bigint' })
  amountKobo: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', nullable: true, unique: true })
  reference?: string;

  @Column({ nullable: true })
  reason?: WalletTxReason;

  @Column({ type: 'jsonb', nullable: true })
  meta: any;

  @CreateDateColumn()
  createdAt: Date;
}
