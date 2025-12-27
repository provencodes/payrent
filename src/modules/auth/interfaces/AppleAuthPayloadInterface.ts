/**
 * Interface for Apple ID token payload after verification
 */
export default interface AppleAuthPayload {
  /** Subject - unique user identifier from Apple */
  sub: string;

  /** User's email (may be relay if hidden) */
  email?: string;

  /** Whether the email is verified */
  email_verified?: boolean | 'true' | 'false';

  /** Whether the email is a private relay address */
  is_private_email?: boolean | 'true' | 'false';

  /** Real user status: 0=unsupported, 1=unknown, 2=likely real */
  real_user_status?: number;

  /** Token issuer */
  iss?: string;

  /** Token audience */
  aud?: string;

  /** Token expiration time */
  exp?: number;

  /** Token issued at time */
  iat?: number;

  /** Nonce (if provided during sign in) */
  nonce?: string;

  /** Nonce supported flag */
  nonce_supported?: boolean;

  /** Auth time */
  auth_time?: number;
}
