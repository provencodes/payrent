import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { User } from './entities/user.entity';
import UserService from './user.service';
import {
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import UserIdentifierOptionsType from './options/UserIdentifierOptions';
import { UpdateUserDto } from './dto/update-user-dto';
import { CreateUserDto } from './dto/create-user.dto';

@ApiBearerAuth()
@ApiTags('User')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User details fetched successfully',
    type: User,
  })
  async findOne(@Param('id') id: string) {
    return await this.userService.getUser(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiBody({
    description: 'Update user Profile',
    type: CreateUserDto,
  })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
    type: User,
  })
  async editProfile(
    @Param('id') id: string,
    @Body() updatePayload: CreateUserDto,
  ) {
    const identifierOptions = {
      identifier: id,
      identifierType: 'id',
    } as UserIdentifierOptionsType;
    const payload = {
      updatePayload,
      identifierOptions,
    };
    return this.userService.updateUserRecord(payload);
  }
}
