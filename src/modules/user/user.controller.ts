import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import UserService from './user.service';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
// import { CurrentUser } from '../auth/decorators/current-user.decorator';
// import { RefreshAuthGuard } from '../auth/guards/refresh-auth.guard';
// import { AuthService } from '../auth/auth.service';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('User')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  // @UseGuards(RefreshAuthGuard)
  // @Post('refresh-token')
  // async refreshToken(@CurrentUser() user) {
  //   return this.authService.generateTokens(user.id);
  // }

  // @UseGuards(JwtAuthGuard)
  // @Get('profile')
  // async getProfile(@CurrentUser() user: User) {
  //   return user;
  // }
}
