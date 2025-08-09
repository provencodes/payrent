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

/*
select property
renovationType
timeline
image
paymentPlan enum[one-time, reccuring]
*/

@Entity('properties')
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  type: string; // e.g. "3 bedroom apartment"

  @Column()
  listingType: string; // e.g. "rent", "sale", "shares", "flip", "off-plan", co-vest, "joint-venture"

  @Column({ nullable: true })
  category: string; // e.g apartment, home, office, land, shortlet, shop, hotel etc.

  @Column()
  address: string;

  @Column('text')
  description: string;

  @Column('jsonb', { nullable: true })
  imageDoc: FileObject[];

  @Column({ nullable: true })
  bedrooms: number;

  @Column({ nullable: true })
  bathrooms: number;

  @Column({ nullable: true })
  toilets: number;

  @Column({ nullable: true })
  propertySize: string;

  @Column({ nullable: true })
  floorLevels: number;

  @Column({ default: false })
  parkingAvailable: boolean;

  @Column('simple-array', { nullable: true })
  amenities: string[]; // e.g. [wifi, gym]

  @Column('decimal', { nullable: true, precision: 12, scale: 2 })
  rentalPrice: number; // per year

  @Column({ nullable: false, default: false })
  rented: boolean; // if true then it is not vacant.

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  serviceCharge: number;

  @Column({ nullable: true, default: false })
  securityDepositRequired: boolean;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  advanceRentPayment: number;

  @Column({ nullable: true })
  numberOfMonths: number;

  @Column('jsonb', { nullable: true })
  rentalAgreementDoc: FileObject[];

  @Column('text', { nullable: true })
  latePaymentPolicy: string;

  @Column({ default: false })
  agreeToTerms: boolean;

  @Column('text', { nullable: true })
  returnDuration: string;

  @Column('text', { nullable: true })
  percentageReturns: string;

  @Column('jsonb', { nullable: false, default: () => "'[]'" })
  images: FileObject[];

  @Column('decimal', { nullable: true })
  interestRate: number;

  @Column('text', { nullable: true })
  owner: string;

  @Column({ nullable: true })
  numberOfUnit: number;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  pricePerUnit: number;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  pricePerShare: number;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  price: number;

  @Column('text', { nullable: true })
  status: string; // ongoing, pending, cancelled, approved, completed, rejected, under-review

  @Column({ nullable: true })
  resaleValue: number;

  @Column('decimal', { nullable: true })
  potentialRoi: number;

  @Column('text', { nullable: true })
  renovationDetails: string;

  @Column('text', { nullable: true })
  constructionStatus: string;

  @Column('text', { nullable: true })
  estimatedCompletion: string;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  minimumInvestment: number;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  fullInvestmentPrice: number;

  @Column('decimal', { nullable: true })
  investmentDuration: number;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  investmentGoal: number;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  amountRaised: number;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  estimatedRentalIncomePerMonth: number;

  @Column('text', { nullable: true })
  projectedProfitShareIfSold: string;

  @Column('text', { nullable: true })
  renovationType: string;

  @Column('text', { nullable: true })
  paymentPlan: string;

  @Column('text', { nullable: true })
  estimatedTimeline: string;

  @Column('text', { nullable: true })
  reasonForDecline: string;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  renovationCost: number;

  @Column({ nullable: false, default: false })
  approved: boolean;

  @Column({ nullable: true })
  listedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
