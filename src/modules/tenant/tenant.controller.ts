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
} from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Tenant')
@Controller('tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post('rent-savings')
  @ApiOperation({ summary: 'Create a rent savings plan' })
  @ApiResponse({
    status: 201,
    description: 'Rent savings plan created successfully',
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
  })
  applyForLoan(@Body() applyLoanDto: ApplyLoanDto, @Request() req) {
    return this.tenantService.applyForLoan(applyLoanDto, req.user.sub);
  }

  @Get('rent-payments')
  @ApiOperation({ summary: 'Get tenant rent payment history' })
  @ApiResponse({
    status: 200,
    description: 'Rent payments fetched successfully',
  })
  getRentPayments(@Request() req) {
    return this.tenantService.getRentPayments(req.user.sub);
  }

  @Get('rent-savings')
  @ApiOperation({ summary: 'Get tenant rent savings plans' })
  @ApiResponse({
    status: 200,
    description: 'Rent savings fetched successfully',
  })
  getRentSavings(@Request() req) {
    return this.tenantService.getRentSavings(req.user.sub);
  }

  @Get('loan-applications')
  @ApiOperation({ summary: 'Get tenant loan applications' })
  @ApiResponse({
    status: 200,
    description: 'Loan applications fetched successfully',
  })
  getLoanApplications(@Request() req) {
    return this.tenantService.getLoanApplications(req.user.sub);
  }

  @Patch('rent-savings/:id/fund')
  @ApiOperation({ summary: 'Fund rent savings plan' })
  @ApiBody({ type: FundSavingsDto })
  @ApiResponse({ status: 200, description: 'Rent savings funded successfully' })
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
  @ApiResponse({
    status: 200,
    description: 'Available rental properties fetched successfully',
  })
  getAvailableRentals(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.tenantService.getAvailableRentals(Number(page), Number(limit));
  }

  @Post('rent-property')
  @ApiOperation({ summary: 'Rent a property' })
  @ApiBody({ type: RentPropertyDto })
  @ApiResponse({
    status: 201,
    description: 'Property rented successfully',
  })
  rentProperty(@Body() rentPropertyDto: RentPropertyDto, @Request() req) {
    return this.tenantService.rentProperty(
      rentPropertyDto,
      req.user.sub,
      req.user.email,
    );
  }
}
