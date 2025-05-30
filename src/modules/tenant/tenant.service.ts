import { BadRequestException, Injectable } from '@nestjs/common';
// import { CreateTenantDto } from './dto/create-tenant.dto';
// import { UpdateTenantDto } from './dto/update-tenant.dto';
import { SaveRentDto } from './dto/tenant.dto';

@Injectable()
export class TenantService {
  create(dto: SaveRentDto, userId) {
    if (
      !(dto.amount || dto.duration || dto.totalSavingsGoal || dto.maturityDate)
    ) {
      throw new BadRequestException(
        'amount, duration, total savings goal, maturity date, etc must be stated...',
      );
    }
    if (
      dto.amount * dto.duration !== dto.totalSavingsGoal ||
      (dto.interestRate / 100) * dto.totalSavingsGoal + dto.totalSavingsGoal !==
        dto.estimatedReturn
    ) {
      throw new BadRequestException(
        'Error in entries, invalid calculation from values',
      );
    }

    // return 'This action adds a new tenant';
  }

  // findAll() {
  //   return `This action returns all tenant`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} tenant`;
  // }

  // update(id: number, updateTenantDto: UpdateTenantDto) {
  //   return `This action updates a #${id} tenant`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} tenant`;
  // }
}
