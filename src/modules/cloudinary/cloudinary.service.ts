import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';
import { DeleteDto } from './dto/cloudinary.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Property } from '../property/entities/property.entity';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Legal } from '../legal/entities/legal.entity';

@Injectable()
export class CloudinaryService {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Legal)
    private readonly legalRepository: Repository<Legal>,
  ) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadImage(
    buffer: Buffer,
    folder = 'property-images',
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder },
        (error, result) => {
          if (error) return reject(error);
          return resolve(result);
        },
      );

      const readable = new Readable();
      readable.push(buffer);
      readable.push(null);
      readable.pipe(uploadStream);
    });
  }

  async uploadMultipleImages(
    files: Express.Multer.File[],
    folder = 'property-images',
  ) {
    const uploadPromises = files.map((file) =>
      this.uploadImage(file.buffer, folder),
    );
    return Promise.all(uploadPromises); // Returns array of UploadApiResponse
  }

  async deleteFile(publicId: string): Promise<{ result: string }> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) return reject(error);
        return resolve(result);
      });
    });
  }

  async deleteMultipleImages(
    publicIds: string[],
  ): Promise<{ result: string }[]> {
    const deletePromises = publicIds.map((id) => this.deleteFile(id));
    return Promise.all(deletePromises);
  }

  async deleteOne(dto: DeleteDto) {
    const { entity, id, publicId, entityFieldName } = dto;

    let repository;

    // Determine the correct repository based on the entity type
    switch (entity) {
      case 'property':
        repository = this.propertyRepository;
        break;
      case 'user':
        repository = this.userRepository;
        break;
      case 'legal':
        repository = this.legalRepository;
        break;
      default:
        throw new BadRequestException(`Invalid entity: ${entity}`);
    }

    // Fetch the record
    const record = await repository.findOne({ where: { id } });
    if (!record) {
      throw new NotFoundException(`${entity} with id ${id} not found`);
    }

    // Validate the field exists on the entity
    if (!record[entityFieldName]) {
      throw new BadRequestException(
        `Field ${entityFieldName} does not exist on ${entity}`,
      );
    }

    // Filter out the file with the specified publicId
    const updatedFiles = record[entityFieldName]?.filter(
      (file) => file.publicId !== publicId,
    );

    const fileExists = record[entityFieldName]?.length !== updatedFiles?.length;

    if (!fileExists) {
      throw new NotFoundException(
        `File with publicId ${publicId} not found in ${entityFieldName}`,
      );
    }

    // Update the record with the new file list
    await repository.update(id, { [entityFieldName]: updatedFiles });

    // Delete the file from Cloudinary
    await this.deleteFile(publicId);

    return {
      message: `File with publicId ${publicId} removed from ${entity}.${entityFieldName} and deleted from Cloudinary.`,
    };
  }
}
