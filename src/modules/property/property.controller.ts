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
  // UseInterceptors,
  // UploadedFiles,
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
  // ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Property } from './entities/property.entity';
// import { FilesInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
// import { fileFilter, multerOptions } from '../../utils/multer.config';
import {
  GetAllPropertyDto,
  PropertyResponseDto,
} from './dto/property-response.dto';
import { FilterPropertyDto, GetPropertiesDto } from './dto/property.dto';
import { RenovationRequestDto } from './dto/renovation-request.dto';

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

  @Get('metrics')
  async getMetrics(@Request() req) {
    return this.propertyService.getMetrics(req.user.sub);
  }

  @Get('filter')
  async getAll(@Query() query: GetPropertiesDto) {
    return this.propertyService.getAllProperties(query);
  }

  @Get('rentals')
  @ApiOperation({ summary: 'Get available rental properties' })
  @ApiResponse({
    status: 200,
    description: 'Available rental properties found',
    type: [Property],
  })
  async getRentalProperties(@Query() query: GetPropertiesDto) {
    return this.propertyService.getRentalProperties(query);
  }

  @Get('joint-ventures')
  @ApiOperation({ summary: 'Get joint-venture property by status' })
  @ApiResponse({
    status: 200,
    description: 'joint venture property by status found',
    type: [Property],
  })
  async getProperties(@Query() filterDto: FilterPropertyDto) {
    return this.propertyService.getPropertiesByCategory(filterDto.category);
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

  @Get(':id/renters')
  @ApiOperation({ summary: 'Get list of renters for a rental property' })
  @ApiResponse({
    status: 200,
    description: 'List of property renters',
  })
  async getPropertyRenters(@Param('id') id: string) {
    return this.propertyService.getPropertyRenters(id);
  }

  @Patch('renovation-request')
  @ApiOperation({ summary: 'Make a renovation request' })
  @ApiBody({
    description: 'Update property to joint ventures',
    type: RenovationRequestDto,
  })
  @ApiResponse({ status: 200, description: 'Property updated', type: Property })
  async jointVentureRequest(
    @Body() renovationRequestDto: RenovationRequestDto,
  ): Promise<Property> {
    return this.propertyService.renovationRequest(renovationRequestDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a property' })
  @ApiBody({
    description: 'Update property',
    type: UpdatePropertyDto,
  })
  @ApiResponse({ status: 200, description: 'Property updated', type: Property })
  async update(
    @Param('id') id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
  ): Promise<{ message: string; data: Property }> {
    const updatedProperty = await this.propertyService.update(
      id,
      updatePropertyDto,
    );
    return {
      message: 'Property updated successfully',
      data: updatedProperty,
    };
  }

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
