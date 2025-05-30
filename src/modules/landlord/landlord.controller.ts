import { Controller, Post, Body, Request } from '@nestjs/common';
import { LandlordService } from './landlord.service';
import { CommercialDto, JointVentureDto } from './dto/commercial.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Landlord')
@Controller('landlord')
export class LandlordController {
  constructor(private readonly landlordService: LandlordService) {}

  @Post('invest')
  @ApiOperation({
    summary: 'Initiate one-time or recurring commercial payment',
  })
  async initiatePayment(@Body() dto: CommercialDto, @Request() req) {
    return await this.landlordService.initiatePayment(dto, req.user.id);
  }

  @Post('joint-ventures')
  @ApiOperation({
    summary: 'Initiate one-time or recurring commercial payment for renovation',
  })
  async initiatePaymentJoint(@Body() dto: JointVentureDto, @Request() req) {
    return await this.landlordService.initiatePayment(dto, req.user.id);
  }
}
