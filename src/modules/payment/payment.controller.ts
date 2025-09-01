// payment.controller.ts
import {
  Body,
  Controller,
  Post,
  Req,
  Headers,
  HttpCode,
  Get,
  Query,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { skipAuth } from 'src/helpers/skipAuth';
import { PaystackCallbackDto, VerifyAccountDto } from './dto/paystack.dto';

@ApiTags('Payment')
@ApiBearerAuth()
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @ApiOperation({ summary: 'Initiate payment' })
  @ApiBody({
    description: 'initiate payment',
    type: InitiatePaymentDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Payment initiated successfully',
  })
  @Post('initiate')
  async initiate(@Body() dto: InitiatePaymentDto) {
    return this.paymentService.initiate(dto);
  }

  @skipAuth()
  @Get('/callback')
  async verifyTransaction(
    @Query() query: PaystackCallbackDto,
  ): Promise<any | boolean> {
    return await this.paymentService.verify(query);
  }

  @Post()
  @ApiOperation({ summary: 'verify payment' })
  @ApiBody({
    description: 'verify payment',
    type: VerifyPaymentDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Payment verified successfully',
  })
  @Post('verify')
  async verify(@Body() dto: VerifyPaymentDto) {
    return this.paymentService.verify(dto);
  }

  @Post('webhook')
  @skipAuth()
  @HttpCode(200)
  async handleWebhook(
    @Headers('x-paystack-signature') signature: string,
    @Req() req: Request,
  ) {
    return this.paymentService.handleWebhook(req.body, signature);
  }

  @Get()
  @ApiOperation({ summary: 'Get all banks' })
  @ApiResponse({
    status: 200,
    description: 'List of banks',
  })
  @Get('/all-banks')
  async getBanks() {
    return await this.paymentService.getBanks();
  }

  @Get()
  @ApiOperation({ summary: 'Get all banks' })
  @ApiResponse({
    status: 200,
    description: 'List of banks',
  })
  @Get('/all-banks/pay-with-bank')
  async getPayWithBanks() {
    return await this.paymentService.getPayWithBanks();
  }

  @Get()
  @ApiOperation({ summary: 'Verify a user account' })
  @ApiResponse({
    status: 200,
    description: 'User account verified successfully.',
  })
  @Get('/verify-account')
  async verifyAccount(@Query() query: VerifyAccountDto) {
    return await this.paymentService.verifyAccount(query);
  }
}
