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

@Controller('vendors/:vendorId/categories')
export class MenuCategoriesController {
  constructor(private readonly service: MenuCategoriesService) {}

  // ─── Public ───────────────────────────────────────────────────────────────
  // Customers need to browse vendor menus without authentication.

  @Public()
  @Get()
  findAll(
    @Param('vendorId') vendorId: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    return this.service.findAll(vendorId, activeOnly === 'true');
  }

  @Public()
  @Get(':categoryId')
  findOne(
    @Param('vendorId') vendorId: string,
    @Param('categoryId') categoryId: string,
  ) {
    return this.service.findOne(vendorId, categoryId);
  }

  // ─── Vendor member: OWNER or MANAGER ─────────────────────────────────────

  @Post()
  @VendorMember({ roles: [VendorMemberRole.OWNER, VendorMemberRole.MANAGER] })
  create(
    @Param('vendorId') vendorId: string,
    @Body() dto: CreateMenuCategoryDto,
  ) {
    return this.service.create(vendorId, dto);
  }

  @Patch('reorder')
  @HttpCode(HttpStatus.OK)
  @VendorMember({ roles: [VendorMemberRole.OWNER, VendorMemberRole.MANAGER] })
  reorder(
    @Param('vendorId') vendorId: string,
    @Body() dto: ReorderCategoriesDto,
  ) {
    return this.service.reorder(vendorId, dto);
  }

  @Patch(':categoryId')
  @VendorMember({ roles: [VendorMemberRole.OWNER, VendorMemberRole.MANAGER] })
  update(
    @Param('vendorId') vendorId: string,
    @Param('categoryId') categoryId: string,
    @Body() dto: UpdateMenuCategoryDto,
  ) {
    return this.service.update(vendorId, categoryId, dto);
  }

  @Delete(':categoryId')
  @HttpCode(HttpStatus.OK)
  @VendorMember({ roles: [VendorMemberRole.OWNER, VendorMemberRole.MANAGER] })
  remove(
    @Param('vendorId') vendorId: string,
    @Param('categoryId') categoryId: string,
  ) {
    return this.service.remove(vendorId, categoryId);
  }

  // ─── Admin overrides ──────────────────────────────────────────────────────

  @Post('admin')
  @RequirePermissions(Permission.MANAGE_PRODUCTS)
  adminCreate(
    @Param('vendorId') vendorId: string,
    @Body() dto: CreateMenuCategoryDto,
  ) {
    return this.service.create(vendorId, dto);
  }

  @Patch('admin/:categoryId')
  @RequirePermissions(Permission.MANAGE_PRODUCTS)
  adminUpdate(
    @Param('vendorId') vendorId: string,
    @Param('categoryId') categoryId: string,
    @Body() dto: UpdateMenuCategoryDto,
  ) {
    return this.service.update(vendorId, categoryId, dto);
  }

  @Delete('admin/:categoryId')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(Permission.MANAGE_PRODUCTS)
  adminRemove(
    @Param('vendorId') vendorId: string,
    @Param('categoryId') categoryId: string,
  ) {
    return this.service.remove(vendorId, categoryId);
  }
}
