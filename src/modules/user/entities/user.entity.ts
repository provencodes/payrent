import * as bcrypt from 'bcrypt';
import { Exclude, instanceToPlain } from 'class-transformer';
import { Entity, Column, BeforeInsert } from 'typeorm';
import { AbstractBaseEntity } from '../../../entities/base.entity';

@Entity({ name: 'users' })
export class User extends AbstractBaseEntity {
  @Column({ unique: true, nullable: false, type: 'text' })
  email: string;

  @Column({ nullable: true, type: 'text' })
  firstName: string;

  @Column({ nullable: true, type: 'text' })
  lastName: string;

  @Column({ unique: false, nullable: true })
  username: string;

  @Column({ nullable: true, type: 'text' })
  status: string;

  @Column({ nullable: true, type: 'text' })
  phone: string;

  @Exclude({ toPlainOnly: true })
  @Column({ nullable: false })
  password: string;

  @Column({ nullable: true, default: true })
  is_active: boolean;

  @Column({
    nullable: true,
    enum: ['tenant', 'landlord', 'investor', 'consultant'],
  })
  userType: string;

  @Column({ nullable: true })
  otp: string;

  @Column({ nullable: true, default: false })
  isOtp_verified: boolean;

  @Column({ type: 'timestamp', nullable: true })
  otpCooldownExpires: Date;

  @Column({ nullable: true, default: false })
  isEmail_verified: boolean;

  @Column({ default: false, nullable: false })
  is_admin: boolean;

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
