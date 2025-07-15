export const USER_ALREADY_IN_ROOM = 'User already in room';
export const USER_CREATED_SUCCESSFULLY = 'User Created Successfully';
export const USER_CREATED = 'User Created Successfully';
export const USER_NOT_IN_ROOM = 'User not in room';
export const FAILED_TO_CREATE_USER =
  'Error Occurred while creating user, kindly try again';
export const ERROR_OCCURRED = 'Error Occurred Performing this request';
export const USER_DATA_RETRIEVED = 'User data retrieved successfully';
export const USER_ACCOUNT_EXIST =
  'Account with the specified email or username exists';
export const USER_ACCOUNT_DOES_NOT_EXIST =
  "Account with the specified email or username doesn't exist";
export const UNAUTHENTICATED_MESSAGE =
  'User is currently unauthorized, kindly authenticate to continue';
export const FORBIDDEN_MESSAGE = 'You are not allowed to access this resource';
export const TEAM_NAME_EXISTS = (teamName: string) =>
  `Room with team name "${teamName}" already exists.`;
export const IED_SUCCESSFULLY = '2FA verified and enabled';
export const INCORRECT_TOTP_CODE = 'Incorrect totp code';
export const USER_NOT_ENABLED_2FA =
  'Two factor Auth not initiated. Visit api/auth/2fa/enable';
export const USER_NOT_FOUND = 'User not found!';
export const INVALID_PASSWORD = 'Invalid password';
export const USER_ID_REQUIRED = 'Invalid user id, valid user id required';
export const INVALID_ROOM_IDENTIFIER = 'Invalid room identifier';
export const TWO_FA_INITIATED = '2FA setup initiated';
export const TWO_FA_ENABLED = '2FA is already enabled';
export const BAD_REQUEST = 'Bad Request';
export const LANGUAGE_CREATED_SUCCESSFULLY = 'Language Created Successfully';
export const OK = 'Success';
export const LANGUAGE_ALREADY_EXISTS = 'Language already exits';
export const FETCH_LANGUAGE_FAILURE = 'Failed to fetch language';
export const UNAUTHORIZED_TOKEN = 'Invalid token or email';
export const TIMEZONE_CREATED_SUCCESSFULLY = 'Timezone created Successfully';
export const FETCH_TIMEZONE_FAILURE =
  'Error Occurred while creating Timezone, kindly try again';
export const SUCCESS = 'Timezone fetched successfully';
export const TIMEZONE_ALREADY_EXISTS = 'Timezone already exists';
export const INVALID_CREDENTIALS = 'Invalid email or password';
export const LOGIN_SUCCESSFUL = 'Login successful';
export const LOGIN_ERROR = 'An error occurred during login';
export const EMAIL_SENT = 'Email sent successfully';
export const ENABLE_2FA_ERROR = 'Error occurred enabling 2fa';
export const SIGN_IN_OTP_SENT = 'Sign-in token sent to email';
export const WRONG_PARAMETERS =
  'Permission_list must be an object with keys from PermissionCategory and boolean values';
export const INVALID_FILE_TYPE =
  'Invalid file type. Only JPG and PNG are allowed';
export const FILE_SIZE_EXCEEDED = 'File size exceeds 2MB limit';
export const FILE_HAS_BEEN_UPLOADED = 'This file has already been uploaded';
export const AVATAR_NOT_FOUND = 'Avatar not found';
export const INVALID_ADMIN_SECRET = 'Invalid access secret';
export const ADMIN_CREATED = 'Admin Created Successfully';
export const SERVER_ERROR = 'Sorry a server error occurred';
export const FORBIDDEN_ACTION =
  "You don't have the permission to perform this action";
export const FACEBOOK_EMAIL_NOT_FOUND =
  'Email could not be found on Facebook Account. Please sign up with email and password';
export const ABOUT_ID_NOT_FOUND = 'About with this ID not found';
export const INVALID_ID = 'Input Valid Id';
export const BLOG_WITH_SLUG_NOT_FOUND =
  'Blog with the specified slug not found';
export const BILLING_OR_PLAN_MISSING = 'Plan name or billing option is missing';
export const PLAN_NOT_FOUND = 'Subscription Plan Not Found';
export const PAYMENT_INITIATED = 'Payment initiated successfully';
export const STRIPE_PAYMENT_ERROR = 'Error Initiating Stripe Payment';
export const NO_STRIPE_SESSION_ID = 'No stripe session id provided';
export const USER_HAS_NO_ACTIVE_PLAN = 'User does not have an active plan.';
export const CUSTOMER_PORTAL_CREATED =
  'Customer Portal Session Created Successfully';
export const STRIPE_WEBHOOK_SIGNATURE_FAILED =
  'Webhook signature verification failed';
export const WEBHOOK_RECEIVED = 'Webhook received';
export const SUBSCRIPTION_PLAN_RETRIEVED =
  'Subscription Retrieved Successfully';
export const CURRENT_PASSWORD_INCORRECT = 'Current password is incorrect';
export const USERNAME_TAKEN = 'Username already taken';
export const NOT_MATCH = 'Card not match';
export const INQUIRY_SENT_SUCCESSFULLY = 'Inquiry sent successfully';
export const INQUIRY_NOT_SENT = 'Inquiry not sent';
export const FAQ_FETCHED_SUCCESSFULLY = 'Fetched Successfully';
export const UNAUTHORIZED_USER = 'Unauthorized User';
export const DELETED_SUCCESSFULLY = 'Deleted Successfully';
export const FAILED_TO_SEND_EMAIL = 'Failed to send verification email';
export const OTP_SENT_SUCCESSFULLY = 'OTP sent successfully.';
export const LINK_EXPIRED = 'The game link has expired';
export const TOO_MANY_OTP_REQUESTS =
  'Please wait before requesting another OTP';
export const BLOG_NOT_FOUND = "blog with specified id doesn't exist";
export const PASSWORD_RESET_SUCCESSFUL = 'Password Reset successful';
export const INVALID_TOKEN = 'Invalid token';
export const EXPIRED_TOKEN = 'Token expired';
export const EMAIL_VERIFICATION_SUCCESSFUL = 'Email verification successful';
