import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { WalletService } from './wallet.service';
import {
  CreateWalletDto,
  FundWalletDto,
  PayWithWalletDto,
  VerifyWalletFundingDto,
} from './dto/wallet.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import {
  CreateWalletResponseDto,
  FundWalletResponseDto,
  GetWalletResponseDto,
  PayWithWalletResponseDto,
  VerifyFundingResponseDto,
} from './dto/wallet-response.dto';
import {
  BadRequestErrorDto,
  UnauthorizedErrorDto,
  NotFoundErrorDto,
} from '../../shared/dto/error-response.dto';

@ApiBearerAuth()
@ApiTags('Wallet')
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a wallet for a user' })
  @ApiBody({ type: CreateWalletDto })
  @ApiResponse({
    status: 201,
    description: 'Wallet created successfully',
    type: CreateWalletResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid request data',
    type: BadRequestErrorDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing token',
    type: UnauthorizedErrorDto,
  })
  createWallet(@Body() createWalletDto: CreateWalletDto) {
    return this.walletService.getOrCreateWallet(createWalletDto.userId);
  }

  @Post('fund')
  @ApiOperation({ summary: "Fund a user's wallet" })
  @ApiBody({ type: FundWalletDto })
  @ApiResponse({
    status: 200,
    description: 'Payment initiated successfully',
    type: FundWalletResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid amount or payment option',
    type: BadRequestErrorDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing token',
    type: UnauthorizedErrorDto,
  })
  @ApiNotFoundResponse({
    description: 'Wallet not found',
    type: NotFoundErrorDto,
  })
  fundWallet(@Body() fundWalletDto: FundWalletDto) {
    return this.walletService.fundWallet(fundWalletDto);
  }

  @Post('pay')
  @ApiOperation({ summary: 'Make a payment using wallet balance' })
  @ApiBody({ type: PayWithWalletDto })
  @ApiResponse({
    status: 200,
    description: 'Payment successful',
    type: PayWithWalletResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Insufficient balance or invalid request',
    type: BadRequestErrorDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing token',
    type: UnauthorizedErrorDto,
  })
  @ApiNotFoundResponse({
    description: 'Wallet not found',
    type: NotFoundErrorDto,
  })
  payWithWallet(@Body() payWithWalletDto: PayWithWalletDto) {
    return this.walletService.payWithWallet(payWithWalletDto);
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get wallet details by user ID' })
  @ApiResponse({
    status: 200,
    description: 'Wallet retrieved successfully',
    type: GetWalletResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing token',
    type: UnauthorizedErrorDto,
  })
  @ApiNotFoundResponse({
    description: 'Wallet not found for user',
    type: NotFoundErrorDto,
  })
  getWallet(@Param('userId') userId: string) {
    return this.walletService.getWallet(userId);
  }

  @Post('verify-funding')
  @ApiOperation({ summary: 'Verify Paystack payment and fund wallet' })
  @ApiBody({ type: VerifyWalletFundingDto })
  @ApiResponse({
    status: 200,
    description: 'Wallet funded successfully',
    type: VerifyFundingResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid or failed payment verification',
    type: BadRequestErrorDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing token',
    type: UnauthorizedErrorDto,
  })
  verifyFunding(@Body() dto: VerifyWalletFundingDto) {
    return this.walletService.verifyWalletFunding(dto);
  }
}
