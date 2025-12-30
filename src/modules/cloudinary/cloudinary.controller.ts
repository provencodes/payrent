import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import {
  ApiConsumes,
  ApiBody,
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { DeleteDto } from './dto/cloudinary.dto';
import {
  UploadImagesResponseDto,
  DeleteImageResponseDto,
} from './dto/cloudinary-response.dto';
import {
  BadRequestErrorDto,
  UnauthorizedErrorDto,
} from '../../shared/dto/error-response.dto';

@ApiBearerAuth()
@ApiTags('Uploads')
@Controller('uploads')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('images')
  @UseInterceptors(FilesInterceptor('images', 5))
  @ApiOperation({ summary: 'Upload up to 5 images' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Array of image files (max 5)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Images uploaded successfully',
    type: UploadImagesResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid file format or upload failed',
    type: BadRequestErrorDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedErrorDto,
  })
  async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    const uploaded = await this.cloudinaryService.uploadMultipleImages(files);
    return {
      Status: 201,
      Message: 'Images uploaded successfully',
      Data: uploaded.map((file) => ({
        url: file.secure_url,
        public_id: file.public_id,
      })),
    };
  }

  @Post('delete')
  @ApiOperation({ summary: 'Delete an image or file' })
  @ApiBody({
    description: 'Delete an image by public_id',
    type: DeleteDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Image deleted successfully',
    type: DeleteImageResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid public_id or deletion failed',
    type: BadRequestErrorDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedErrorDto,
  })
  async deleteOne(@Body() dto: DeleteDto) {
    return await this.cloudinaryService.deleteOne(dto);
  }
}
