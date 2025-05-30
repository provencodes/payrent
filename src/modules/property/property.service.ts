import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from './entities/property.entity';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { GetAllPropertyDto } from './dto/property-response.dto';
import { GetPropertiesDto } from './dto/property.dto';

@Injectable()
export class PropertyService {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(dto: CreatePropertyDto, userId) {
    console.log(userId);
    if (dto.listingType === 'shares' && !dto.pricePerShare) {
      throw new NotFoundException(
        'Price per share is required for shares listing',
      );
    } else if (dto.listingType === 'rent' && !dto.rentalPrice) {
      throw new NotFoundException('Rental price is required for rent listing');
    } else if (
      (dto.listingType === 'sale' && !dto.price) ||
      (dto.listingType === 'sale' && !(dto.numberOfUnit && dto.pricePerUnit))
    ) {
      throw new NotFoundException(
        'Price is required for sale listing or price per unit and total numebr of units',
      );
    }
    if (
      dto.listingType === 'joint-ventures' &&
      !(dto.renovationType || dto.estimatedTimeline || dto.paymentType)
    ) {
      throw new BadRequestException(
        'Renovation type, estimated timeline, and payment type are required for joint ventures listing',
      );
    }
    if (
      dto.listingType === 'flip' &&
      !(dto.price || dto.resaleValue || dto.potentialRoi)
    ) {
      throw new BadRequestException(
        'price, resale value, potential ROI are required for flip listing',
      );
    }

    if (
      dto.listingType === 'co-vest' &&
      !(
        dto.price ||
        dto.investmentDuration ||
        dto.potentialRoi ||
        dto.investmentGoal ||
        dto.minimumInvestment
      )
    ) {
      throw new BadRequestException(
        'price, investment duration, potential ROI, investment goal, minimum investment are required for co-vest listing',
      );
    }
    // dto.listedBy = userId;
    const payload = { listedBy: userId, ...dto };
    const property = this.propertyRepository.create(payload);
    const savedProp = await this.propertyRepository.save(property);
    return {
      message: 'Property created successfully',
      data: savedProp,
    };
  }

  async findAll(): Promise<GetAllPropertyDto> {
    const data = await this.propertyRepository.find();
    return {
      message: 'All properties fetched successfully',
      data: data,
    };
  }

  async findOne(id: string): Promise<Property> {
    const property = await this.propertyRepository.findOne({ where: { id } });
    if (!property) throw new NotFoundException(`Property ${id} not found`);
    return property;
  }

  async update(
    id: string,
    updatePropertyDto: UpdatePropertyDto,
  ): Promise<Property> {
    const property = await this.findOne(id);
    const updated = Object.assign(property, updatePropertyDto);
    return await this.propertyRepository.save(updated);
  }

  async remove(id: string): Promise<{
    status: 200;
    message: string;
  }> {
    const property = await this.findOne(id);
    if (!property) throw new NotFoundException('Property not found');

    // Delete images from cloudinary
    const publicIds = property.images?.map((img) => img.public_id);
    if (publicIds?.length) {
      await this.cloudinaryService.deleteMultipleImages(publicIds);
    }

    await this.propertyRepository.remove(property);

    return {
      status: 200,
      message: 'Property deleted successfully',
    };
  }

  async getAllProperties(query: GetPropertiesDto) {
    const {
      page,
      limit,
      orderBy,
      order,
      titleSearch,
      addressSearch,
      rentalPriceMin,
      rentalPriceMax,
      interestRateMin,
      interestRateMax,
      createdAfter,
      createdBefore,
      ...filters
    } = query;

    const qb = this.propertyRepository.createQueryBuilder('property');

    // Standard equality filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        qb.andWhere(`property.${key} = :${key}`, { [key]: value });
      }
    });

    // Partial match filters
    if (titleSearch) {
      qb.andWhere('property.title ILIKE :titleSearch', {
        titleSearch: `%${titleSearch}%`,
      });
    }

    if (addressSearch) {
      qb.andWhere('property.address ILIKE :addressSearch', {
        addressSearch: `%${addressSearch}%`,
      });
    }

    // Rental price range
    if (rentalPriceMin !== undefined) {
      qb.andWhere('property.rentalPrice >= :rentalPriceMin', {
        rentalPriceMin,
      });
    }
    if (rentalPriceMax !== undefined) {
      qb.andWhere('property.rentalPrice <= :rentalPriceMax', {
        rentalPriceMax,
      });
    }

    // Interest rate range
    if (interestRateMin !== undefined) {
      qb.andWhere('property.interestRate >= :interestRateMin', {
        interestRateMin,
      });
    }
    if (interestRateMax !== undefined) {
      qb.andWhere('property.interestRate <= :interestRateMax', {
        interestRateMax,
      });
    }

    // Created date range
    if (createdAfter) {
      qb.andWhere('property.createdAt >= :createdAfter', { createdAfter });
    }
    if (createdBefore) {
      qb.andWhere('property.createdAt <= :createdBefore', { createdBefore });
    }

    // Pagination
    qb.skip((page - 1) * limit).take(limit);

    // Sorting
    qb.orderBy(`property.${orderBy}`, order.toUpperCase() as 'ASC' | 'DESC');

    const [items, total] = await qb.getManyAndCount();

    return {
      Status: 200,
      Message: 'Properties fetched successfully',
      Data: {
        items,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  // async getAllProperties(query: GetPropertiesDto) {
  //   const {
  //     page = 1,
  //     limit = 10,
  //     orderBy = 'createdAt',
  //     order = 'desc',
  //     ...filters
  //   } = query;

  //   const qb = this.propertyRepository.createQueryBuilder('property');

  //   // Apply filters
  //   Object.entries(filters).forEach(([key, value]) => {
  //     if (value !== undefined && value !== null) {
  //       qb.andWhere(`property.${key} = :${key}`, { [key]: value });
  //     }
  //   });

  //   // Pagination
  //   qb.skip((page - 1) * limit).take(limit);

  //   // Sorting
  //   qb.orderBy(`property.${orderBy}`, order.toUpperCase() as 'ASC' | 'DESC');

  //   const [items, total] = await qb.getManyAndCount();

  //   return {
  //     Status: 200,
  //     Message: 'Properties fetched successfully',
  //     Data: {
  //       items,
  //       meta: {
  //         total,
  //         page,
  //         limit,
  //         totalPages: Math.ceil(total / limit),
  //       },
  //     },
  //   };
  // }

  // async remove(id: string) {
  //   const property = await this.propertyRepo.findOne({ where: { id } });
  //   if (!property) throw new NotFoundException('Property not found');

  //   // Delete images from cloudinary
  //   const publicIds = property.images?.map((img) => img.public_id);
  //   if (publicIds?.length) {
  //     await this.cloudinaryService.deleteMultipleImages(publicIds);
  //   }

  //   await this.propertyRepo.remove(property);

  //   return {
  //     Status: 200,
  //     Message: 'Property deleted successfully',
  //   };
  // }
}
