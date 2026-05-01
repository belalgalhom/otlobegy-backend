import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VendorsService } from './vendors.service';
import {
  CreateVendorDto,
  UpdateVendorDto,
  UpdateVendorStatusDto,
  QueryVendorsDto,
} from './dto/vendor.dto';
import { RequirePermissions } from 'src/common/decorators/permissions.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { VendorMember } from 'src/common/decorators/vendor-member.decorator';
import { Permission } from '@prisma/client';

@Controller('vendors')
export class VendorsController {
  constructor(private readonly service: VendorsService) {}

  // ─── Public ───────────────────────────────────────────────────────────────

  @Public()
  @Get()
  findAll(@Query() dto: QueryVendorsDto) {
    return this.service.findAll(dto);
  }

  @Public()
  @Get('by-slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.service.findBySlug(slug);
  }

  @Public()
  @Get(':vendorId')
  findOne(@Param('vendorId') vendorId: string) {
    return this.service.findOne(vendorId);
  }

  // ─── Admin ────────────────────────────────────────────────────────────────

  @Post()
  @RequirePermissions(Permission.MANAGE_VENDORS)
  create(@Body() dto: CreateVendorDto) {
    return this.service.create(dto);
  }

  @Patch(':vendorId')
  @RequirePermissions(Permission.MANAGE_VENDORS)
  update(@Param('vendorId') vendorId: string, @Body() dto: UpdateVendorDto) {
    return this.service.update(vendorId, dto);
  }

  @Patch(':vendorId/status')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(Permission.MANAGE_VENDORS)
  updateStatus(
    @Param('vendorId') vendorId: string,
    @Body() dto: UpdateVendorStatusDto,
  ) {
    return this.service.updateStatus(vendorId, dto);
  }

  @Post(':vendorId/logo')
  @RequirePermissions(Permission.MANAGE_VENDORS)
  @UseInterceptors(FileInterceptor('file'))
  uploadLogo(
    @Param('vendorId') vendorId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.service.uploadLogo(vendorId, file);
  }

  @Post(':vendorId/cover')
  @RequirePermissions(Permission.MANAGE_VENDORS)
  @UseInterceptors(FileInterceptor('file'))
  uploadCover(
    @Param('vendorId') vendorId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.service.uploadCover(vendorId, file);
  }

  @Delete(':vendorId')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(Permission.MANAGE_VENDORS)
  remove(@Param('vendorId') vendorId: string) {
    return this.service.remove(vendorId);
  }

  // ─── Vendor member self-view ──────────────────────────────────────────────
  // Members can view their own vendor's profile without admin permissions.

  @Get(':vendorId/me')
  @VendorMember()
  getMyVendor(@Param('vendorId') vendorId: string) {
    return this.service.findOne(vendorId);
  }
}
