export class FileObject {
  url: string;
  public_id: string;
}

export enum PaymentType {
  ONE_TIME = 'one_time',
  INSTALLMENT = 'installment',
}

export enum PropertyStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
}

export enum ListingType {
  RENT = 'rent',
  SALE = 'sale',
  SHARES = 'shares',
  JOINT_VENTURE = 'joint-venture',
  FLIP = 'flip',
  CO_VEST = 'co-vest',
  OFF_PLAN = 'off-plan',
}

export class CreatePropertyDto {
  title: string;
  type: string;
  listingType: string;
  address: string;
  description: string;

  // Optional fields based on listing type
  category?: string;
  imageDoc?: FileObject[];
  bedrooms?: number;
  bathrooms?: number;
  toilets?: number;
  propertySize?: string;
  floorLevels?: number;
  parkingAvailable?: boolean;
  amenities?: string[];

  // Rental fields
  rentalPrice?: number;
  serviceCharge?: number;
  securityDepositRequired?: boolean;
  advanceRentPayment?: number;
  numberOfMonths?: number;
  rentalAgreementDoc?: FileObject[];
  latePaymentPolicy?: string;
  agreeToTerms?: boolean;

  // Investment fields
  returnDuration?: string;
  percentageReturns?: string;
  images?: FileObject[];
  interestRate?: number;
  owner?: string;

  // Sale/Units fields
  numberOfUnit?: number;
  pricePerUnit?: number;
  pricePerShare?: number;
  price?: number;
  status?: string;

  // Flip/Investment fields
  resaleValue?: number;
  potentialRoi?: number;
  renovationDetails?: string;
  constructionStatus?: string;
  estimatedCompletion?: string;

  // Co-vest fields
  minimumInvestment?: number;
  fullInvestmentPrice?: number;
  investmentDuration?: number;
  investmentGoal?: number;
  amountRaised?: number;
  estimatedRentalIncomePerMonth?: number;
  projectedProfitShareIfSold?: string;

  // Joint venture fields
  renovationType?: string;
  paymentType?: string;
  paymentPlan?: string;
  estimatedTimeline?: string;
  reasonForDecline?: string;
  renovationCost?: number;
  minimumDepositForInstallment?: number;

  // Fee fields
  legalAndAdministrativeFee?: number;
  agentCommission?: number;
  negotiable?: boolean;
  approved?: boolean;
}