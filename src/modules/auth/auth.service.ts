import { ForbiddenException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
// import * as path from 'path';
// import * as fs from 'fs';
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
// import GoogleAuthPayload from './interfaces/GoogleAuthPayloadInterface';
import { SendMailDto } from '../mailer/dto/send-mail.dto';
import { EmailService } from '../mailer/mailer.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RequestUser } from './interfaces/request.userdto';
import { randomInt } from 'crypto';
import { UserInterface } from '../user/interfaces/user.interface';
import FacebookAuthPayload from './interfaces/FacebookAuthPayloadInterface';
import { addMinutes, isBefore } from 'date-fns';
import { User } from '../user/entities/user.entity';
import UserIdentifierOptionsType from '../user/options/UserIdentifierOptions';
import UpdateUserRecordOption from '../user/options/UpdateUserRecordOption';
import * as SYS_MSG from '../../helpers/systemMessages';
import { generateUsername } from 'unique-username-generator';
import UserResponseDTO from '../user/dto/user-response.dto';
import { WalletService } from '../wallet/wallet.service';
import { GoogleAuthPayloadDto } from './dto/google-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export default class AuthenticationService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private readonly walletService: WalletService,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async createNewUser(createUserDto: CreateUserDTO) {
    try {
      if (createUserDto.name) {
        const usernameExists = await this.userService.getUserRecord({
          identifier: createUserDto.name,
          identifierType: 'name',
        });

        if (usernameExists) {
          return {
            status_code: HttpStatus.BAD_REQUEST,
            message: SYS_MSG.USER_ACCOUNT_EXIST,
          };
        }
      } else {
        createUserDto.name = await this.generateUniqueUsername();
      }

      const emailExists = await this.userService.getUserRecord({
        identifier: createUserDto.email,
        identifierType: 'email',
      });

      if (emailExists) {
        return {
          status_code: HttpStatus.BAD_REQUEST,
          message: SYS_MSG.USER_ACCOUNT_EXIST,
        };
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
        currentTime.getTime() + 1 * 60 * 1000,
      );
      // await this.userService.saveOtp(
      //   findUser.id,
      //   hashedOtp,
      //   otpCooldownExpires,
      // );

      const user = await this.userService.createUser(
        Object.assign(createUserDto, {
          otp: hashedOtp,
          otpCooldownExpires,
          referralCode,
          referredBy: referrer?.id || null,
        }),
      );

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

      await this.walletService.getOrCreateWallet(user.id);

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
      console.error(error);
      return {
        status_code: HttpStatus.NOT_IMPLEMENTED,
        message: 'Unable to create user.',
      };
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
      emailVerificationTokenExpires: addMinutes(new Date(), 15),
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

      return {
        message:
          'User created successfully, please check your mail for verification!',
        access_token: accessToken,
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
        return {
          status_code: HttpStatus.UNAUTHORIZED,
          message: INVALID_CREDENTIALS,
        };
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return {
          status_code: HttpStatus.UNAUTHORIZED,
          message: INVALID_CREDENTIALS,
        };
      }

      if (user && !user.isEmailVerified) {
        return {
          status_code: 400,
          message: 'Complete your verification first',
        };
      }

      const access_token = this.signJWT(user);

      const responsePayload = {
        access_token,
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
      console.error(error);
      return {
        status_code: HttpStatus.UNAUTHORIZED,
        message: SYS_MSG.LOGIN_ERROR,
      };
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
      const accessToken = this.jwtService.sign({
        email: userEmail,
        username: userName,
      });
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

      return {
        message:
          'User created successfully, please check your mail for verification!',
        access_token: accessToken,
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
      status_code: HttpStatus.OK,
    };
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
      return {
        message: SYS_MSG.USER_NOT_FOUND,
        status_code: HttpStatus.BAD_REQUEST,
      };
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
    const otpCooldownExpires = new Date(currentTime.getTime() + 1 * 60 * 1000);
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
    return response;
  }
}
