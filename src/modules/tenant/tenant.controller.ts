import {
  Controller,
  Post,
  Body,
  Request,
  Get,
  Param,
  Patch,
} from '@nestjs/common';
import { TenantService } from './tenant.service';
import { SaveRentDto, FundSavingsDto } from './dto/tenant.dto';
import { ApplyLoanDto } from './dto/loan.dto';
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
    return this.tenantService.createRentSavings(saveRentDto, req.user.sub);
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
      fundSavingsDto.amount,
    );
  }
}
