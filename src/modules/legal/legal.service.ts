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
  ) {}

  async create(createLegalDto: CreateLegalDto) {
    const legal = this.legalRepo.create(createLegalDto);
    const savedLegal = await this.legalRepo.save(legal);
    return {
      message: 'Legal created successfully',
      data: savedLegal,
    };
  }

  async findAll() {
    const data = await this.legalRepo.find();
    return {
      message: 'All legal entries fetched successfully',
      data: data,
    };
  }

  async findOne(id: string) {
    const legal = await this.legalRepo.findOne({ where: { id } });
    if (!legal) {
      throw new NotFoundException(`legal entry with id: ${id} not found`);
    }
    return {
      message: 'Legal entry fetched successfully',
      data: legal,
    };
  }

  async update(id: string, updateLegalDto: UpdateLegalDto) {
    const legal = await this.findOne(id);
    const updated = Object.assign(legal, updateLegalDto);
    const savedLegal = this.legalRepo.save(updated);
    return {
      message: 'Legal entry updated successfully',
      data: savedLegal,
    };
  }

  async remove(id: string) {
    const legal = await this.findOne(id);
    await this.legalRepo.remove(legal.data);
    return `This action removes a #${id} legal`;
  }
}
