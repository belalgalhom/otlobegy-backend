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
import { VendorBranchesService } from './vendor-branches.service';
import {
  CreateVendorBranchDto,
  UpdateVendorBranchDto,
} from './dto/vendor-branch.dto';
import { VendorMember } from '../../../common/decorators/vendor-member.decorator';
import { RequirePermissions } from '../../../common/decorators/permissions.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { Permission, VendorMemberRole } from '@prisma/client';

@Controller('vendors/:vendorId/branches')
export class VendorBranchesController {
  constructor(private readonly service: VendorBranchesService) {}

  // Public — customers need to see branch locations.
  @Public()
  @Get()
  findAll(@Param('vendorId') vendorId: string) {
    return this.service.findAll(vendorId);
  }

  @Public()
  @Get(':branchId')
  findOne(
    @Param('vendorId') vendorId: string,
    @Param('branchId') branchId: string,
  ) {
    return this.service.findOne(vendorId, branchId);
  }

  // OWNER or MANAGER can create/update/delete branches.
  @Post()
  @VendorMember({ roles: [VendorMemberRole.OWNER, VendorMemberRole.MANAGER] })
  create(
    @Param('vendorId') vendorId: string,
    @Body() dto: CreateVendorBranchDto,
  ) {
    return this.service.create(vendorId, dto);
  }

  @Patch(':branchId')
  @VendorMember({ roles: [VendorMemberRole.OWNER, VendorMemberRole.MANAGER] })
  update(
    @Param('vendorId') vendorId: string,
    @Param('branchId') branchId: string,
    @Body() dto: UpdateVendorBranchDto,
  ) {
    return this.service.update(vendorId, branchId, dto);
  }

  @Delete(':branchId')
  @HttpCode(HttpStatus.OK)
  @VendorMember({ roles: [VendorMemberRole.OWNER, VendorMemberRole.MANAGER] })
  remove(
    @Param('vendorId') vendorId: string,
    @Param('branchId') branchId: string,
  ) {
    return this.service.remove(vendorId, branchId);
  }

  // Admin override — full access without membership.
  @Post('admin')
  @RequirePermissions(Permission.MANAGE_VENDORS)
  adminCreate(
    @Param('vendorId') vendorId: string,
    @Body() dto: CreateVendorBranchDto,
  ) {
    return this.service.create(vendorId, dto);
  }

  @Patch('admin/:branchId')
  @RequirePermissions(Permission.MANAGE_VENDORS)
  adminUpdate(
    @Param('vendorId') vendorId: string,
    @Param('branchId') branchId: string,
    @Body() dto: UpdateVendorBranchDto,
  ) {
    return this.service.update(vendorId, branchId, dto);
  }

  @Delete('admin/:branchId')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(Permission.MANAGE_VENDORS)
  adminRemove(
    @Param('vendorId') vendorId: string,
    @Param('branchId') branchId: string,
  ) {
    return this.service.remove(vendorId, branchId);
  }
}
