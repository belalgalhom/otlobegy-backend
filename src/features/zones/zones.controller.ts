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
} from '@nestjs/common';
import { ZonesService } from './zones.service';
import { CreateZoneDto, UpdateZoneDto, CheckLocationDto } from './dto/zone.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Permission } from '@prisma/client';
import { Public } from '../../common/decorators/public.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Logistics - Zones')
@Controller('zones')
export class ZonesController {
  constructor(private readonly zonesService: ZonesService) {}

  @Post()
  @ApiBearerAuth()
  @RequirePermissions(Permission.MANAGE_SETTINGS)
  @ApiOperation({ summary: 'Create a new delivery zone' })
  @ApiResponse({ status: 201, description: 'Zone created successfully' })
  create(@Body() createZoneDto: CreateZoneDto) {
    return this.zonesService.createZone(createZoneDto);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all delivery zones' })
  @ApiResponse({ status: 200, description: 'List of zones returned' })
  findAll() {
    return this.zonesService.getAllZones();
  }

  @Public()
  @Post('check-location')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Find zone by coordinates' })
  @ApiResponse({ status: 200, description: 'Zone found (or null)' })
  checkLocation(@Body() checkLocationDto: CheckLocationDto) {
    return this.zonesService.findZoneByLocation(checkLocationDto);
  }

  @Get(':id')
  @ApiBearerAuth()
  @RequirePermissions(Permission.MANAGE_SETTINGS)
  @ApiOperation({ summary: 'Get a specific zone by ID' })
  @ApiResponse({ status: 200, description: 'Zone returned' })
  @ApiResponse({ status: 404, description: 'Zone not found' })
  findOne(@Param('id') id: string) {
    return this.zonesService.getZoneById(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @RequirePermissions(Permission.MANAGE_SETTINGS)
  @ApiOperation({ summary: 'Update a delivery zone' })
  @ApiResponse({ status: 200, description: 'Zone updated successfully' })
  update(@Param('id') id: string, @Body() updateZoneDto: UpdateZoneDto) {
    return this.zonesService.updateZone(id, updateZoneDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @RequirePermissions(Permission.MANAGE_SETTINGS)
  @ApiOperation({ summary: 'Delete a delivery zone' })
  @ApiResponse({ status: 200, description: 'Zone removed successfully' })
  remove(@Param('id') id: string) {
    return this.zonesService.deleteZone(id);
  }
}
