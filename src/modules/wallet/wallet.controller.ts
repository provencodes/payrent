import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { WalletService } from './wallet.service';
import {
  CreateWalletDto,
  FundWalletDto,
  PayWithWalletDto,
  VerifyWalletFundingDto,
} from './dto/wallet.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Wallet')
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a wallet for a user' })
  createWallet(@Body() createWalletDto: CreateWalletDto) {
    return this.walletService.getOrCreateWallet(createWalletDto.userId);
  }

  @Post('fund')
  @ApiOperation({ summary: "Fund a user's wallet" })
  fundWallet(@Body() fundWalletDto: FundWalletDto) {
    return this.walletService.fundWallet(fundWalletDto);
  }

  @Post('pay')
  @ApiOperation({ summary: 'Make a payment using wallet balance' })
  payWithWallet(@Body() payWithWalletDto: PayWithWalletDto) {
    return this.walletService.payWithWallet(payWithWalletDto);
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get wallet details by user ID' })
  getWallet(@Param('userId') userId: string) {
    return this.walletService.getWallet(userId);
  }

  @Post('verify-funding')
  @ApiOperation({ summary: 'Verify Paystack payment and fund wallet' })
  verifyFunding(@Body() dto: VerifyWalletFundingDto) {
    return this.walletService.verifyWalletFunding(dto);
  }
}
