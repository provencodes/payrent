// import * as bcrypt from 'bcryptjs';
import {
  Entity,
  Column,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { AbstractBaseEntity } from '../../../entities/base.entity';

@Entity({ name: 'users' })
export class User extends AbstractBaseEntity {
  @Column({ nullable: true, type: 'text' })
  firstName: string;

  @Column({ nullable: true, type: 'text' })
  lastName: string;

  @Column({ nullable: false, type: 'text' })
  name: string;

  @Column({ nullable: true, type: 'text' })
  status: string;

  @Column({ nullable: true, type: 'text' })
  phone: string;

  @Column({ unique: true, nullable: false, type: 'text' })
  email: string;

  @Column({ nullable: false, type: 'text' })
  password: string;

  @Column({ nullable: true, default: false })
  isVerified: boolean;

  @Column({ nullable: true, default: true })
  isActive: boolean;

  @Column({ nullable: true, enum: ['tenant', 'landlord', 'investor', 'consultant'] })
  userType: string;

  // @BeforeInsert()
  // @BeforeUpdate()
  // async hashPassword() {
  //   this.password = await bcrypt.hash(this.password, 10);
  // }

}
