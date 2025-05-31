import { HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';
import config from '../../../../config/auth.config';
import { CustomHttpException } from '../../../helpers/custom-http-filter';
import * as SYS_MSG from '../../../helpers/systemMessages';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor() {
    super({
      clientID: config().facebook.appID,
      clientSecret: config().facebook.appSecret,
      callbackURL: `${process.env.HOST_URL}/api/v1/auth/facebook/redirect`,
      scope: ['email', 'public_profile'],
      profileFields: ['name', 'emails'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done,
  ) {
    if (!profile.emails) {
      throw new CustomHttpException(
        SYS_MSG.FACEBOOK_EMAIL_NOT_FOUND,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    const generateUserName = ({ givenName, familyName }) =>
      `${givenName}${familyName}${Math.floor(Math.random() * 1000)}`;

    const username = profile.username ?? generateUserName(profile.name);

    const user = {
      email: profile.emails[0].value,
      first_name: profile.name.givenName,
      last_name: profile.name.familyName,
      username,
    };

    const payload = { user, accessToken };
    done(null, payload);
  }
}
