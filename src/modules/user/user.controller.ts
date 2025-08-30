import { Body, Controller, Get, Param, Patch, Request } from '@nestjs/common';
import { User } from './entities/user.entity';
import UserService from './user.service';
import {
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { UpdateProfileDto } from './dto/update-user-dto';
import { ReferralsListResponseDto } from './dto/referrals-response.dto';

@ApiBearerAuth()
@ApiTags('User')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get('referrals')
  @ApiOperation({ summary: 'Get a user referrer metrics' })
  @ApiResponse({
    status: 200,
    description: 'User referral metrics fetched successfully',
  })
  async getReferrals(@Request() req) {
    return await this.userService.getReferrals(req.user.sub);
  }

  @Get('referrals/list')
  @ApiOperation({ summary: 'Get detailed list of users referred by current user' })
  @ApiResponse({
    status: 200,
    description: 'Referrals list fetched successfully',
    type: ReferralsListResponseDto,
  })
  async getReferralsList(@Request() req) {
    return await this.userService.getReferralsList(req.user.sub);
  }

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
    type: UpdateProfileDto,
  })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
    type: User,
  })
  async editProfile(
    @Param('id') id: string,
    @Body() updatePayload: UpdateProfileDto,
  ) {
    return await this.userService.updateProfile(id, updatePayload);
  }
}
