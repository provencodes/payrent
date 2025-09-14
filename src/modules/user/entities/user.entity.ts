import { Installment } from './../../payment/entities/installment.entity';
import * as bcrypt from 'bcrypt';
import { Exclude, instanceToPlain } from 'class-transformer';
import {
  Entity,
  Column,
  BeforeInsert,
  OneToMany,
  OneToOne,
  ManyToOne,
} from 'typeorm';
import { AbstractBaseEntity } from '../../../entities/base.entity';
import { Wallet } from '../../wallet/entities/wallet.entity';
import { BankAccount } from './bank-account.entity';
import { PaymentMethod } from './payment-method.entity';

export enum UserType {
  LANDLORD = 'landlord',
  TENANT = 'tenant',
  MANAGER = 'manager',
  ADMIN = 'admin',
}

class FileObject {
  url: string;
  public_id: string;
}

@Entity({ name: 'users' })
export class User extends AbstractBaseEntity {
  @Column({ unique: true, nullable: false, type: 'text' })
  email: string;

  @Column({ unique: false, nullable: true })
  name: string;

  @Column({ nullable: true, type: 'text' })
  status: string;

  @Column({ nullable: true, type: 'text' })
  phoneNumber: string;

  @Exclude({ toPlainOnly: true })
  @Column({ nullable: false })
  password: string;

  @Column({ nullable: true, type: 'text' })
  howYouFoundUs: string;

  @Column({ nullable: true, type: 'text' })
  referralCode: string;

  @ManyToOne(() => User, (user) => user.referrals, { nullable: true })
  referredBy?: User;

  @OneToMany(() => User, (user) => user.referredBy)
  referrals: User[];

  @Column({ nullable: true, type: 'text' })
  gender: string;

  @Column({ nullable: true, type: 'text' })
  streetAddress: string;

  @Column({ nullable: true, type: 'text' })
  city: string;

  @Column({ nullable: true, type: 'text' })
  state: string;

  @Column({ nullable: true, type: 'text' })
  country: string;

  @Column({ nullable: true, type: 'text' })
  idType: string;

  @Column({ nullable: true, type: 'text' })
  idNumber: string;

  @Column({ nullable: true, type: 'text' })
  bvn: string;

  @Column({ nullable: true, type: 'text' })
  idDocument: string;

  @Column('jsonb', { nullable: true })
  profilePicture: FileObject;

  @Column({ nullable: true, default: true })
  isActive: boolean;

  @Column({
    nullable: true,
    type: 'enum',
    enum: UserType,
  })
  userType: UserType;

  @OneToMany(() => Installment, (installment) => installment.user)
  installments: Installment[];

  @OneToOne(() => Wallet, (wallet) => wallet.user)
  wallet: Wallet;

  @OneToMany(() => BankAccount, (bankAccount) => bankAccount.user)
  bankAccounts: BankAccount[];

  @OneToMany(() => PaymentMethod, (paymentMethod) => paymentMethod.user)
  paymentMethods: PaymentMethod[];

  @Column({ nullable: true })
  otp: string;

  @Column({ nullable: true, default: false })
  isOtpVerified: boolean;

  @Column({ type: 'timestamp', nullable: true })
  otpCooldownExpires: Date;

  @Column({ nullable: true, default: false })
  isEmailVerified: boolean;

  @Column({ default: false, nullable: false })
  isAdmin: boolean;

  @Column({ nullable: true })
  pendingEmail: string;

  @Column({ nullable: true })
  emailVerificationToken: string;

  @Column({ type: 'timestamp', nullable: true })
  emailVerificationTokenExpires: Date;

  toJSON() {
    return instanceToPlain(this);
  }

  @BeforeInsert()
  async hashPassword() {
    if (this.password) this.password = await bcrypt.hash(this.password, 10);
  }

  async validatePassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
  }

  async setPassword(newPassword: string): Promise<void> {
    this.password = await bcrypt.hash(newPassword, 10);
  }
}
