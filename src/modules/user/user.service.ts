import { HttpStatus, Injectable } from '@nestjs/common';
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

  private async getUserByEmail(email: string) {
    const user: UserResponseDTO = await this.userRepository.findOne({
      where: { email: email },
    });
    return user;
  }

  private async getUserByUsername(username: string) {
    const user: UserResponseDTO = await this.userRepository.findOne({
      where: { username },
    });
    return user;
  }

  async getUserById(identifier: string) {
    const user = await this.userRepository.findOne({
      where: { id: identifier },
    });
    return user;
  }

  async getUserRecord(identifierOptions: UserIdentifierOptionsType) {
    const { identifier, identifierType } = identifierOptions;

    const GetRecord = {
      id: async () => this.getUserById(String(identifier)),
      username: async () => this.getUserByUsername(String(identifier)),
      email: async () => this.getUserByEmail(String(identifier)),
    };

    if (!identifierType || !GetRecord[identifierType]) {
      return null;
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
    findUser.isOtp_verified = true;
    this.userRepository.save(findUser);
  }

  async verifyUser(userId: string) {
    const findUser = await this.userRepository.findOneBy({ id: userId });
    findUser.isEmail_verified = true;
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
    user.isOtp_verified = false;
    user.otp = null;
    user.otpCooldownExpires = null;

    await this.userRepository.save(user);
  }
}

// import { Injectable, NotFoundException } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository, FindOptionsWhere } from 'typeorm';
// import { User } from './entities/user.entity';
// import { RegisterDto } from '../auth/dto/register.dto';
// import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';
// import * as bcrypt from 'bcryptjs';

// @Injectable()
// export class UsersService {
//   constructor(
//     @InjectRepository(User) private usersRepository: Repository<User>,
//   ) {}

//   async create(registerDto: RegisterDto): Promise<User> {
//     const user = this.usersRepository.create(registerDto);
//     return this.usersRepository.save(user);
//   }

//   async findByEmail(email: string): Promise<User | null> {
//     return this.usersRepository.findOne({ where: { email } });
//   }

//   async updateRefreshToken(userId: string, token: string) {
//     await this.usersRepository.update(userId, { refreshToken: token });
//   }

//   async clearRefreshToken(userId: string) {
//     await this.usersRepository.update(userId, { refreshToken: null });
//   }

//   async setVerificationToken(userId: string, token: string) {
//     await this.usersRepository.update(userId, { verificationToken: token });
//   }

//   async findByVerificationToken(token: string) {
//     return this.usersRepository.findOne({ where: { verificationToken: token } });
//   }

//   async setPasswordResetToken(userId: string, token: string) {
//     await this.usersRepository.update(userId, { resetToken: token });
//   }

//   async findByResetToken(token: string) {
//     return this.usersRepository.findOne({ where: { resetToken: token } });
//   }

//   async findById(userId: string): Promise<User | null> {
//     const user = await this.usersRepository.findOne({ where: { id: userId } });

//     if (!user) {
//       throw new NotFoundException('User not found');
//     }

//     return user;
//   }

//   async update(userId: string, updateUserDto: UpdateUserDto): Promise<User> {
//     const user = await this.findById(userId);

//     if (!user) {
//       throw new NotFoundException('User not found');
//     }

//     // If password is being updated, hash it before saving
//     if (updateUserDto.password) {
//       updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
//     }

//     Object.assign(user, updateUserDto);

//     await this.usersRepository.save(user);

//     return user;
//   }

//   async createUser(createUserDto: CreateUserDto): Promise<User> {
//     return this.usersRepository.save(createUserDto);
//   }

//   async getUser(filter: FindOptionsWhere<User>) {
//     return this.usersRepository.findOneBy(filter);
//   }

// }
