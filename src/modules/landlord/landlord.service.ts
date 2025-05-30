import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
// import { CommercialDto } from './dto/commercial.dto';
import { Property } from '../property/entities/property.entity';
import { Repository } from 'typeorm';
import { PaymentService } from '../payment/payment.service';
import UserService from '../user/user.service';
import { PaystackGateway } from '../payment/gateways/paystack.gateway';

@Injectable()
export class LandlordService {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    private readonly paymentService: PaymentService,
    private readonly userService: UserService,
    private readonly paystack: PaystackGateway,
  ) {}
  async initiatePayment(dto: any, userId: string) {
    if (dto.investmentType === 'shares' && dto.paymentType === 'installment') {
      throw new BadRequestException(
        'You can only buy the numbers of shares you can aford now',
      );
    }
    const property = await this.propertyRepository.findOne({
      where: { id: dto.propertyId },
    });
    if (!property) throw new NotFoundException('Property not found');
    if (property.approved === false)
      throw new BadRequestException('Property not approved, contact admin');

    let amount = 0;
    if (dto.investmentType === 'shares') {
      if (!dto.shares)
        throw new BadRequestException('Number of shares required');

      if (!property.pricePerShare)
        throw new BadRequestException(
          'Price per share not found for this property, contact admin',
        );

      amount = dto.shares * Number(property.pricePerShare);
    } else {
      amount = Number(property.price);
    }

    if (dto.investmentType === 'joint-venture') {
      if (!dto.amount)
        throw new BadRequestException('Amount to invest required');
      amount = dto.amount;
    }

    if (
      dto.investmentType === 'joint-venture' &&
      dto.paymentType === 'installment'
    ) {
      if (!dto.paymentFrequency)
        throw new BadRequestException('Payment frequency is required');
    }

    const user = await this.userService.getUserById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const res = await this.paymentService.landLordInvest(
      user,
      property,
      amount,
      dto,
    );
    console.log(res);
    return {
      authorization_url: res.authorization_url,
      reference: res.reference,
    };
  }
}
