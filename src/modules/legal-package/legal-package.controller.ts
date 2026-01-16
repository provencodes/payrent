import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { LegalPackageService } from './legal-package.service';
import { CreateLegalPackageDto } from './dto/create-legal-package.dto';
import { UpdateLegalPackageDto } from './dto/update-legal-package.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Legal Packages')
@ApiBearerAuth()
@Controller('legal-packages')
export class LegalPackageController {
  constructor(private readonly legalPackageService: LegalPackageService) { }

  @Post()
  create(@Body() createLegalPackageDto: CreateLegalPackageDto) {
    return this.legalPackageService.create(createLegalPackageDto);
  }

  @Get()
  findAll() {
    return this.legalPackageService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.legalPackageService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLegalPackageDto: UpdateLegalPackageDto) {
    return this.legalPackageService.update(id, updateLegalPackageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.legalPackageService.remove(id);
  }
}
