import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { ApiConsumes, ApiBody, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DeleteDto } from './dto/cloudinary.dto';
// import { diskStorage } from 'multer';

@ApiBearerAuth()
@ApiTags('Uploads')
@Controller('uploads')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('images')
  @UseInterceptors(FilesInterceptor('images', 5))
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
        },
      },
    },
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

  @ApiBody({
    description: 'Delete an image or file',
    type: DeleteDto,
  })
  @Post('delete')
  async deleteOne(@Body() dto: DeleteDto) {
    return await this.cloudinaryService.deleteOne(dto);
  }
}
