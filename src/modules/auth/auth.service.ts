import { ForbiddenException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { TokenPayload } from 'google-auth-library';
import authConfig from '../../../config/auth.config';
import { CustomHttpException } from '../../helpers/custom-http-filter';
import {
  INVALID_CREDENTIALS,
  LOGIN_SUCCESSFUL,
} from '../../helpers/systemMessages';
import UserService from '../user/user.service';
import { CreateUserDTO } from './dto/create-user.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { LoginDto } from './dto/login.dto';
import { SendMailDto } from '../mailer/dto/send-mail.dto';
import { EmailService } from '../mailer/mailer.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RequestUser } from './interfaces/request.userdto';
import { randomInt } from 'crypto';
import { UserInterface } from '../user/interfaces/user.interface';
import FacebookAuthPayload from './interfaces/FacebookAuthPayloadInterface';
import { addMinutes, addDays, isBefore } from 'date-fns';
import { User } from '../user/entities/user.entity';
import UserIdentifierOptionsType from '../user/options/UserIdentifierOptions';
import UpdateUserRecordOption from '../user/options/UpdateUserRecordOption';
import * as SYS_MSG from '../../helpers/systemMessages';
import { generateUsername } from 'unique-username-generator';
import UserResponseDTO from '../user/dto/user-response.dto';
import { WalletService } from '../wallet/wallet.service';
import { GoogleAuthPayloadDto } from './dto/google-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { WalletTransaction } from '../wallet/entities/wallet-transaction.entity';
import { ConfigService } from '@nestjs/config';
import { RefreshToken } from './entities/refresh-token.entity';
import * as appleSignIn from 'apple-signin-auth';
import { AppleAuthPayloadDto } from './dto/apple-auth.dto';

@Injectable()
export default class AuthenticationService {
  private readonly REFRESH_TOKEN_EXPIRY_DAYS = 7;

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private readonly walletService: WalletService,
    private readonly configService: ConfigService,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(WalletTransaction)
    private walletTransactionRepository: Repository<WalletTransaction>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async createNewUser(createUserDto: CreateUserDTO) {
    try {
      if (createUserDto.name) {
        const usernameExists = await this.userService.getUserRecord({
          identifier: createUserDto.name,
          identifierType: 'name',
        });

        if (usernameExists) {
          throw new CustomHttpException(
            SYS_MSG.USER_ACCOUNT_EXIST,
            HttpStatus.BAD_REQUEST,
          );
        }
      } else {
        createUserDto.name = await this.generateUniqueUsername();
      }

      const emailExists = await this.userService.getUserRecord({
        identifier: createUserDto.email,
        identifierType: 'email',
      });

      if (emailExists) {
        throw new CustomHttpException(
          SYS_MSG.USER_ACCOUNT_EXIST,
          HttpStatus.BAD_REQUEST,
        );
      }

      // const payload = {
      //   email: createUserDto.email,
      //   name: createUserDto.name,
      // };
      // const token = this.jwtService.sign(payload);

      // const sendMailDto = {
      //   to: createUserDto.email,
      //   subject: 'Email Verification',
      //   template: 'email-verification',
      //   context: {
      //     name: createUserDto.name,
      //     verifyEmailIllustration: 'https://i.ibb.co/wLNf8sx/image.png',
      //     verificationUrl: new URL(`${process.env.CLIENT_BASE_URL}/${token}`)
      //       .href,
      //   },
      // };

      // await this.emailService.sendEMail(sendMailDto);

      // const user = await this.userService.createUser(
      //   Object.assign(createUserDto, {
      //     emailVerificationToken: token,
      //     emailVerificationTokenExpires: addMinutes(new Date(), 15),
      //   }),
      // );

      let referrer: User | null = null;

      const referralCode = await this.userService.generateUniqueCode();

      if (createUserDto.referralCode) {
        referrer = await this.userRepository.findOne({
          where: { referralCode: createUserDto.referralCode },
        });
      }

      const currentTime = new Date();
      const otp = await this.generateOtp();
      const hashedOtp = await this.hashOtp(otp);
      const otpCooldownExpires = new Date(
        currentTime.getTime() + 5 * 60 * 1000,
      );
      // await this.userService.saveOtp(
      //   findUser.id,
      //   hashedOtp,
      //   otpCooldownExpires,
      // );

      // const sendMailDto: SendMailDto = {
      //   to: createUserDto.email,
      //   subject: 'OTP VERIFICATION',
      //   template: 'otp-verification',
      //   context: {
      //     otp,
      //     username: createUserDto.name,
      //   },
      // };
      const sendMailDto = {
        to: createUserDto.email,
        subject: 'Email Verification',
        template: 'email-verification',
        context: {
          name: createUserDto.name,
          verifyEmailIllustration: 'https://i.ibb.co/wLNf8sx/image.png',
          otp,
        },
      };
      await this.emailService.sendEMail(sendMailDto);

      const user = await this.userService.createUser(
        Object.assign(createUserDto, {
          otp: hashedOtp,
          otpCooldownExpires,
          referralCode,
          referredBy: referrer || null,
        }),
      );

      await this.walletService.getOrCreateWallet(user.id);

      // Credit referrer with 250 naira bonus if referral code was used
      if (referrer) {
        try {
          const referrerWallet = await this.walletService.getOrCreateWallet(
            referrer.id,
          );
          const bonusAmount = this.configService.get(
            'finance.referralBonusKobo',
          );

          // Credit the referrer's wallet
          referrerWallet.balanceKobo = (
            Number(referrerWallet.balanceKobo) + bonusAmount
          ).toString();
          await this.userRepository.manager.save(referrerWallet);

          // Log the transaction
          await this.walletTransactionRepository.save({
            userId: referrer.id,
            walletId: referrerWallet.id,
            type: 'credit',
            amountKobo: bonusAmount.toString(),
            reason: 'referral_bonus',
            meta: { referredUserId: user.id, referredUserName: user.name },
          });
        } catch (error) {
          console.error('Error crediting referral bonus:', error);
          // Don't fail user creation if bonus fails
        }
      }

      return {
        message:
          'User created successfully, please check your mail for verification!',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            profilePicture: user?.profilePicture,
          },
        },
        status_code: HttpStatus.CREATED,
      };
    } catch (error) {
      if (error instanceof CustomHttpException) {
        throw error;
      }
      console.error(error);
      throw new CustomHttpException(
        'Unable to create user.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async resendVerificationEmail(email: string) {
    const findUser = (await this.userService.getUserRecord({
      identifier: email,
      identifierType: 'email',
    })) as User;
    if (!findUser) {
      throw new CustomHttpException('user not found', HttpStatus.NOT_FOUND);
    }

    if (findUser.isEmailVerified)
      throw new CustomHttpException(
        'Email already verified',
        HttpStatus.CONFLICT,
      );

    const newToken = this.jwtService.sign({
      email: findUser.email,
      name: findUser.name,
    });
    const sendMailDto = {
      to: findUser.email,
      subject: 'Email Verification',
      template: 'email-verification',
      context: {
        name: findUser.name,
        verifyEmailIllustration: 'https://i.ibb.co/wLNf8sx/image.png',
        verificationUrl: new URL(`${process.env.CLIENT_BASE_URL}/${newToken}`)
          .href,
      },
    };
    await this.emailService.sendEMail(sendMailDto);

    const updatePayload = {
      emailVerificationToken: newToken,
      emailVerificationTokenExpires: addMinutes(new Date(), 5),
    };
    const identifierOptions: UserIdentifierOptionsType = {
      identifierType: 'email',
      identifier: email,
    };

    await this.userService.updateUserRecord({
      updatePayload,
      identifierOptions,
    } as unknown as UpdateUserRecordOption);

    return {
      status_code: HttpStatus.OK,
      message: 'Check your mail, verification email sent!',
    };
  }

  async generateUniqueUsername(payload?: string): Promise<string> {
    let userName: string;
    let usernameExists: Partial<UserInterface> | null;

    const basePayload = payload || generateUsername();

    do {
      userName = basePayload;

      if (payload) {
        const randomDigits = randomInt(1000, 9999);
        userName = `${basePayload}${randomDigits}`;
      }

      usernameExists = await this.userService.getUserRecord({
        identifier: userName,
        identifierType: 'name',
      });
    } while (usernameExists !== null);

    return userName;
  }

  async googleAuth(googleAuthPayload: GoogleAuthPayloadDto) {
    const idToken = googleAuthPayload.id_token;
    const verificationRequest = await fetch(
      `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${idToken}`,
    );

    const verifyTokenResponse: TokenPayload = await verificationRequest.json();
    const userEmail = verifyTokenResponse.email;

    if (!userEmail) {
      throw new CustomHttpException(
        'Email is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const userExists = await this.userService.getUserRecord({
      identifier: userEmail,
      identifierType: 'email',
    });

    if (!userExists) {
      const userNamePayload =
        verifyTokenResponse.given_name ||
        verifyTokenResponse.family_name ||
        verifyTokenResponse.name;
      const userName = await this.generateUniqueUsername(userNamePayload);

      // const directoryPath = path.join(__dirname, '../../../..', 'avatars');
      // const avatars = [];
      // const files = fs.readdirSync(directoryPath);

      const currentTime = new Date();
      const otp = await this.generateOtp();
      const hashedOtp = await this.hashOtp(otp);
      const otpCooldownExpires = new Date(
        currentTime.getTime() + 1 * 60 * 1000,
      );

      const userCreationPayload = {
        email: userEmail,
        name: userName,
        password: '',
        userType: googleAuthPayload?.userType,
      };

      const sendMailDto = {
        to: userEmail,
        subject: 'Email Verification',
        template: 'email-verification',
        context: {
          name: userName,
          verifyEmailIllustration: 'https://i.ibb.co/wLNf8sx/image.png',
          otp,
        },
      };
      await this.emailService.sendEMail(sendMailDto);

      const createdUser = await this.userService.createUser(
        Object.assign(userCreationPayload, {
          otp: hashedOtp,
          otpCooldownExpires,
        }),
      );

      const accessToken = this.jwtService.sign({
        sub: createdUser.id,
        email: userEmail,
        name: userName,
      });
      const refreshToken = await this.generateRefreshToken(createdUser.id);

      return {
        message:
          'User created successfully, please check your mail for verification!',
        access_token: accessToken,
        refresh_token: refreshToken,
        data: {
          user: {
            id: createdUser.id,
            email: createdUser.email || '',
            name: createdUser.name || '',
            profilePicture: createdUser?.profilePicture,
          },
        },
        status_code: HttpStatus.CREATED,
      };
    }

    const accessToken = this.signJWT(userExists);
    const refreshToken = await this.generateRefreshToken(userExists.id);

    return {
      message: LOGIN_SUCCESSFUL,
      data: {
        user: {
          id: userExists.id,
          email: userExists.email || '',
          username: userExists.name || '',
          profilePicture: userExists?.profilePicture,
        },
      },
      access_token: accessToken,
      refresh_token: refreshToken,
      status_code: HttpStatus.OK,
    };
  }

  async generateCentrifugoJWT(userId: string) {
    const payload = { sub: userId };
    const token = this.jwtService.sign(payload, {
      secret: authConfig().jwtSecret,
    });
    return token;
  }

  async getCentrifugoJWT(userId: string) {
    const token = await this.generateCentrifugoJWT(userId);
    return {
      status_code: HttpStatus.OK,
      token,
    };
  }

  async generatePersonalizedToken({
    channel,
    user,
  }: {
    channel: string;
    user: RequestUser;
  }) {
    try {
      if (channel !== `personal:${user.sub}`) {
        throw new ForbiddenException("You don't have access to this channel");
      }
      const payload = {
        sub: user.sub,
        channel,
      };
      const token = this.jwtService.sign(payload, {
        secret: authConfig().jwtSecret,
      });
      return {
        status_code: HttpStatus.OK,
        token,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async loginUser(
    loginDto: LoginDto,
  ): Promise<LoginResponseDto | { status_code: number; message: string }> {
    try {
      const { email, password } = loginDto;

      const user: User = await this.userService.getUserRecord({
        identifier: email,
        identifierType: 'email',
      });

      if (!user) {
        throw new CustomHttpException(
          INVALID_CREDENTIALS,
          HttpStatus.UNAUTHORIZED,
        );
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        throw new CustomHttpException(
          INVALID_CREDENTIALS,
          HttpStatus.UNAUTHORIZED,
        );
      }

      if (user && !user.isEmailVerified) {
        throw new CustomHttpException(
          'Complete your verification first',
          HttpStatus.BAD_REQUEST,
        );
      }

      const access_token = this.signJWT(user);
      const refresh_token = await this.generateRefreshToken(user.id);

      const responsePayload = {
        access_token,
        refresh_token,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            userType: user.userType,
            profilePicture: user?.profilePicture,
          },
        },
      };

      return { message: LOGIN_SUCCESSFUL, ...responsePayload };
    } catch (error) {
      if (error instanceof CustomHttpException) {
        throw error;
      }
      console.error(error);
      throw new CustomHttpException(
        SYS_MSG.LOGIN_ERROR,
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  signJWT(user: UserResponseDTO): string {
    return this.jwtService.sign({
      name: user.name,
      sub: user.id,
      email: user.email,
      userType: user?.userType,
    });
  }

  async facebookAuth(facebookAuthPayload: FacebookAuthPayload) {
    const {
      email: userEmail,
      first_name,
      last_name,
      full_name,
    } = facebookAuthPayload;

    if (!userEmail) {
      throw new CustomHttpException(
        'Email is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const userExists = await this.userService.getUserRecord({
      identifier: userEmail,
      identifierType: 'email',
    });

    if (!userExists) {
      const userNamePayload = first_name || last_name || full_name;
      const userName = await this.generateUniqueUsername(userNamePayload);

      const currentTime = new Date();
      const otp = await this.generateOtp();
      const hashedOtp = await this.hashOtp(otp);
      const otpCooldownExpires = new Date(
        currentTime.getTime() + 1 * 60 * 1000,
      );

      const userCreationPayload = {
        email: userEmail,
        name: userName,
        password: '',
      };
      const sendMailDto = {
        to: userEmail,
        subject: 'Email Verification',
        template: 'email-verification',
        context: {
          name: userName,
          verifyEmailIllustration: 'https://i.ibb.co/wLNf8sx/image.png',
          otp,
        },
      };
      await this.emailService.sendEMail(sendMailDto);
      const createdUser = await this.userService.createUser(
        Object.assign(userCreationPayload, {
          otp: hashedOtp,
          otpCooldownExpires,
        }),
      );

      const accessToken = this.jwtService.sign({
        email: userEmail,
        username: userName,
      });
      const refreshToken = await this.generateRefreshToken(createdUser.id);

      return {
        message:
          'User created successfully, please check your mail for verification!',
        access_token: accessToken,
        refresh_token: refreshToken,
        data: {
          user: {
            id: createdUser.id,
            email: createdUser.email || '',
            username: createdUser.name || '',
            profilePicture: createdUser?.profilePicture,
          },
        },
        status_code: HttpStatus.CREATED,
      };
    }

    const accessToken = this.signJWT(userExists);
    const refreshToken = await this.generateRefreshToken(userExists.id);

    return {
      message: LOGIN_SUCCESSFUL,
      data: {
        user: {
          id: userExists.id,
          email: userExists.email || '',
          username: userExists.name || '',
          profilePicture: userExists?.profilePicture,
        },
      },
      access_token: accessToken,
      refresh_token: refreshToken,
      status_code: HttpStatus.OK,
    };
  }

  async appleAuth(appleAuthPayload: AppleAuthPayloadDto) {
    try {
      // Verify the identity token with Apple
      const appleConfig = authConfig().apple;
      const tokenPayload = await appleSignIn.verifyIdToken(
        appleAuthPayload.identityToken,
        {
          audience: appleConfig.clientId,
          nonce: appleAuthPayload.nonce,
        },
      );

      const userEmail = tokenPayload.email;

      // Check if email is hidden (relay address)
      if (!userEmail || userEmail.endsWith('@privaterelay.appleid.com')) {
        throw new CustomHttpException(
          'Real email is required. Please disable "Hide My Email" and try again.',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Check if user already exists
      const userExists = await this.userService.getUserRecord({
        identifier: userEmail,
        identifierType: 'email',
      });

      if (!userExists) {
        // New user - extract name or generate from email
        let userName: string;

        if (appleAuthPayload.user?.name) {
          const { firstName, lastName } = appleAuthPayload.user.name;
          const namePayload =
            [firstName, lastName].filter(Boolean).join(' ') || null;
          userName = namePayload
            ? await this.generateUniqueUsername(namePayload.replace(/\s+/g, ''))
            : await this.generateUsernameFromEmail(userEmail);
        } else {
          // Apple only sends name on first login, generate from email
          userName = await this.generateUsernameFromEmail(userEmail);
        }

        const currentTime = new Date();
        const otp = await this.generateOtp();
        const hashedOtp = await this.hashOtp(otp);
        const otpCooldownExpires = new Date(
          currentTime.getTime() + 1 * 60 * 1000,
        );

        const userCreationPayload = {
          email: userEmail,
          name: userName,
          password: '',
          userType: appleAuthPayload.userType,
        };

        const sendMailDto = {
          to: userEmail,
          subject: 'Email Verification',
          template: 'email-verification',
          context: {
            name: userName,
            verifyEmailIllustration: 'https://i.ibb.co/wLNf8sx/image.png',
            otp,
          },
        };
        await this.emailService.sendEMail(sendMailDto);

        const createdUser = await this.userService.createUser(
          Object.assign(userCreationPayload, {
            otp: hashedOtp,
            otpCooldownExpires,
          }),
        );

        const accessToken = this.jwtService.sign({
          sub: createdUser.id,
          email: userEmail,
          name: userName,
        });
        const refreshToken = await this.generateRefreshToken(createdUser.id);

        return {
          message:
            'User created successfully, please check your mail for verification!',
          access_token: accessToken,
          refresh_token: refreshToken,
          data: {
            user: {
              id: createdUser.id,
              email: createdUser.email || '',
              name: createdUser.name || '',
              profilePicture: createdUser?.profilePicture,
            },
          },
          status_code: HttpStatus.CREATED,
        };
      }

      // Existing user - login
      const accessToken = this.signJWT(userExists);
      const refreshToken = await this.generateRefreshToken(userExists.id);

      return {
        message: LOGIN_SUCCESSFUL,
        data: {
          user: {
            id: userExists.id,
            email: userExists.email || '',
            name: userExists.name || '',
            profilePicture: userExists?.profilePicture,
          },
        },
        access_token: accessToken,
        refresh_token: refreshToken,
        status_code: HttpStatus.OK,
      };
    } catch (error) {
      if (error instanceof CustomHttpException) {
        throw error;
      }
      console.error('Apple auth error:', error);
      throw new CustomHttpException(
        'Apple authentication failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Generate a username from email address
   */
  private async generateUsernameFromEmail(email: string): Promise<string> {
    const localPart = email.split('@')[0];
    // Remove special characters and make it username-friendly
    const cleanedName = localPart.replace(/[^a-zA-Z0-9]/g, '');
    return await this.generateUniqueUsername(cleanedName || 'user');
  }

  async sendResetPasswordPin(email: string) {
    const findUser = await this.userService.getUserRecord({
      identifier: email,
      identifierType: 'email',
    });
    if (!findUser || !(findUser instanceof User)) {
      throw new CustomHttpException('invalid email', HttpStatus.BAD_REQUEST);
    }
    const currentTime = new Date();
    if (
      findUser.otpCooldownExpires &&
      findUser.otpCooldownExpires > currentTime
    ) {
      throw new CustomHttpException(
        SYS_MSG.TOO_MANY_OTP_REQUESTS,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    const otp = await this.generateOtp();
    const hashedOtp = await this.hashOtp(otp);
    const otpCooldownExpires = new Date(currentTime.getTime() + 1 * 60 * 1000);
    await this.userService.saveOtp(findUser.id, hashedOtp, otpCooldownExpires);
    const sendMailDto: SendMailDto = {
      to: email,
      subject: SYS_MSG.PASSWORD_RESET_SUCCESSFUL,
      template: 'reset-password',
      context: {
        otp,
        username: findUser.name,
      },
    };
    await this.emailService.sendEMail(sendMailDto);
    return {
      message: SYS_MSG.OTP_SENT_SUCCESSFULLY,
      status_code: HttpStatus.OK,
    };
  }

  async resendOtp(email: string) {
    const findUser = await this.userService.getUserRecord({
      identifier: email,
      identifierType: 'email',
    });
    if (!findUser || !(findUser instanceof User)) {
      throw new CustomHttpException(
        SYS_MSG.USER_NOT_FOUND,
        HttpStatus.BAD_REQUEST,
      );
    }
    const currentTime = new Date();
    if (
      findUser.otpCooldownExpires &&
      findUser.otpCooldownExpires > currentTime
    ) {
      return {
        message: SYS_MSG.TOO_MANY_OTP_REQUESTS,
        status_code: HttpStatus.TOO_MANY_REQUESTS,
      };
    }
    const otp = await this.generateOtp();
    const hashedOtp = await this.hashOtp(otp);
    const otpCooldownExpires = new Date(currentTime.getTime() + 5 * 60 * 1000);
    await this.userService.saveOtp(findUser.id, hashedOtp, otpCooldownExpires);
    const sendMailDto: SendMailDto = {
      to: email,
      subject: 'OTP Verification',
      template: 'resend-otp',
      context: {
        otp,
        name: findUser.name,
      },
    };
    await this.emailService.sendEMail(sendMailDto);
    return {
      message: SYS_MSG.OTP_SENT_SUCCESSFULLY,
      status_code: HttpStatus.OK,
    };
  }

  async verifyOtp(email: string, otp: string) {
    if (!otp) {
      throw new CustomHttpException('invalid details', HttpStatus.BAD_REQUEST);
    }
    const findUser = await this.userService.getUserByParam('email', email);
    if (!findUser) {
      throw new CustomHttpException('invalid email', HttpStatus.BAD_REQUEST);
    }
    const validOtp = await this.compareOtp(otp, findUser.otp);
    if (!validOtp) {
      throw new CustomHttpException('invalid otp', HttpStatus.BAD_REQUEST);
    }
    const currentTime = new Date();
    if (currentTime > findUser.otpCooldownExpires) {
      throw new CustomHttpException('OTP has expired', HttpStatus.BAD_REQUEST);
    }
    await this.userService.updateOtpStatus(findUser.id);
    return {
      message: 'OTP verified successfully',
      status_code: HttpStatus.OK,
      data: {
        user: {
          id: findUser.id,
          email: findUser.email,
          name: findUser.name,
        },
      },
    };
  }

  async resetPassword(email: string, otp: string, password: string) {
    try {
      // const findUser = await this.userService.getUserByParam('email', email);
      // if (!findUser) {
      //   throw new CustomHttpException('user not found', HttpStatus.NOT_FOUND);
      // }
      // if (!findUser.isOtpVerified) {
      //   throw new CustomHttpException('invalid otp', HttpStatus.BAD_REQUEST);
      // }
      const verify = await this.verifyOtp(email, otp);
      if (verify.status_code === HttpStatus.OK) {
        const { id } = verify.data.user;
        await this.userService.resetPassword(id, password);
        await this.userService.resetOtpStatus(id);
        return {
          message: SYS_MSG.PASSWORD_RESET_SUCCESSFUL,
          status_code: HttpStatus.OK,
          data: verify.data.user,
        };
      }
    } catch (error) {
      throw new CustomHttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async decodeToken(token: string) {
    const valid = this.jwtService.verify(token);
    if (!valid) {
      return false;
    }
    return this.jwtService.decode(token);
  }

  async generateOtp(length: number = 6): Promise<string> {
    const otp = randomInt(0, Math.pow(10, length))
      .toString()
      .padStart(length, '0');
    return otp;
  }

  async hashOtp(otp: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(otp, salt);
  }

  async compareOtp(otp: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(otp, hash);
  }

  async verifyEmail(token: string) {
    const payload = await this.decodeToken(token).catch((e) => {
      throw new CustomHttpException(
        e.message === 'jwt expired' ? SYS_MSG.EXPIRED_TOKEN : e.message,
        HttpStatus.BAD_REQUEST,
      );
    });

    if (!payload) {
      throw new CustomHttpException('Invalid token', HttpStatus.BAD_REQUEST);
    }

    const findUser = (await this.userService.getUserRecord({
      identifier: payload.email,
      identifierType: 'email',
    })) as User;
    if (!findUser) {
      throw new CustomHttpException('user not found', HttpStatus.NOT_FOUND);
    }

    if (findUser.emailVerificationToken !== token)
      throw new CustomHttpException(
        SYS_MSG.INVALID_TOKEN,
        HttpStatus.BAD_REQUEST,
      );

    if (!isBefore(Date.now(), findUser.emailVerificationTokenExpires))
      throw new CustomHttpException(SYS_MSG.EXPIRED_TOKEN, HttpStatus.GONE);

    await this.userService.verifyUser(findUser.id);
    return {
      message: SYS_MSG.EMAIL_VERIFICATION_SUCCESSFUL,
      status_code: HttpStatus.OK,
    };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const response = await this.userService.changePassword(
      userId,
      changePasswordDto,
    );
    // Revoke all refresh tokens on password change for security
    await this.revokeAllUserRefreshTokens(userId);
    return response;
  }

  // ==================== REFRESH TOKEN METHODS ====================

  /**
   * Generate a new refresh token and store it in the database
   */
  async generateRefreshToken(
    userId: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<string> {
    // Generate a random token
    const rawToken = crypto.randomBytes(64).toString('hex');

    // Hash the token for storage (we only store hash, return raw)
    const hashedToken = await bcrypt.hash(rawToken, 10);

    // Calculate expiry date (7 days from now)
    const expiresAt = addDays(new Date(), this.REFRESH_TOKEN_EXPIRY_DAYS);

    // Store in database
    const refreshToken = this.refreshTokenRepository.create({
      token: hashedToken,
      userId,
      expiresAt,
      userAgent,
      ipAddress,
    });
    await this.refreshTokenRepository.save(refreshToken);

    return rawToken;
  }

  /**
   * Validate a refresh token and rotate it (issue new one, revoke old)
   */
  async validateAndRotateRefreshToken(
    rawToken: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    // Find all non-revoked, non-expired tokens
    const validTokens = await this.refreshTokenRepository.find({
      where: {
        isRevoked: false,
        expiresAt: MoreThan(new Date()),
      },
      relations: ['user'],
    });

    // Check if any token matches
    let matchedToken: RefreshToken | null = null;
    for (const token of validTokens) {
      const isMatch = await bcrypt.compare(rawToken, token.token);
      if (isMatch) {
        matchedToken = token;
        break;
      }
    }

    if (!matchedToken) {
      throw new CustomHttpException(
        'Invalid or expired refresh token',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Revoke the old token
    matchedToken.isRevoked = true;
    await this.refreshTokenRepository.save(matchedToken);

    // Generate new tokens
    const newAccessToken = this.signJWT(matchedToken.user);
    const newRefreshToken = await this.generateRefreshToken(
      matchedToken.userId,
      userAgent,
      ipAddress,
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: matchedToken.user,
    };
  }

  /**
   * Revoke a specific refresh token (logout from single device)
   */
  async revokeRefreshToken(rawToken: string): Promise<boolean> {
    const validTokens = await this.refreshTokenRepository.find({
      where: {
        isRevoked: false,
      },
    });

    for (const token of validTokens) {
      const isMatch = await bcrypt.compare(rawToken, token.token);
      if (isMatch) {
        token.isRevoked = true;
        await this.refreshTokenRepository.save(token);
        return true;
      }
    }

    return false;
  }

  /**
   * Revoke all refresh tokens for a user (logout from all devices)
   */
  async revokeAllUserRefreshTokens(userId: string): Promise<number> {
    const result = await this.refreshTokenRepository.update(
      { userId, isRevoked: false },
      { isRevoked: true },
    );
    return result.affected || 0;
  }

  /**
   * Get active sessions count for a user
   */
  async getActiveSessionsCount(userId: string): Promise<number> {
    return await this.refreshTokenRepository.count({
      where: {
        userId,
        isRevoked: false,
        expiresAt: MoreThan(new Date()),
      },
    });
  }

  /**
   * Cleanup expired tokens (can be called by a cron job)
   */
  async cleanupExpiredTokens(): Promise<number> {
    const result = await this.refreshTokenRepository.delete({
      expiresAt: isBefore(new Date(), new Date()) ? undefined : undefined,
    });
    // Alternative: soft delete by marking as revoked
    const updateResult = await this.refreshTokenRepository
      .createQueryBuilder()
      .update(RefreshToken)
      .set({ isRevoked: true })
      .where('expiresAt < :now', { now: new Date() })
      .andWhere('isRevoked = :isRevoked', { isRevoked: false })
      .execute();
    return updateResult.affected || 0;
  }
}
