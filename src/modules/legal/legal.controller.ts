import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { LegalService } from './legal.service';
import { CreateLegalDto } from './dto/create-legal.dto';
import { UpdateLegalDto } from './dto/update-legal.dto';

@Controller('legal')
export class LegalController {
  constructor(private readonly legalService: LegalService) {}

  @Post()
  create(@Body() createLegalDto: CreateLegalDto) {
    return this.legalService.create(createLegalDto);
  }

  @Get()
  findAll() {
    return this.legalService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.legalService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLegalDto: UpdateLegalDto) {
    return this.legalService.update(id, updateLegalDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.legalService.remove(id);
  }
}
