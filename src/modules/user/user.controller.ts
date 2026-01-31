import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Request,
  Post,
  Delete,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import UserService from './user.service';
import { VerifyMeService } from './verifyme.service';
import { VerifyIdentityDto } from './dto/verify-identity.dto';
import {
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { UpdateProfileDto } from './dto/update-user-dto';
import { ReferralsListResponseDto } from './dto/referrals-response.dto';
import {
  CreateBankAccountDto,
  UpdateBankAccountDto,
} from './dto/bank-account.dto';
import {
  CreatePaymentMethodDto,
  UpdatePaymentMethodDto,
} from './dto/payment-method.dto';

@ApiBearerAuth()
@ApiTags('User')
@Controller('users')
export class UsersController {
  constructor(
    private readonly userService: UserService,
    private readonly verifyMeService: VerifyMeService,
  ) {}

  @Get('referrals')
  @ApiOperation({ summary: 'Get a user referrer metrics' })
  @ApiResponse({
    status: 200,
    description: 'User referral metrics fetched successfully',
  })
  async getReferrals(@Request() req) {
    return await this.userService.getReferrals(req.user.sub);
  }

  // @Get('referrals/list')
  // @ApiOperation({
  //   summary: 'Get detailed list of users referred by current user',
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Referrals list fetched successfully',
  //   type: ReferralsListResponseDto,
  // })
  // async getReferralsList(@Request() req) {
  //   return await this.userService.getReferralsList(req.user.sub);
  // }

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

  @Post('bank-accounts')
  @ApiOperation({ summary: 'Add a new bank account' })
  @ApiBody({ type: CreateBankAccountDto })
  @ApiResponse({ status: 201, description: 'Bank account added successfully' })
  async addBankAccount(
    @Request() req,
    @Body() createBankAccountDto: CreateBankAccountDto,
  ) {
    return await this.userService.addBankAccount(
      req.user.sub,
      createBankAccountDto,
    );
  }

  @Get('bank-accounts')
  @ApiOperation({ summary: 'Get user bank accounts' })
  @ApiResponse({
    status: 200,
    description: 'Bank accounts fetched successfully',
  })
  async getBankAccounts(@Request() req) {
    return await this.userService.getBankAccounts(req.user.sub);
  }

  @Patch('bank-accounts/:accountId')
  @ApiOperation({ summary: 'Update bank account' })
  @ApiBody({ type: UpdateBankAccountDto })
  @ApiResponse({
    status: 200,
    description: 'Bank account updated successfully',
  })
  async updateBankAccount(
    @Request() req,
    @Param('accountId') accountId: string,
    @Body() updateBankAccountDto: UpdateBankAccountDto,
  ) {
    return await this.userService.updateBankAccount(
      req.user.sub,
      accountId,
      updateBankAccountDto,
    );
  }

  @Delete('bank-accounts/:accountId')
  @ApiOperation({ summary: 'Delete bank account' })
  @ApiResponse({
    status: 200,
    description: 'Bank account deleted successfully',
  })
  async deleteBankAccount(
    @Request() req,
    @Param('accountId') accountId: string,
  ) {
    return await this.userService.deleteBankAccount(req.user.sub, accountId);
  }

  @Post('payment-methods')
  @ApiOperation({ summary: 'Add a new payment method' })
  @ApiBody({ type: CreatePaymentMethodDto })
  @ApiResponse({
    status: 201,
    description: 'Payment method added successfully',
  })
  async addPaymentMethod(
    @Request() req,
    @Body() createPaymentMethodDto: CreatePaymentMethodDto,
  ) {
    return await this.userService.addPaymentMethod(
      req.user.sub,
      createPaymentMethodDto,
    );
  }

  @Get('payment-methods')
  @ApiOperation({ summary: 'Get user payment methods' })
  @ApiResponse({
    status: 200,
    description: 'Payment methods fetched successfully',
  })
  async getPaymentMethods(@Request() req) {
    return await this.userService.getPaymentMethods(req.user.sub);
  }

  @Patch('payment-methods/:methodId')
  @ApiOperation({ summary: 'Update payment method' })
  @ApiBody({ type: UpdatePaymentMethodDto })
  @ApiResponse({
    status: 200,
    description: 'Payment method updated successfully',
  })
  async updatePaymentMethod(
    @Request() req,
    @Param('methodId') methodId: string,
    @Body() updatePaymentMethodDto: UpdatePaymentMethodDto,
  ) {
    return await this.userService.updatePaymentMethod(
      req.user.sub,
      methodId,
      updatePaymentMethodDto,
    );
  }

  @Delete('payment-methods/:methodId')
  @ApiOperation({ summary: 'Delete payment method' })
  @ApiResponse({
    status: 200,
    description: 'Payment method deleted successfully',
  })
  async deletePaymentMethod(
    @Request() req,
    @Param('methodId') methodId: string,
  ) {
    return await this.userService.deletePaymentMethod(req.user.sub, methodId);
  }

  @Post('verify-nin')
  @ApiOperation({ summary: 'Verify NIN using VerifyMe' })
  @ApiBody({ type: VerifyIdentityDto })
  @ApiResponse({ status: 200, description: 'NIN verified successfully' })
  async verifyNin(@Body() verifyDto: VerifyIdentityDto) {
    const { number, firstName, lastName, dob } = verifyDto;
    return await this.verifyMeService.verifyNin(
      number,
      firstName,
      lastName,
      dob,
    );
  }

  @Post('verify-bvn')
  @ApiOperation({ summary: 'Verify BVN using VerifyMe' })
  @ApiBody({ type: VerifyIdentityDto })
  @ApiResponse({ status: 200, description: 'BVN verified successfully' })
  async verifyBvn(@Body() verifyDto: VerifyIdentityDto) {
    const { number, firstName, lastName, dob } = verifyDto;
    return await this.verifyMeService.verifyBvn(
      number,
      firstName,
      lastName,
      dob,
    );
  }
}
