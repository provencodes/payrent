export enum PaymentType {
  ONE_TIME = 'one_time',
  INSTALLMENT = 'installment',
}

export enum PropertyStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum ListingType {
  RENT = 'rent',
  SALE = 'sale',
  SHARES = 'shares',
  JOINT_VENTURE = 'joint-venture',
}

export class CreatePropertyDto {
  title: string;
  type: string;
  listingType: string;
  address: string;
  description: string;
}