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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('Vendors - Core Management')
@Controller('vendors')
export class VendorsController {
  constructor(private readonly service: VendorsService) {}

  // ─── Public ───────────────────────────────────────────────────────────────

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all vendors with filters' })
  @ApiResponse({ status: 200, description: 'List of vendors returned' })
  findAll(@Query() dto: QueryVendorsDto) {
    return this.service.findAll(dto);
  }

  @Public()
  @Get('by-slug/:slug')
  @ApiOperation({ summary: 'Find a vendor by its slug' })
  @ApiResponse({ status: 200, description: 'Vendor returned' })
  @ApiResponse({ status: 404, description: 'Vendor not found' })
  findBySlug(@Param('slug') slug: string) {
    return this.service.findBySlug(slug);
  }

  @Public()
  @Get(':vendorId')
  @ApiOperation({ summary: 'Get a specific vendor by ID' })
  @ApiResponse({ status: 200, description: 'Vendor returned' })
  @ApiResponse({ status: 404, description: 'Vendor not found' })
  findOne(@Param('vendorId') vendorId: string) {
    return this.service.findOne(vendorId);
  }

  // ─── Admin ────────────────────────────────────────────────────────────────

  @Post()
  @ApiBearerAuth()
  @RequirePermissions(Permission.MANAGE_VENDORS)
  @ApiOperation({ summary: 'Create a new vendor (Admin)' })
  @ApiResponse({ status: 201, description: 'Vendor created successfully' })
  create(@Body() dto: CreateVendorDto) {
    return this.service.create(dto);
  }

  @Patch(':vendorId')
  @ApiBearerAuth()
  @RequirePermissions(Permission.MANAGE_VENDORS)
  @ApiOperation({ summary: 'Update vendor information (Admin)' })
  @ApiResponse({ status: 200, description: 'Vendor updated successfully' })
  update(@Param('vendorId') vendorId: string, @Body() dto: UpdateVendorDto) {
    return this.service.update(vendorId, dto);
  }

  @Patch(':vendorId/status')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @RequirePermissions(Permission.MANAGE_VENDORS)
  @ApiOperation({ summary: 'Update vendor status (Admin)' })
  @ApiResponse({ status: 200, description: 'Vendor status updated successfully' })
  updateStatus(
    @Param('vendorId') vendorId: string,
    @Body() dto: UpdateVendorStatusDto,
  ) {
    return this.service.updateStatus(vendorId, dto);
  }

  @Post(':vendorId/logo')
  @ApiBearerAuth()
  @RequirePermissions(Permission.MANAGE_VENDORS)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Upload vendor logo image' })
  @ApiResponse({ status: 201, description: 'Logo uploaded successfully' })
  uploadLogo(
    @Param('vendorId') vendorId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.service.uploadLogo(vendorId, file);
  }

  @Post(':vendorId/cover')
  @ApiBearerAuth()
  @RequirePermissions(Permission.MANAGE_VENDORS)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Upload vendor cover image' })
  @ApiResponse({ status: 201, description: 'Cover uploaded successfully' })
  uploadCover(
    @Param('vendorId') vendorId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.service.uploadCover(vendorId, file);
  }

  @Delete(':vendorId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @RequirePermissions(Permission.MANAGE_VENDORS)
  @ApiOperation({ summary: 'Delete a vendor (Admin)' })
  @ApiResponse({ status: 200, description: 'Vendor deleted successfully' })
  remove(@Param('vendorId') vendorId: string) {
    return this.service.remove(vendorId);
  }

  // ─── Vendor member self-view ──────────────────────────────────────────────
  // Members can view their own vendor's profile without admin permissions.

  @Get(':vendorId/me')
  @ApiBearerAuth()
  @VendorMember()
  @ApiOperation({ summary: 'Get my vendor profile (Member)' })
  @ApiResponse({ status: 200, description: 'Vendor profile returned' })
  getMyVendor(@Param('vendorId') vendorId: string) {
    return this.service.findOne(vendorId);
  }
}
