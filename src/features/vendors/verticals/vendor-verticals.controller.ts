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
import {
  CreateVendorVerticalDto,
  UpdateVendorVerticalDto,
} from 'src/features/vendors/verticals/dto/vendor-vertical.dto';
import { RequirePermissions } from '../../../common/decorators/permissions.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { Permission } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Vendors - Verticals (Categories)')
@Controller('vendor-verticals')
export class VendorVerticalsController {
  constructor(private readonly service: VendorVerticalsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all active vendor verticals' })
  @ApiResponse({ status: 200, description: 'List of active verticals returned' })
  findAllActive() {
    return this.service.findAllActive();
  }

  @Get('admin')
  @ApiBearerAuth()
  @RequirePermissions(Permission.MANAGE_VENDORS)
  @ApiOperation({ summary: 'Get all vendor verticals (Admin)' })
  @ApiResponse({ status: 200, description: 'List of all verticals returned' })
  findAll() {
    return this.service.findAll();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a specific vendor vertical by ID' })
  @ApiResponse({ status: 200, description: 'Vertical returned' })
  @ApiResponse({ status: 404, description: 'Vertical not found' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiBearerAuth()
  @RequirePermissions(Permission.MANAGE_VENDORS)
  @ApiOperation({ summary: 'Create a new vendor vertical (Admin)' })
  @ApiResponse({ status: 201, description: 'Vertical created successfully' })
  create(@Body() dto: CreateVendorVerticalDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @RequirePermissions(Permission.MANAGE_VENDORS)
  @ApiOperation({ summary: 'Update a vendor vertical (Admin)' })
  @ApiResponse({ status: 200, description: 'Vertical updated successfully' })
  update(@Param('id') id: string, @Body() dto: UpdateVendorVerticalDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @RequirePermissions(Permission.MANAGE_VENDORS)
  @ApiOperation({ summary: 'Delete a vendor vertical (Admin)' })
  @ApiResponse({ status: 200, description: 'Vertical deleted successfully' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
