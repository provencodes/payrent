import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLegalDto } from './dto/create-legal.dto';
import { UpdateLegalDto } from './dto/update-legal.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Legal } from './entities/legal.entity';
import { Repository } from 'typeorm';

@Injectable()
export class LegalService {
  constructor(
    @InjectRepository(Legal)
    private readonly legalRepo: Repository<Legal>,
  ) { }

  async create(createLegalDto: CreateLegalDto) {
    const legal = this.legalRepo.create(createLegalDto);
    const savedLegal = await this.legalRepo.save(legal);
    return {
      message: 'Legal created successfully',
      data: savedLegal,
    };
  }

  async findAll() {
    const data = await this.legalRepo.find({
      order: { createdAt: 'DESC' },
    });
    return {
      success: true,
      message: 'All legal entries fetched successfully',
      status_code: 200,
      data: {
        items: data,
        total: data.length,
      },
    };
  }

  async findOne(id: string) {
    const legal = await this.legalRepo.findOne({ where: { id } });
    if (!legal) {
      throw new NotFoundException(`legal entry with id: ${id} not found`);
    }
    return {
      success: true,
      message: 'Legal entry fetched successfully',
      status_code: 200,
      data: legal,
    };
  }

  async update(id: string, updateLegalDto: UpdateLegalDto) {
    const legal = await this.legalRepo.preload({
      id,
      ...updateLegalDto,
    });

    if (!legal) {
      throw new NotFoundException(`Legal entry with ID ${id} not found`);
    }

    await this.legalRepo.save(legal);

    const updatedLegal = await this.legalRepo.findOne({
      where: { id },
    });

    return {
      success: true,
      message: 'Legal entry updated successfully',
      status_code: 200,
      data: updatedLegal,
    };
  }

  async markAsPaid(
    id: string,
    paymentData: {
      legalPackageId: string;
      amountPaid: number;
      paymentMethod: string;
      transactionRef: string;
    },
  ) {
    const legal = await this.legalRepo.findOne({ where: { id } });

    if (!legal) {
      throw new NotFoundException(`Legal entry with ID ${id} not found`);
    }

    legal.legalPackageId = paymentData.legalPackageId;
    legal.amountPaid = paymentData.amountPaid;
    legal.isPaid = true;
    legal.paymentDetails = {
      method: paymentData.paymentMethod,
      transactionRef: paymentData.transactionRef,
      paidAt: new Date(),
    };

    await this.legalRepo.save(legal);

    return {
      success: true,
      message: 'Payment recorded successfully',
      status_code: 200,
      data: legal,
    };
  }

  async remove(id: string) {
    const legal = await this.findOne(id);
    if (!legal) {
      throw new NotFoundException(`Legal entry with ID ${id} not found`);
    }
    await this.legalRepo.remove(legal.data);
    return {
      success: true,
      message: `Legal entry with ID #${id} successfully deleted.`,
      status_code: 200,
    };
  }
}
