import { 
  Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus 
} from '@nestjs/common';
import { ZonesService } from './zones.service';
import { CreateZoneDto, UpdateZoneDto, CheckLocationDto } from './dto/zone.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Permission } from '@prisma/client';
import { Public } from '../../common/decorators/public.decorator';

@Controller('zones')
export class ZonesController {
  constructor(private readonly zonesService: ZonesService) {}

  @Post()
  @RequirePermissions(Permission.MANAGE_SETTINGS)
  create(@Body() createZoneDto: CreateZoneDto) {
    return this.zonesService.createZone(createZoneDto);
  }
  
  @Get()
  findAll() {
    return this.zonesService.getAllZones();
  }

  @Public()
  @Post('check-location')
  @HttpCode(HttpStatus.OK)
  checkLocation(@Body() checkLocationDto: CheckLocationDto) {
    return this.zonesService.findZoneByLocation(checkLocationDto);
  }

  @RequirePermissions(Permission.MANAGE_SETTINGS)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.zonesService.getZoneById(id);
  }

  @Patch(':id')
  @RequirePermissions(Permission.MANAGE_SETTINGS)
  update(@Param('id') id: string, @Body() updateZoneDto: UpdateZoneDto) {
    return this.zonesService.updateZone(id, updateZoneDto);
  }

  @Delete(':id')
  @RequirePermissions(Permission.MANAGE_SETTINGS)
  remove(@Param('id') id: string) {
    return this.zonesService.deleteZone(id);
  }
}