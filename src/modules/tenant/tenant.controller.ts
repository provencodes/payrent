import { Controller, Post, Body, Request } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { SaveRentDto } from './dto/tenant.dto';

@Controller('tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post('save-rent')
  saveRent(@Body() saveRentDto: SaveRentDto, @Request() req) {
    return this.tenantService.create(saveRentDto, req.user.id);
  }

  @Post('save-rent')
  saveVest(@Body() saveRentDto: SaveRentDto, @Request() req) {
    return this.tenantService.create(saveRentDto, req.user.id);
  }

  // @Get()
  // findAll() {
  //   return this.tenantService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.tenantService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateTenantDto: UpdateTenantDto) {
  //   return this.tenantService.update(+id, updateTenantDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.tenantService.remove(+id);
  // }
}
