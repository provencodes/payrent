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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { skipAuth } from 'src/helpers/skipAuth';
import { PaystackCallbackDto, VerifyAccountDto } from './dto/paystack.dto';

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @ApiBearerAuth()
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

  @ApiBearerAuth()
  @Post('verify')
  async verify(@Body() dto: VerifyPaymentDto) {
    return this.paymentService.verify(dto);
  }

  @skipAuth()
  @Post('webhook')
  @skipAuth()
  @HttpCode(200)
  async handleWebhook(
    @Headers('x-paystack-signature') signature: string,
    @Req() req: Request,
  ) {
    return this.paymentService.handleWebhook(req.body, signature);
  }

  @Get('/all-banks')
  async getBanks() {
    return await this.paymentService.getBanks();
  }

  @Get('/verify-account')
  async verifyAccount(@Query() query: VerifyAccountDto) {
    return await this.paymentService.verifyAccount(query);
  }
}
