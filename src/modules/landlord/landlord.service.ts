import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
// import { CommercialDto, PaymentOption } from './dto/commercial.dto';
import { Property } from '../property/entities/property.entity';
import { Repository } from 'typeorm';
import { PaymentService } from '../payment/payment.service';
import UserService from '../user/user.service';
import { PaystackGateway } from '../payment/gateways/paystack.gateway';
import { PaymentOption } from './dto/commercial.dto';
import { PaymentType } from '../property/dto/create-property.dto';
import { WalletService } from '../wallet/wallet.service';

@Injectable()
export class LandlordService {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    private readonly paymentService: PaymentService,
    private readonly userService: UserService,
    private readonly paystack: PaystackGateway,
    private readonly walletService: WalletService,
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
    let channels = ['card'];
    if (dto.paymentOption === PaymentOption.CARD) {
      const res = await this.paymentService.landLordInvest(
        user,
        property,
        amount,
        dto,
        channels,
      );
      console.log(res);
      return {
        authorization_url: res.authorization_url,
        reference: res.reference,
      };
    } else if (dto.paymentOption === PaymentOption.BANK) {
      if (!dto.accountNumber || !dto.bankCode) {
        throw new BadRequestException(
          'Account number and bank code are required',
        );
      }
      channels = ['bank'];
      const res = await this.paymentService.landLordInvest(
        user,
        property,
        amount,
        dto,
        channels,
      );
      return {
        authorization_url: res.authorization_url,
        reference: res.reference,
      };
    } else if (dto.paymentOption === PaymentOption.TRANSFER) {
      channels = ['bank_transfer'];
      const res = await this.paymentService.landLordInvest(
        user,
        property,
        amount,
        dto,
        channels,
      );
      return {
        authorization_url: res.authorization_url,
        reference: res.reference,
      };
    } else if (dto.paymentOption === PaymentOption.WALLET) {
      // Handle wallet payment
      const paymentResult = await this.walletService.payWithWallet({
        userId,
        amountNaira: amount,
        reason: `Investment in ${property.title}`,
        description: `${dto.investmentType} investment - ${dto.shares ? `${dto.shares} shares` : `₦${amount}`}`,
      });

      // Record the payment in the payment system
      await this.paymentService.recordWalletPayment({
        userId,
        propertyId: dto.propertyId,
        investmentType: dto.investmentType,
        paymentType: dto.paymentType,
        shares: dto.shares || null,
        amount,
        reference: `wallet_${Date.now()}_${userId}`,
        email: user.email,
        status: 'success',
        paidAt: new Date().toISOString(),
        rentDuration: dto.investmentType === 'rent' ? (dto.numberOfMonths || 12) : undefined,
      });

      return {
        success: true,
        message: 'Payment successful via wallet',
        paymentMethod: 'wallet',
        amount,
        balance: paymentResult.balanceKobo,
      };
    } else {
      throw new BadRequestException('Invalid payment option');
    }
  }
}
