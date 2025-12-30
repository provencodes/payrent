import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../modules/user/entities/user.entity';
import { CustomHttpException } from '../helpers/custom-http-filter';
import { FORBIDDEN_ACTION } from '../helpers/systemMessages';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user.sub;

    const user = await this.userRepository.findOne({
      where: { id: userId, isAdmin: true },
    });
    if (!user)
      throw new CustomHttpException(FORBIDDEN_ACTION, HttpStatus.FORBIDDEN);
    return true;
  }
}
