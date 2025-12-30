import { Controller, Get, Request, Query } from '@nestjs/common';
import { UserFinancialService } from './user-financial.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  TransactionHistoryResponseDto,
  WalletHistoryResponseDto,
  FinancialOverviewResponseDto,
  AllPaymentHistoryResponseDto,
} from './dto/financial-response.dto';
import { UnauthorizedErrorDto } from '../../shared/dto/error-response.dto';

@ApiBearerAuth()
@ApiTags('Financial')
@Controller('financial')
export class FinancialController {
  constructor(private readonly userFinancialService: UserFinancialService) {}

  @Get('transactions')
  @ApiOperation({ summary: 'Get user transaction history with pagination' })
  @ApiQuery({
    name: 'page',
    required: false,
    example: 1,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 20,
    description: 'Items per page',
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction history fetched successfully',
    type: TransactionHistoryResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedErrorDto,
  })
  async getTransactionHistory(
    @Request() req,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return await this.userFinancialService.getTransactionHistory(
      req.user.sub,
      Number(page),
      Number(limit),
    );
  }

  @Get('wallet/history')
  @ApiOperation({
    summary: 'Get user wallet transaction history with pagination',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    example: 1,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 20,
    description: 'Items per page',
  })
  @ApiResponse({
    status: 200,
    description: 'Wallet history fetched successfully',
    type: WalletHistoryResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedErrorDto,
  })
  async getWalletHistory(
    @Request() req,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return await this.userFinancialService.getWalletHistory(
      req.user.sub,
      Number(page),
      Number(limit),
    );
  }

  @Get('payments/all')
  @ApiOperation({ summary: 'Get complete payment history across all services' })
  @ApiResponse({
    status: 200,
    description: 'Complete payment history fetched successfully',
    type: AllPaymentHistoryResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedErrorDto,
  })
  async getAllPaymentHistory(@Request() req) {
    return await this.userFinancialService.getAllPaymentHistory(req.user.sub);
  }

  @Get('overview')
  @ApiOperation({ summary: 'Get comprehensive financial overview and metrics' })
  @ApiResponse({
    status: 200,
    description: 'Financial overview fetched successfully',
    type: FinancialOverviewResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedErrorDto,
  })
  async getFinancialOverview(@Request() req) {
    return await this.userFinancialService.getUserFinancialOverview(
      req.user.sub,
    );
  }
}
