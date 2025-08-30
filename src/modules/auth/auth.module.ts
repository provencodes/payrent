import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import appConfig from '../../../config/auth.config';
import { User } from '../user/entities/user.entity';
import UserService from '../user/user.service';
import RegistrationController from './auth.controller';
import AuthenticationService from './auth.service';
import { GoogleAuthService } from './google-auth.service';
import { FacebookStrategy } from './strategies/facebook.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { EmailService } from '../mailer/mailer.service';
import { WalletModule } from '../wallet/wallet.module';
import { WalletTransaction } from '../wallet/entities/wallet-transaction.entity';

@Module({
  controllers: [RegistrationController],
  providers: [
    AuthenticationService,
    Repository,
    UserService,
    GoogleStrategy,
    GoogleAuthService,
    FacebookStrategy,
    EmailService,
  ],
  imports: [
    TypeOrmModule.forFeature([User, WalletTransaction]),
    PassportModule,
    WalletModule,
    JwtModule.register({
      global: true,
      secret: appConfig().jwtSecret,
      signOptions: { expiresIn: `${appConfig().jwtExpiry}s` },
    }),
  ],
  exports: [],
})
export class AuthModule {}
