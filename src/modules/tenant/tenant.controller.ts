import {
  Controller,
  Post,
  Body,
  Request,
  Get,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { TenantService } from './tenant.service';
import { SaveRentDto, FundSavingsDto } from './dto/tenant.dto';
import { ApplyLoanDto } from './dto/loan.dto';
import { RentPropertyDto } from './dto/rent-property.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiQuery,
} from '@nestjs/swagger';
import {
  RentSavingsResponseDto,
  RentSavingsListResponseDto,
  LoanApplicationResponseDto,
  LoanApplicationListResponseDto,
  RentPaymentHistoryResponseDto,
  RentPropertyResponseDto,
  FundSavingsResponseDto,
  AvailableRentalsResponseDto,
} from './dto/tenant-response.dto';
import {
  BadRequestErrorDto,
  UnauthorizedErrorDto,
} from '../../shared/dto/error-response.dto';

@ApiBearerAuth()
@ApiTags('Tenant')
@Controller('tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post('rent-savings')
  @ApiOperation({ summary: 'Create a rent savings plan' })
  @ApiBody({ type: SaveRentDto })
  @ApiResponse({
    status: 201,
    description: 'Rent savings plan created successfully',
    type: RentSavingsResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid savings plan data',
    type: BadRequestErrorDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedErrorDto,
  })
  createRentSavings(@Body() saveRentDto: SaveRentDto, @Request() req) {
    return this.tenantService.createRentSavings(
      saveRentDto,
      req.user.sub,
      req.user.email,
    );
  }

  @Post('loan/apply')
  @ApiOperation({ summary: 'Apply for a loan' })
  @ApiBody({ type: ApplyLoanDto })
  @ApiResponse({
    status: 201,
    description: 'Loan application submitted successfully',
    type: LoanApplicationResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid loan application data',
    type: BadRequestErrorDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedErrorDto,
  })
  applyForLoan(@Body() applyLoanDto: ApplyLoanDto, @Request() req) {
    return this.tenantService.applyForLoan(applyLoanDto, req.user.sub);
  }

  @Get('rent-payments')
  @ApiOperation({ summary: 'Get tenant rent payment history' })
  @ApiResponse({
    status: 200,
    description: 'Rent payments fetched successfully',
    type: RentPaymentHistoryResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedErrorDto,
  })
  getRentPayments(@Request() req) {
    return this.tenantService.getRentPayments(req.user.sub);
  }

  @Get('rent-savings')
  @ApiOperation({ summary: 'Get tenant rent savings plans' })
  @ApiResponse({
    status: 200,
    description: 'Rent savings fetched successfully',
    type: RentSavingsListResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedErrorDto,
  })
  getRentSavings(@Request() req) {
    return this.tenantService.getRentSavings(req.user.sub);
  }

  @Get('loan-applications')
  @ApiOperation({ summary: 'Get tenant loan applications' })
  @ApiResponse({
    status: 200,
    description: 'Loan applications fetched successfully',
    type: LoanApplicationListResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedErrorDto,
  })
  getLoanApplications(@Request() req) {
    return this.tenantService.getLoanApplications(req.user.sub);
  }

  @Patch('rent-savings/:id/fund')
  @ApiOperation({ summary: 'Fund rent savings plan' })
  @ApiBody({ type: FundSavingsDto })
  @ApiResponse({
    status: 200,
    description: 'Rent savings funding initiated',
    type: FundSavingsResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid funding data or insufficient balance',
    type: BadRequestErrorDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedErrorDto,
  })
  fundRentSavings(
    @Param('id') savingsId: string,
    @Body() fundSavingsDto: FundSavingsDto,
    @Request() req,
  ) {
    return this.tenantService.fundRentSavings(
      savingsId,
      req.user.sub,
      req.user.email,
      fundSavingsDto.amount,
      fundSavingsDto.paymentOption,
      fundSavingsDto.accountNumber,
      fundSavingsDto.bankCode,
    );
  }

  @Get('available-rentals')
  @ApiOperation({ summary: 'Get available rental properties' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiResponse({
    status: 200,
    description: 'Available rental properties fetched successfully',
    type: AvailableRentalsResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedErrorDto,
  })
  getAvailableRentals(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.tenantService.getAvailableRentals(Number(page), Number(limit));
  }

  @Post('rent-property')
  @ApiOperation({ summary: 'Rent a property' })
  @ApiBody({ type: RentPropertyDto })
  @ApiResponse({
    status: 201,
    description: 'Property rental initiated successfully',
    type: RentPropertyResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid rental request or property unavailable',
    type: BadRequestErrorDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedErrorDto,
  })
  rentProperty(@Body() rentPropertyDto: RentPropertyDto, @Request() req) {
    return this.tenantService.rentProperty(
      rentPropertyDto,
      req.user.sub,
      req.user.email,
    );
  }
}
