import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLegalPackageDto } from './dto/create-legal-package.dto';
import { UpdateLegalPackageDto } from './dto/update-legal-package.dto';
import { LegalPackage } from './entities/legal-package.entity';

@Injectable()
export class LegalPackageService {
  constructor(
    @InjectRepository(LegalPackage)
    private readonly legalPackageRepository: Repository<LegalPackage>,
  ) { }

  async create(createLegalPackageDto: CreateLegalPackageDto) {
    const legalPackage = this.legalPackageRepository.create(createLegalPackageDto);
    const savedPackage = await this.legalPackageRepository.save(legalPackage);

    return {
      success: true,
      message: 'Legal package created successfully',
      status_code: 201,
      data: savedPackage,
    };
  }

  async findAll() {
    const packages = await this.legalPackageRepository.find({
      order: { price: 'ASC' },
    });

    return {
      success: true,
      message: 'Legal packages retrieved successfully',
      status_code: 200,
      data: {
        items: packages,
        total: packages.length,
      },
    };
  }

  async findOne(id: string) {
    const legalPackage = await this.legalPackageRepository.findOne({
      where: { id },
    });

    if (!legalPackage) {
      throw new NotFoundException(`Legal package with ID ${id} not found`);
    }

    return {
      success: true,
      message: 'Legal package retrieved successfully',
      status_code: 200,
      data: legalPackage,
    };
  }

  async update(id: string, updateLegalPackageDto: UpdateLegalPackageDto) {
    const legalPackage = await this.legalPackageRepository.findOne({
      where: { id },
    });

    if (!legalPackage) {
      throw new NotFoundException(`Legal package with ID ${id} not found`);
    }

    Object.assign(legalPackage, updateLegalPackageDto);
    const updatedPackage = await this.legalPackageRepository.save(legalPackage);

    return {
      success: true,
      message: 'Legal package updated successfully',
      status_code: 200,
      data: updatedPackage,
    };
  }

  async remove(id: string) {
    const legalPackage = await this.legalPackageRepository.findOne({
      where: { id },
    });

    if (!legalPackage) {
      throw new NotFoundException(`Legal package with ID ${id} not found`);
    }

    await this.legalPackageRepository.remove(legalPackage);

    return {
      success: true,
      message: 'Legal package deleted successfully',
      status_code: 200,
    };
  }
}
