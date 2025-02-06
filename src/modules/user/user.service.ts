import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateAccountDto, CreateUserDto } from './dto/create-user.dto';
import { numberGenerator, validateEmail } from '../../../helper/config';
import { Errormessage } from '../../../helper/ErrorMessage';
import * as bcrypt from 'bcryptjs';
import { TokenPayload } from '../auth/token-payload.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userModel: Repository<User>,
  ) {}

  async createAccount(createAccountDto: CreateAccountDto): Promise<any> {
    try {
      // const communityExist = await this.communityModel.findOneBy({
      //   name: createAccountDto.communityName,
      // });

      // if (communityExist)
      //   throw new NotFoundException(Errormessage.CommunityExist);

      const isValidEmail = validateEmail(createAccountDto.email);
      if (!isValidEmail)
        return new NotFoundException(Errormessage.IncorrectEmail);

      const userExist = await this.userModel.findOneBy({
        email: createAccountDto.email.toLowerCase(),
      });

      if (!userExist) {
        if (createAccountDto.password) {
          const user = this.userModel.create({
            email: createAccountDto.email.toLowerCase(),
            password: createAccountDto.password,
            name: createAccountDto.name,
          });

          const saltRounds = await bcrypt.genSalt(10);
          const hashPassword = await bcrypt.hash(user.password, saltRounds);
          user.password = hashPassword;
          const savedUser = await this.userModel.save(user);
          // const community = this.communityModel.create({
          //   name: createAccountDto.communityName,
          //   range: createAccountDto.range,
          //   user,
          // });
          // await this.communityModel.save(community);

          return {
            status: 201,
            success: true,
            message:
              'Account successfully created.',
            user: savedUser,
          };
        } else {
          throw new NotFoundException(Errormessage.Wronginput);
        }
      }
      throw new NotFoundException(Errormessage.UserExist);
    } catch (err) {
      throw err;
    }
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    return this.userModel.save(createUserDto);
  }

  async getUser(filter: FindOptionsWhere<User>) {
    return this.userModel.findOneBy(filter);
  }

  async getUserDetails(user: TokenPayload) {
    return this.userModel.findOne({
      where: { id: user.userId },
    });
  }

}
