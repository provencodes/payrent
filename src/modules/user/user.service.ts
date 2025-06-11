import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import UserResponseDTO from './dto/user-response.dto';
import { User } from './entities/user.entity';
import CreateNewUserOptions from './options/CreateNewUserOptions';
import CreateUserNoPassOption from './options/CreateUserNoPassOption';
import UpdateUserRecordOption from './options/UpdateUserRecordOption';
import UserIdentifierOptionsType from './options/UserIdentifierOptions';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CustomHttpException } from '../../helpers/custom-http-filter';
import * as SYS_MSG from '../../helpers/systemMessages';
// import { UserInterface } from './interfaces/user.interface';

@Injectable()
export default class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createUser(createUserPayload: CreateNewUserOptions) {
    const newUser = new User();
    Object.assign(newUser, createUserPayload);

    return await this.userRepository.save(newUser);
  }

  async createUserWithoutPass(createUserNoPassPayload: CreateUserNoPassOption) {
    const newUser = new User();
    Object.assign(newUser, createUserNoPassPayload);
    return await this.userRepository.save(newUser);
  }

  async updateUserRecord(userUpdateOptions: UpdateUserRecordOption) {
    const { updatePayload, identifierOptions } = userUpdateOptions;
    const user = await this.getUserRecord(identifierOptions);
    Object.assign(user, updatePayload);
    await this.userRepository.save(user);
  }

  async getUserByEmail(email: string) {
    try {
      const user: User = await this.userRepository.findOne({
        where: { email: email },
      });
      // if (!user) {
      //   return {
      //     status_code: 401,
      //     message: `user with email: ${email} is not registered yet`,
      //   };
      // }
      return user;
    } catch (error) {
      // throw new NotFoundException(`not found. Consider creating an account`);
    }
  }

  private async getUserByUsername(name: string) {
    const user: User = await this.userRepository.findOne({
      where: { name: name },
    });
    return user;
  }

  async getUserById(identifier: string) {
    const user: User = await this.userRepository.findOne({
      where: { id: identifier },
    });
    return user;
  }

  async getUserRecord(
    identifierOptions: UserIdentifierOptionsType,
  ): Promise<User> {
    const { identifier, identifierType } = identifierOptions;

    const GetRecord = {
      id: async () => this.getUserById(String(identifier)),
      name: async () => this.getUserByUsername(String(identifier)),
      email: async () => this.getUserByEmail(String(identifier)),
    };

    if (!identifierType || !GetRecord[identifierType]) {
      throw new NotFoundException(
        `user not found, Consider creating an account`,
      );
    }

    return await GetRecord[identifierType]();
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const { oldPassword, newPassword } = changePasswordDto;

    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user || !(await user.validatePassword(oldPassword))) {
      throw new CustomHttpException('Invalid password', HttpStatus.BAD_REQUEST);
    }

    await user.setPassword(newPassword);
    await this.userRepository.save(user);
    return {
      status: 'success',
      message: 'Password changed successfully',
      status_code: HttpStatus.ACCEPTED,
    };
  }

  async resetPassword(userId: string, password) {
    const user = await this.userRepository.findOneBy({ id: userId });
    await user.setPassword(password);
    await this.userRepository.save(user);
    return {
      status: 'success',
      message: 'Password changed successfully',
      status_code: HttpStatus.ACCEPTED,
    };
  }

  async saveOtp(userId: string, hashedOtp: string, expiryTime: Date) {
    const findUser = await this.userRepository.findOneBy({ id: userId });
    findUser.otp = hashedOtp;
    findUser.otpCooldownExpires = expiryTime;
    this.userRepository.save(findUser);
  }

  async updateOtpStatus(userId: string) {
    const findUser = await this.userRepository.findOneBy({ id: userId });
    findUser.isOtpVerified = true;
    this.userRepository.save(findUser);
  }

  async verifyUser(userId: string) {
    const findUser = await this.userRepository.findOneBy({ id: userId });
    findUser.isEmailVerified = true;
    findUser.emailVerificationToken = null;
    findUser.emailVerificationTokenExpires = null;
    this.userRepository.save(findUser);
  }

  async getUserByParam(
    key: keyof User,
    value: string,
  ): Promise<UserResponseDTO> {
    const user: UserResponseDTO = await this.userRepository.findOneBy({
      [key]: value,
    });
    return user;
  }

  async resetOtpStatus(userId: string): Promise<void> {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new CustomHttpException(
        SYS_MSG.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
    user.isOtpVerified = false;
    user.otp = null;
    user.otpCooldownExpires = null;

    await this.userRepository.save(user);
  }
}
