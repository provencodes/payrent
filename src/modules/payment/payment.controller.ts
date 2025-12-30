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
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { skipAuth } from '../../helpers/skipAuth';
import { PaystackCallbackDto, VerifyAccountDto } from './dto/paystack.dto';
import {
  InitiatePaymentResponseDto,
  VerifyPaymentResponseDto,
  BankListResponseDto,
  VerifyAccountResponseDto,
  WebhookResponseDto,
} from './dto/payment-response.dto';
import {
  BadRequestErrorDto,
  UnauthorizedErrorDto,
} from '../../shared/dto/error-response.dto';

@ApiTags('Payment')
@ApiBearerAuth()
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('initiate')
  @ApiOperation({ summary: 'Initiate payment' })
  @ApiBody({
    description: 'Payment initiation details',
    type: InitiatePaymentDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Payment initiated successfully',
    type: InitiatePaymentResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid payment data',
    type: BadRequestErrorDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing token',
    type: UnauthorizedErrorDto,
  })
  async initiate(@Body() dto: InitiatePaymentDto) {
    return this.paymentService.initiate(dto);
  }

  @skipAuth()
  @Get('/callback')
  @ApiOperation({ summary: 'Paystack payment callback' })
  @ApiQuery({ name: 'reference', required: true, example: 'PAY_ref_123456' })
  @ApiQuery({ name: 'trxref', required: false, example: 'trx_123456' })
  @ApiResponse({
    status: 200,
    description: 'Payment callback processed',
    type: VerifyPaymentResponseDto,
  })
  async verifyTransaction(
    @Query() query: PaystackCallbackDto,
  ): Promise<any | boolean> {
    return await this.paymentService.verify(query);
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify payment' })
  @ApiBody({
    description: 'Payment verification details',
    type: VerifyPaymentDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Payment verified successfully',
    type: VerifyPaymentResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid or failed verification',
    type: BadRequestErrorDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing token',
    type: UnauthorizedErrorDto,
  })
  async verify(@Body() dto: VerifyPaymentDto) {
    return this.paymentService.verify(dto);
  }

  @Post('webhook')
  @skipAuth()
  @HttpCode(200)
  @ApiOperation({ summary: 'Paystack webhook handler' })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed successfully',
    type: WebhookResponseDto,
  })
  async handleWebhook(
    @Headers('x-paystack-signature') signature: string,
    @Req() req: Request,
  ) {
    return this.paymentService.handleWebhook(req.body, signature);
  }

  @Get('/all-banks')
  @ApiOperation({ summary: 'Get all banks' })
  @ApiResponse({
    status: 200,
    description: 'List of banks fetched successfully',
    type: BankListResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing token',
    type: UnauthorizedErrorDto,
  })
  async getBanks() {
    return await this.paymentService.getBanks();
  }

  @Get('/all-banks/pay-with-bank')
  @ApiOperation({ summary: 'Get banks that support pay-with-bank' })
  @ApiResponse({
    status: 200,
    description: 'List of pay-with-bank enabled banks',
    type: BankListResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing token',
    type: UnauthorizedErrorDto,
  })
  async getPayWithBanks() {
    return await this.paymentService.getPayWithBanks();
  }

  @Get('/verify-account')
  @ApiOperation({ summary: 'Verify a bank account' })
  @ApiQuery({ name: 'accountNumber', required: true, example: '0123456789' })
  @ApiQuery({ name: 'bankCode', required: true, example: '044' })
  @ApiResponse({
    status: 200,
    description: 'Account verified successfully',
    type: VerifyAccountResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid account or bank code',
    type: BadRequestErrorDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing token',
    type: UnauthorizedErrorDto,
  })
  async verifyAccount(@Query() query: VerifyAccountDto) {
    return await this.paymentService.verifyAccount(query);
  }
}
