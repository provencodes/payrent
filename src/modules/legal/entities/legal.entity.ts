import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

class FileObject {
  url: string;
  public_id: string;
}

@Entity('legals')
export class Legal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  propertyId: string;

  @Column()
  propertyTitle: string;

  @Column({ type: 'jsonb', nullable: true })
  supportingDocument: FileObject[];

  @Column()
  preferredLegalAction: string;

  @Column()
  type: string;

  @Column()
  description: string;

  @Column()
  caseStatus: string;

  @Column()
  legalPackageType?: string;

  @Column({ nullable: false, default: false })
  approved: boolean;

  @Column({ nullable: false, default: false })
  isPaid: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
