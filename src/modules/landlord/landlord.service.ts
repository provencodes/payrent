import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Property } from '../property/entities/property.entity';
import { Repository } from 'typeorm';
import UserService from '../user/user.service';
import { PaymentOption } from './dto/commercial.dto';
import { PaymentType } from '../property/dto/create-property.dto';
import { PaymentProcessorService } from '../../shared/services/payment-processor.service';

@Injectable()
export class LandlordService {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    private readonly userService: UserService,
    private readonly paymentProcessor: PaymentProcessorService,
  ) {}
  async initiatePayment(dto: any, userId: string) {
    if (
      dto.paymentType === PaymentType.INSTALLMENT &&
      dto.paymentOption !== PaymentOption.CARD
    ) {
      throw new BadRequestException(
        'You can only pay with card for installment payments',
      );
    }
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
    } else if (dto.investmentType === 'rent') {
      if (!property.rentalPrice)
        throw new BadRequestException('Rental price not set for this property');
      amount = Number(property.rentalPrice);
    } else {
      amount = Number(property.price) || dto.amount;
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

    const paymentRequest = {
      userId,
      userEmail: user.email,
      amount,
      paymentOption: dto.paymentOption,
      propertyId: dto.propertyId,
      investmentType: dto.investmentType,
      paymentType: dto.paymentType,
      shares: dto.shares,
      numberOfMonths: dto.numberOfMonths,
      paymentFrequency: dto.paymentFrequency,
      accountNumber: dto.accountNumber,
      bankCode: dto.bankCode,
      reason: `Investment in ${property.title}`,
      description: `${dto.investmentType} investment - ${dto.shares ? `${dto.shares} shares` : `₦${amount}`}`,
    };

    return await this.paymentProcessor.processPayment(paymentRequest, user, property);
  }
}
