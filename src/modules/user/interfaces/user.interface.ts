import { UserType } from '../entities/user.entity';
import { Installment } from '../../payment/entities/installment.entity';
import { Wallet } from '../../wallet/entities/wallet.entity';
import { BankAccount } from '../entities/bank-account.entity';

interface FileObject {
  url: string;
  public_id: string;
}

export interface UserInterface {
  id?: string;
  email?: string;
  name?: string;
  status?: string;
  phoneNumber?: string;
  password?: string;
  howYouFoundUs?: string;
  referralCode?: string;
  gender?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  country?: string;
  idType?: string;
  idNumber?: string;
  bvn?: string;
  idDocument?: string;

  profilePicture?: FileObject;
  isActive?: boolean;
  userType?: UserType;
  paystackAuthCode?: string;

  installments?: Installment[];
  wallet?: Wallet;
  bankAccounts?: BankAccount[];
  otp?: string;
  isOtpVerified?: boolean;
  otpCooldownExpires?: Date;
  isEmailVerified?: boolean;
  isAdmin?: boolean;
  pendingEmail?: string;
  emailVerificationToken?: string;
  emailVerificationTokenExpires?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  hashPassword?: () => void;
}
