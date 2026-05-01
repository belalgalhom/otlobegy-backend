import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { VendorVerticalsService } from 'src/features/vendors/verticals/vendor-verticals.service';
import { CreateVendorVerticalDto, UpdateVendorVerticalDto } from 'src/features/vendors/verticals/dto/vendor-vertical.dto';
import { RequirePermissions } from '../../../common/decorators/permissions.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { Permission } from '@prisma/client';

@Controller('vendor-verticals')
export class VendorVerticalsController {
  constructor(private readonly service: VendorVerticalsService) {}

  @Public()
  @Get()
  findAllActive() {
    return this.service.findAllActive();
  }

  @Get('admin')
  @RequirePermissions(Permission.MANAGE_VENDORS)
  findAll() {
    return this.service.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @RequirePermissions(Permission.MANAGE_VENDORS)
  create(@Body() dto: CreateVendorVerticalDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @RequirePermissions(Permission.MANAGE_VENDORS)
  update(@Param('id') id: string, @Body() dto: UpdateVendorVerticalDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(Permission.MANAGE_VENDORS)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}