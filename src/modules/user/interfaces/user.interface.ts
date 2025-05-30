interface UserInterface {
  id: string;
  email: string;
  name: string;
  password: string;
  status: string;
  phoneNumber: string;
  howYouFoundUs: string;
  referralCode: string;
  gender: string;
  idType: string;
  idNumber: string;
  bvn: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  streetAddress: string;
  city: string;
  state: string;
  country: string;
  idDocument: string;
  userType: string;
  otp: string;
  isActive: boolean;
  isOtpVerified: boolean;
  isEmailVerified: boolean;
  paystackAuthCode: string;
  autoCharge: boolean;
  createdAt: Date;
  updatedAt: Date;
  hashPassword?: () => void;
}

export default UserInterface;
