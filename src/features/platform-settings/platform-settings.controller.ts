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

@Controller('platform-settings')
export class PlatformSettingsController {
  constructor(private readonly service: PlatformSettingsService) {}

  // ─── Public ───────────────────────────────────────────────────────────────
  // Mobile clients need maintenance mode + app versions on startup.

  @Public()
  @Get('public')
  getPublic() {
    return this.service.getPublicSettings();
  }

  @Public()
  @Post('app-version-check')
  @HttpCode(HttpStatus.OK)
  checkVersion(@Body() dto: AppVersionCheckDto) {
    return this.service.checkAppVersion(dto);
  }

  // ─── Admin ────────────────────────────────────────────────────────────────
  // Full settings read requires MANAGE_SETTINGS permission.

  @Get()
  @RequirePermissions(Permission.MANAGE_SETTINGS)
  getAll() {
    return this.service.getSettings();
  }

  @Patch()
  @RequirePermissions(Permission.MANAGE_SETTINGS)
  update(@Body() dto: UpdatePlatformSettingsDto) {
    return this.service.updateSettings(dto);
  }
}
