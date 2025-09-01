import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from './entities/property.entity';
import { CreatePropertyDto, PropertyStatus } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { GetAllPropertyDto } from './dto/property-response.dto';
import { GetPropertiesDto, PropertyCategory } from './dto/property.dto';
import { ListingType } from './dto/create-property.dto';
import { RenovationRequestDto } from './dto/renovation-request.dto';
import { Rental } from './entities/rental.entity';
@Injectable()
export class PropertyService {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    @InjectRepository(Rental)
    private readonly rentalRepository: Repository<Rental>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(dto: CreatePropertyDto, userId: string) {
    if (dto.listingType === ListingType.SHARES && !dto.pricePerShare) {
      throw new NotFoundException(
        'Price per share is required for shares listing',
      );
    } else if (dto.listingType === ListingType.RENT && !dto.rentalPrice) {
      throw new NotFoundException('Rental price is required for rent listing');
    } else if (dto.listingType === ListingType.SALE) {
      if (!dto.price && !(dto.numberOfUnit && dto.pricePerUnit)) {
        throw new NotFoundException(
          'Price is required for sale listing, or price per unit and total number of units',
        );
      }
    } else if (
      dto.listingType === ListingType.JOINT_VENTURE &&
      !(dto.renovationType || dto.estimatedTimeline || dto.paymentType)
    ) {
      throw new BadRequestException(
        'Renovation type, estimated timeline, and payment type are required for joint ventures listing',
      );
    } else if (
      dto.listingType === ListingType.FLIP &&
      !(dto.price || dto.resaleValue || dto.potentialRoi)
    ) {
      throw new BadRequestException(
        'price, resale value, potential ROI are required for flip listing',
      );
    } else if (
      dto.listingType === ListingType.CO_VEST &&
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

  async renovationRequest(dto: RenovationRequestDto): Promise<Property> {
    const { propertyId, ...mainDto } = dto;
    const property = await this.findOne(propertyId);
    const newDto = { mainDto, listingType: ListingType.JOINT_VENTURE };
    const updated = Object.assign(property, newDto);
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
      message: 'Properties fetched successfully',
      data: {
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

  async getMetrics(userId: string) {
    const qb = this.propertyRepository.createQueryBuilder('property');

    const [totalProperties, soldProperties] = await Promise.all([
      qb.clone().where('property.listedBy = :userId', { userId }).getCount(),
      qb
        .clone()
        .where('property.listedBy = :userId', { userId })
        .andWhere('property.listingType = :listingType', {
          listingType: 'sale',
        })
        .andWhere('property.owner IS NOT NULL')
        .getCount(),
    ]);

    // Get rental properties with active renters
    const rentalPropertiesWithRenters = await this.propertyRepository
      .createQueryBuilder('property')
      .leftJoin('rentals', 'rental', 'rental.propertyId = property.id AND rental.status = :status', { status: 'active' })
      .where('property.listedBy = :userId', { userId })
      .andWhere('property.listingType = :listingType', { listingType: 'rent' })
      .select(['property.id', 'COUNT(rental.id) as renterCount'])
      .groupBy('property.id')
      .getRawMany();

    const rentedProperties = rentalPropertiesWithRenters.filter(p => parseInt(p.renterCount) > 0).length;
    const totalRentalProperties = await qb
      .clone()
      .where('property.listedBy = :userId', { userId })
      .andWhere('property.listingType = :listingType', { listingType: 'rent' })
      .getCount();
    const vacantProperties = totalRentalProperties - rentedProperties;

    return {
      message: 'Properties fetched successfully',
      data: {
        totalProperties,
        soldProperties,
        rentedProperties,
        vacantProperties,
      },
    };
  }

  async getPropertiesByCategory(
    category?: PropertyCategory,
  ): Promise<{ message: string; data: Property[] }> {
    let statuses: PropertyStatus[];

    if (category === PropertyCategory.CATEGORY1) {
      statuses = [
        PropertyStatus.PENDING,
        PropertyStatus.UNDER_REVIEW,
        PropertyStatus.APPROVED,
        PropertyStatus.REJECTED,
      ];
    } else if (category === PropertyCategory.CATEGORY2) {
      statuses = [
        PropertyStatus.CANCELLED,
        PropertyStatus.ONGOING,
        PropertyStatus.COMPLETED,
      ];
    } else {
      // If no category provided, return all joint-venture properties
      const properties = await this.propertyRepository.find({
        where: { listingType: 'joint-venture' },
      });
      return {
        message: 'Properties fetched successfully',
        data: properties,
      };
    }
    const properties = await this.propertyRepository
      .createQueryBuilder('property')
      .where('property.listingType = :listingType', {
        listingType: 'joint-venture',
      })
      .andWhere('property.status IN (:...statuses)', { statuses })
      .getMany();

    return {
      message: 'Properties fetched successfully',
      data: properties,
    };
  }

  async getPropertiesByStatus(
    status: string,
  ): Promise<{ message: string; data: Property }> {
    const property = await this.propertyRepository
      .createQueryBuilder('property')
      .where('property.listingType = :listingType', {
        listingType: 'joint-venture',
      })
      .andWhere('property.status = :status', { status })
      .getOne();

    return {
      message: 'Properties fetched successfully',
      data: property,
    };
  }

  async getPropertyRenters(propertyId: string) {
    const property = await this.findOne(propertyId);
    
    if (property.listingType !== 'rent') {
      throw new BadRequestException('This property is not available for rent');
    }

    const renters = await this.rentalRepository.find({
      where: { propertyId },
      relations: ['user'],
      select: {
        id: true,
        rentAmount: true,
        rentStartDate: true,
        rentEndDate: true,
        status: true,
        createdAt: true,
        user: {
          id: true,
          name: true,
          email: true,
          profilePicture: true,
        },
      },
      order: { createdAt: 'DESC' },
    });

    return {
      message: 'Property renters fetched successfully',
      data: {
        property: {
          id: property.id,
          title: property.title,
          address: property.address,
          rentalPrice: property.rentalPrice,
        },
        totalRenters: renters.length,
        activeRenters: renters.filter(r => r.status === 'active').length,
        renters,
      },
    };
  }
}
