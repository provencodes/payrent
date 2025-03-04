import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity()
export class AbstractBaseEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @CreateDateColumn({ nullable: true })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ nullable: true, default: null })
  updatedAt: Date;

  @ApiProperty()
  @DeleteDateColumn({ nullable: true, default: null })
  deletedAt: Date;
}
