import { Controller, Post, Body, Request } from '@nestjs/common';
import { CommercialService } from './commercial.service';
import { CommercialDto, JointVentureDto } from './dto/commercial.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiBody,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  InvestmentResponseDto,
  JointVentureResponseDto,
} from './dto/commercial-response.dto';
import {
  BadRequestErrorDto,
  UnauthorizedErrorDto,
} from '../../shared/dto/error-response.dto';

@ApiBearerAuth()
@ApiTags('Commercial')
@Controller('commercial')
export class CommercialController {
  constructor(private readonly commercialService: CommercialService) { }

  @Post('invest')
  @ApiOperation({
    summary: 'Initiate one-time or recurring commercial payment',
  })
  @ApiBody({ type: CommercialDto })
  @ApiResponse({
    status: 200,
    description: 'Investment payment initiated successfully',
    type: InvestmentResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid investment data or insufficient balance',
    type: BadRequestErrorDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedErrorDto,
  })
  async initiatePayment(@Body() dto: CommercialDto, @Request() req) {
    return await this.commercialService.initiatePayment(dto, req.user.sub);
  }

  @Post('joint-ventures')
  @ApiOperation({
    summary:
      'Initiate one-time or recurring payment for renovation joint venture',
  })
  @ApiBody({ type: JointVentureDto })
  @ApiResponse({
    status: 200,
    description: 'Joint venture payment initiated successfully',
    type: JointVentureResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid joint venture data or insufficient balance',
    type: BadRequestErrorDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedErrorDto,
  })
  async initiatePaymentJoint(@Body() dto: JointVentureDto, @Request() req) {
    return await this.commercialService.initiatePayment(dto, req.user.sub);
  }
}
