
interface UserInterface {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  status: string;
  phone: string;
  userType: string;
  otp: string;
  isActive: boolean;
  isOtp_verified: boolean;
  isEmail_verified: boolean
  createdAt: Date;
  updatedAt: Date;
  hashPassword?: () => void;
}

export default UserInterface;
