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
import { ProductsService } from './products.service';
import {
  CreateProductDto,
  UpdateProductDto,
  CreateProductVariantDto,
  UpdateProductVariantDto,
  CreateOptionGroupDto,
  UpdateOptionGroupDto,
  CreateProductOptionDto,
  UpdateProductOptionDto,
  QueryProductsDto,
} from './dto/product.dto';
import { VendorMember } from '../../../common/decorators/vendor-member.decorator';
import { RequirePermissions } from '../../../common/decorators/permissions.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { Permission, VendorMemberRole } from '@prisma/client';

@Controller('vendors/:vendorId/products')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  // ─── Public — customers browse menus ─────────────────────────────────────

  @Public()
  @Get()
  findAll(
    @Param('vendorId') vendorId: string,
    @Query() dto: QueryProductsDto,
  ) {
    return this.service.findAll(vendorId, dto);
  }

  @Public()
  @Get(':productId')
  findOne(
    @Param('vendorId') vendorId: string,
    @Param('productId') productId: string,
  ) {
    return this.service.findOne(vendorId, productId);
  }

  // ─── Vendor member: any member can read; OWNER/MANAGER can write ──────────

  @Post()
  @VendorMember({ roles: [VendorMemberRole.OWNER, VendorMemberRole.MANAGER] })
  create(
    @Param('vendorId') vendorId: string,
    @Body() dto: CreateProductDto,
  ) {
    return this.service.create(vendorId, dto);
  }

  @Patch(':productId')
  @VendorMember({ roles: [VendorMemberRole.OWNER, VendorMemberRole.MANAGER] })
  update(
    @Param('vendorId') vendorId: string,
    @Param('productId') productId: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.service.update(vendorId, productId, dto);
  }

  @Post(':productId/image')
  @VendorMember({ roles: [VendorMemberRole.OWNER, VendorMemberRole.MANAGER] })
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(
    @Param('vendorId') vendorId: string,
    @Param('productId') productId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.service.uploadImage(vendorId, productId, file);
  }

  @Delete(':productId')
  @HttpCode(HttpStatus.OK)
  @VendorMember({ roles: [VendorMemberRole.OWNER, VendorMemberRole.MANAGER] })
  remove(
    @Param('vendorId') vendorId: string,
    @Param('productId') productId: string,
  ) {
    return this.service.remove(vendorId, productId);
  }

  // ─── Variants ─────────────────────────────────────────────────────────────

  @Post(':productId/variants')
  @VendorMember({ roles: [VendorMemberRole.OWNER, VendorMemberRole.MANAGER] })
  addVariant(
    @Param('vendorId') vendorId: string,
    @Param('productId') productId: string,
    @Body() dto: CreateProductVariantDto,
  ) {
    return this.service.addVariant(vendorId, productId, dto);
  }

  @Patch(':productId/variants/:variantId')
  @VendorMember({ roles: [VendorMemberRole.OWNER, VendorMemberRole.MANAGER] })
  updateVariant(
    @Param('vendorId') vendorId: string,
    @Param('productId') productId: string,
    @Param('variantId') variantId: string,
    @Body() dto: UpdateProductVariantDto,
  ) {
    return this.service.updateVariant(vendorId, productId, variantId, dto);
  }

  @Delete(':productId/variants/:variantId')
  @HttpCode(HttpStatus.OK)
  @VendorMember({ roles: [VendorMemberRole.OWNER, VendorMemberRole.MANAGER] })
  removeVariant(
    @Param('vendorId') vendorId: string,
    @Param('productId') productId: string,
    @Param('variantId') variantId: string,
  ) {
    return this.service.removeVariant(vendorId, productId, variantId);
  }

  // ─── Option groups (on product) ───────────────────────────────────────────

  @Post(':productId/option-groups')
  @VendorMember({ roles: [VendorMemberRole.OWNER, VendorMemberRole.MANAGER] })
  addOptionGroup(
    @Param('vendorId') vendorId: string,
    @Param('productId') productId: string,
    @Body() dto: CreateOptionGroupDto,
  ) {
    return this.service.addOptionGroup(vendorId, productId, dto);
  }

  @Patch(':productId/option-groups/:groupId')
  @VendorMember({ roles: [VendorMemberRole.OWNER, VendorMemberRole.MANAGER] })
  updateOptionGroup(
    @Param('vendorId') vendorId: string,
    @Param('productId') productId: string,
    @Param('groupId') groupId: string,
    @Body() dto: UpdateOptionGroupDto,
  ) {
    return this.service.updateOptionGroup(vendorId, productId, groupId, dto);
  }

  @Delete(':productId/option-groups/:groupId')
  @HttpCode(HttpStatus.OK)
  @VendorMember({ roles: [VendorMemberRole.OWNER, VendorMemberRole.MANAGER] })
  removeOptionGroup(
    @Param('vendorId') vendorId: string,
    @Param('productId') productId: string,
    @Param('groupId') groupId: string,
  ) {
    return this.service.removeOptionGroup(vendorId, productId, groupId);
  }

  // ─── Option groups (on variant) ───────────────────────────────────────────

  @Post(':productId/variants/:variantId/option-groups')
  @VendorMember({ roles: [VendorMemberRole.OWNER, VendorMemberRole.MANAGER] })
  addVariantOptionGroup(
    @Param('vendorId') vendorId: string,
    @Param('productId') productId: string,
    @Param('variantId') variantId: string,
    @Body() dto: CreateOptionGroupDto,
  ) {
    return this.service.addOptionGroup(vendorId, productId, dto, variantId);
  }

  // ─── Options within a group ───────────────────────────────────────────────

  @Post(':productId/option-groups/:groupId/options')
  @VendorMember({ roles: [VendorMemberRole.OWNER, VendorMemberRole.MANAGER] })
  addOption(
    @Param('vendorId') vendorId: string,
    @Param('productId') productId: string,
    @Param('groupId') groupId: string,
    @Body() dto: CreateProductOptionDto,
  ) {
    return this.service.addOption(vendorId, productId, groupId, dto);
  }

  @Patch(':productId/option-groups/:groupId/options/:optionId')
  @VendorMember({ roles: [VendorMemberRole.OWNER, VendorMemberRole.MANAGER] })
  updateOption(
    @Param('vendorId') vendorId: string,
    @Param('productId') productId: string,
    @Param('groupId') groupId: string,
    @Param('optionId') optionId: string,
    @Body() dto: UpdateProductOptionDto,
  ) {
    return this.service.updateOption(vendorId, productId, groupId, optionId, dto);
  }

  @Delete(':productId/option-groups/:groupId/options/:optionId')
  @HttpCode(HttpStatus.OK)
  @VendorMember({ roles: [VendorMemberRole.OWNER, VendorMemberRole.MANAGER] })
  removeOption(
    @Param('vendorId') vendorId: string,
    @Param('productId') productId: string,
    @Param('groupId') groupId: string,
    @Param('optionId') optionId: string,
  ) {
    return this.service.removeOption(vendorId, productId, groupId, optionId);
  }

  // ─── Admin overrides ──────────────────────────────────────────────────────

  @Post('admin')
  @RequirePermissions(Permission.MANAGE_PRODUCTS)
  adminCreate(
    @Param('vendorId') vendorId: string,
    @Body() dto: CreateProductDto,
  ) {
    return this.service.create(vendorId, dto);
  }

  @Patch('admin/:productId')
  @RequirePermissions(Permission.MANAGE_PRODUCTS)
  adminUpdate(
    @Param('vendorId') vendorId: string,
    @Param('productId') productId: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.service.update(vendorId, productId, dto);
  }

  @Delete('admin/:productId')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(Permission.MANAGE_PRODUCTS)
  adminRemove(
    @Param('vendorId') vendorId: string,
    @Param('productId') productId: string,
  ) {
    return this.service.remove(vendorId, productId);
  }
}