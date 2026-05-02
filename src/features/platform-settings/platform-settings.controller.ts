import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PlatformSettingsService } from './platform-settings.service';
import {
  UpdatePlatformSettingsDto,
  AppVersionCheckDto,
} from './dto/platform-settings.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Permission } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Platform - Settings & Versioning')
@Controller('platform-settings')
export class PlatformSettingsController {
  constructor(private readonly service: PlatformSettingsService) {}

  // ─── Public ───────────────────────────────────────────────────────────────
  // Mobile clients need maintenance mode + app versions on startup.

  @Public()
  @Get('public')
  @ApiOperation({ summary: 'Get public platform settings (maintenance mode, versions)' })
  @ApiResponse({ status: 200, description: 'Public settings returned' })
  getPublic() {
    return this.service.getPublicSettings();
  }

  @Public()
  @Post('app-version-check')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check if app version is supported' })
  @ApiResponse({ status: 200, description: 'Version status returned' })
  checkVersion(@Body() dto: AppVersionCheckDto) {
    return this.service.checkAppVersion(dto);
  }

  // ─── Admin ────────────────────────────────────────────────────────────────
  // Full settings read requires MANAGE_SETTINGS permission.

  @Get()
  @ApiBearerAuth()
  @RequirePermissions(Permission.MANAGE_SETTINGS)
  @ApiOperation({ summary: 'Get all platform settings (Admin)' })
  @ApiResponse({ status: 200, description: 'All settings returned' })
  getAll() {
    return this.service.getSettings();
  }

  @Patch()
  @ApiBearerAuth()
  @RequirePermissions(Permission.MANAGE_SETTINGS)
  @ApiOperation({ summary: 'Update platform settings (Admin)' })
  @ApiResponse({ status: 200, description: 'Settings updated successfully' })
  update(@Body() dto: UpdatePlatformSettingsDto) {
    return this.service.updateSettings(dto);
  }
}
