import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFiles,
  Query,
  Request,
} from '@nestjs/common';
import { PropertyService } from './property.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Property } from './entities/property.entity';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { fileFilter, multerOptions } from '../../utils/multer.config';
import {
  GetAllPropertyDto,
  PropertyResponseDto,
} from './dto/property-response.dto';
import { GetPropertiesDto } from './dto/property.dto';

@ApiBearerAuth()
@ApiTags('Properties')
@Controller('properties')
export class PropertyController {
  constructor(
    private readonly propertyService: PropertyService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new property listing' })
  @ApiBody({
    description: 'Create property with all details',
    type: CreatePropertyDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Property created successfully',
    type: Property,
  })
  async create(
    @Body() createPropertyDto: CreatePropertyDto,
    @Request() req,
  ): Promise<PropertyResponseDto> {
    return this.propertyService.create(createPropertyDto, req.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Get all property listings' })
  @ApiResponse({
    status: 200,
    description: 'List of properties',
    example: GetAllPropertyDto,
    type: GetAllPropertyDto,
  })
  async findAll(): Promise<GetAllPropertyDto> {
    return this.propertyService.findAll();
  }

  @Get('filter')
  async getAll(@Query() query: GetPropertiesDto) {
    return this.propertyService.getAllProperties(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get property by ID' })
  @ApiResponse({
    status: 200,
    description: 'Single property found',
    type: Property,
  })
  async findOne(@Param('id') id: string): Promise<Property> {
    return this.propertyService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a property' })
  @UseInterceptors(
    FilesInterceptor('images', 5, {
      ...multerOptions,
      fileFilter,
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Update property with optional new images',
    type: UpdatePropertyDto,
  })
  @ApiResponse({ status: 200, description: 'Property updated', type: Property })
  async update(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() updatePropertyDto: UpdatePropertyDto,
  ): Promise<Property> {
    let newImages = [];
    if (files && files.length > 0) {
      // Optionally delete old images
      // const existing = await this.propertyService.findOne(id);
      // const publicIds = existing.images?.map((i) => i.public_id) || [];
      // if (publicIds.length) {
      //   await this.cloudinaryService.deleteMultipleImages(publicIds);
      // }

      const uploads = await this.cloudinaryService.uploadMultipleImages(files);
      newImages = uploads.map((u) => ({
        url: u.secure_url,
        public_id: u.public_id,
      }));
    }

    return this.propertyService.update(id, {
      ...updatePropertyDto,
      ...(newImages.length > 0 && { images: newImages }),
    });
  }
  // return this.propertyService.update(id, updatePropertyDto);

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a property' })
  @ApiResponse({ status: 204, description: 'Property deleted' })
  async remove(@Param('id') id: string): Promise<{
    status: 200;
    message: string;
  }> {
    return this.propertyService.remove(id);
  }
}
