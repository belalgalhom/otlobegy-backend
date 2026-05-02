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
} from '@nestjs/common';
import { MenuCategoriesService } from './menu-categories.service';
import {
  CreateMenuCategoryDto,
  UpdateMenuCategoryDto,
  ReorderCategoriesDto,
} from './dto/menu-category.dto';
import { VendorMember } from '../../../common/decorators/vendor-member.decorator';
import { RequirePermissions } from '../../../common/decorators/permissions.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { Permission, VendorMemberRole } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Vendors - Menu Categories')
@Controller('vendors/:vendorId/categories')
export class MenuCategoriesController {
  constructor(private readonly service: MenuCategoriesService) {}

  // ─── Public ───────────────────────────────────────────────────────────────
  // Customers need to browse vendor menus without authentication.

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all menu categories for a vendor' })
  @ApiQuery({ name: 'activeOnly', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'List of categories returned' })
  findAll(
    @Param('vendorId') vendorId: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    return this.service.findAll(vendorId, activeOnly === 'true');
  }

  @Public()
  @Get(':categoryId')
  @ApiOperation({ summary: 'Get a specific menu category by ID' })
  @ApiResponse({ status: 200, description: 'Category returned' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  findOne(
    @Param('vendorId') vendorId: string,
    @Param('categoryId') categoryId: string,
  ) {
    return this.service.findOne(vendorId, categoryId);
  }

  // ─── Vendor member: OWNER or MANAGER ─────────────────────────────────────

  @Post()
  @ApiBearerAuth()
  @VendorMember({ roles: [VendorMemberRole.OWNER, VendorMemberRole.MANAGER] })
  @ApiOperation({ summary: 'Create a new menu category (Member)' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  create(
    @Param('vendorId') vendorId: string,
    @Body() dto: CreateMenuCategoryDto,
  ) {
    return this.service.create(vendorId, dto);
  }

  @Patch('reorder')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @VendorMember({ roles: [VendorMemberRole.OWNER, VendorMemberRole.MANAGER] })
  @ApiOperation({ summary: 'Reorder menu categories' })
  @ApiResponse({ status: 200, description: 'Categories reordered successfully' })
  reorder(
    @Param('vendorId') vendorId: string,
    @Body() dto: ReorderCategoriesDto,
  ) {
    return this.service.reorder(vendorId, dto);
  }

  @Patch(':categoryId')
  @ApiBearerAuth()
  @VendorMember({ roles: [VendorMemberRole.OWNER, VendorMemberRole.MANAGER] })
  @ApiOperation({ summary: 'Update a menu category (Member)' })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  update(
    @Param('vendorId') vendorId: string,
    @Param('categoryId') categoryId: string,
    @Body() dto: UpdateMenuCategoryDto,
  ) {
    return this.service.update(vendorId, categoryId, dto);
  }

  @Delete(':categoryId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @VendorMember({ roles: [VendorMemberRole.OWNER, VendorMemberRole.MANAGER] })
  @ApiOperation({ summary: 'Delete a menu category (Member)' })
  @ApiResponse({ status: 200, description: 'Category removed successfully' })
  remove(
    @Param('vendorId') vendorId: string,
    @Param('categoryId') categoryId: string,
  ) {
    return this.service.remove(vendorId, categoryId);
  }

  // ─── Admin overrides ──────────────────────────────────────────────────────

  @Post('admin')
  @ApiBearerAuth()
  @RequirePermissions(Permission.MANAGE_PRODUCTS)
  @ApiOperation({ summary: 'Create a new menu category (Admin Override)' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  adminCreate(
    @Param('vendorId') vendorId: string,
    @Body() dto: CreateMenuCategoryDto,
  ) {
    return this.service.create(vendorId, dto);
  }

  @Patch('admin/:categoryId')
  @ApiBearerAuth()
  @RequirePermissions(Permission.MANAGE_PRODUCTS)
  @ApiOperation({ summary: 'Update a menu category (Admin Override)' })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  adminUpdate(
    @Param('vendorId') vendorId: string,
    @Param('categoryId') categoryId: string,
    @Body() dto: UpdateMenuCategoryDto,
  ) {
    return this.service.update(vendorId, categoryId, dto);
  }

  @Delete('admin/:categoryId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @RequirePermissions(Permission.MANAGE_PRODUCTS)
  @ApiOperation({ summary: 'Delete a menu category (Admin Override)' })
  @ApiResponse({ status: 200, description: 'Category removed successfully' })
  adminRemove(
    @Param('vendorId') vendorId: string,
    @Param('categoryId') categoryId: string,
  ) {
    return this.service.remove(vendorId, categoryId);
  }
}
