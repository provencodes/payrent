import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  jwtSecret: process.env.JWT_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtExpiry: process.env.JWT_EXPIRY_TIMEFRAME,
  jwtRefreshExpiry: process.env.JWT_REFRESH_EXPIRY_TIMEFRAME,
  base_url: process.env.BASE_URL,
  google: {
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    clientID: process.env.GOOGLE_CLIENT_ID,
    callbackURL: process.env.GOOGLE_REDIRECT_URI,
  },
  facebook: {
    appID: process.env.FACEBOOK_APP_ID,
    appSecret: process.env.FACEBOOK_APP_SECRET,
  },
}));
