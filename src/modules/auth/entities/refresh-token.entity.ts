import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { AbstractBaseEntity } from '../../../entities/base.entity';
import { User } from '../../user/entities/user.entity';

@Entity({ name: 'refresh_tokens' })
@Index(['userId', 'isRevoked'])
export class RefreshToken extends AbstractBaseEntity {
  @Column({ type: 'text', unique: true })
  token: string; // hashed token for security

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ default: false })
  isRevoked: boolean;

  @Column({ type: 'text', nullable: true })
  userAgent?: string; // Optional: track device/browser

  @Column({ type: 'text', nullable: true })
  ipAddress?: string; // Optional: track IP for security
}
