import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Repository } from 'typeorm';
import config from '../../../../config/auth.config';
import { User, UserType } from '../../user/entities/user.entity';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {
    super({
      clientID: config().google.clientID,
      clientSecret: config().google.clientSecret,
      callbackURL: config().google.callbackURL,
      scope: ['profile', 'email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile,
    done: VerifyCallback,
  ): Promise<unknown> {
    try {
      const { emails } = profile;

      if (!emails || emails.length === 0) {
        throw new Error('No email associated with this Google account');
      }

      const userData = {
        email: emails[0].value,
        name: profile.displayName || emails[0].value.split('@')[0],
        password: '',
        isActive: true,
        isEmailVerified: true,
        userType: UserType.TENANT,
      };

      let existingUser = await this.userRepository.findOne({
        where: { email: userData.email },
      });

      if (!existingUser) {
        existingUser = this.userRepository.create(userData);
        await this.userRepository.save(existingUser);
      }

      return done(null, existingUser);
    } catch (error) {
      return done(error, false);
    }
  }
}
