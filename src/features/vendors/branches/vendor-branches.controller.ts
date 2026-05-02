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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Vendors - Branches')
@Controller('vendors/:vendorId/branches')
export class VendorBranchesController {
  constructor(private readonly service: VendorBranchesService) {}

  // Public — customers need to see branch locations.
  @Public()
  @Get()
  @ApiOperation({ summary: 'List all branches for a vendor' })
  @ApiResponse({ status: 200, description: 'List of branches returned' })
  findAll(@Param('vendorId') vendorId: string) {
    return this.service.findAll(vendorId);
  }

  @Public()
  @Get(':branchId')
  @ApiOperation({ summary: 'Get a specific branch by ID' })
  @ApiResponse({ status: 200, description: 'Branch returned' })
  @ApiResponse({ status: 404, description: 'Branch not found' })
  findOne(
    @Param('vendorId') vendorId: string,
    @Param('branchId') branchId: string,
  ) {
    return this.service.findOne(vendorId, branchId);
  }

  // OWNER or MANAGER can create/update/delete branches.
  @Post()
  @ApiBearerAuth()
  @VendorMember({ roles: [VendorMemberRole.OWNER, VendorMemberRole.MANAGER] })
  @ApiOperation({ summary: 'Create a new branch (Member)' })
  @ApiResponse({ status: 201, description: 'Branch created successfully' })
  create(
    @Param('vendorId') vendorId: string,
    @Body() dto: CreateVendorBranchDto,
  ) {
    return this.service.create(vendorId, dto);
  }

  @Patch(':branchId')
  @ApiBearerAuth()
  @VendorMember({ roles: [VendorMemberRole.OWNER, VendorMemberRole.MANAGER] })
  @ApiOperation({ summary: 'Update a branch (Member)' })
  @ApiResponse({ status: 200, description: 'Branch updated successfully' })
  update(
    @Param('vendorId') vendorId: string,
    @Param('branchId') branchId: string,
    @Body() dto: UpdateVendorBranchDto,
  ) {
    return this.service.update(vendorId, branchId, dto);
  }

  @Delete(':branchId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @VendorMember({ roles: [VendorMemberRole.OWNER, VendorMemberRole.MANAGER] })
  @ApiOperation({ summary: 'Delete a branch (Member)' })
  @ApiResponse({ status: 200, description: 'Branch deleted successfully' })
  remove(
    @Param('vendorId') vendorId: string,
    @Param('branchId') branchId: string,
  ) {
    return this.service.remove(vendorId, branchId);
  }

  // Admin override — full access without membership.
  @Post('admin')
  @ApiBearerAuth()
  @RequirePermissions(Permission.MANAGE_VENDORS)
  @ApiOperation({ summary: 'Create a new branch (Admin Override)' })
  @ApiResponse({ status: 201, description: 'Branch created successfully' })
  adminCreate(
    @Param('vendorId') vendorId: string,
    @Body() dto: CreateVendorBranchDto,
  ) {
    return this.service.create(vendorId, dto);
  }

  @Patch('admin/:branchId')
  @ApiBearerAuth()
  @RequirePermissions(Permission.MANAGE_VENDORS)
  @ApiOperation({ summary: 'Update a branch (Admin Override)' })
  @ApiResponse({ status: 200, description: 'Branch updated successfully' })
  adminUpdate(
    @Param('vendorId') vendorId: string,
    @Param('branchId') branchId: string,
    @Body() dto: UpdateVendorBranchDto,
  ) {
    return this.service.update(vendorId, branchId, dto);
  }

  @Delete('admin/:branchId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @RequirePermissions(Permission.MANAGE_VENDORS)
  @ApiOperation({ summary: 'Delete a branch (Admin Override)' })
  @ApiResponse({ status: 200, description: 'Branch deleted successfully' })
  adminRemove(
    @Param('vendorId') vendorId: string,
    @Param('branchId') branchId: string,
  ) {
    return this.service.remove(vendorId, branchId);
  }
}
