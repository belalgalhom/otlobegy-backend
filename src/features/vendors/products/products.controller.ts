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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('Vendors - Products')
@Controller('vendors/:vendorId/products')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  // ─── Public — customers browse menus ─────────────────────────────────────

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all products for a vendor' })
  @ApiResponse({ status: 200, description: 'List of products returned' })
  findAll(
    @Param('vendorId') vendorId: string,
    @Query() dto: QueryProductsDto,
  ) {
    return this.service.findAll(vendorId, dto);
  }

  @Public()
  @Get(':productId')
  @ApiOperation({ summary: 'Get a specific product by ID' })
  @ApiResponse({ status: 200, description: 'Product returned' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  findOne(
    @Param('vendorId') vendorId: string,
    @Param('productId') productId: string,
  ) {
    return this.service.findOne(vendorId, productId);
  }

  // ─── Vendor member: any member can read; OWNER/MANAGER can write ──────────

  @Post()
  @ApiBearerAuth()
  @VendorMember({ roles: [VendorMemberRole.OWNER, VendorMemberRole.MANAGER] })
  @ApiOperation({ summary: 'Create a new product (Member)' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  create(
    @Param('vendorId') vendorId: string,
    @Body() dto: CreateProductDto,
  ) {
    return this.service.create(vendorId, dto);
  }

  @Patch(':productId')
  @ApiBearerAuth()
  @VendorMember({ roles: [VendorMemberRole.OWNER, VendorMemberRole.MANAGER] })
  @ApiOperation({ summary: 'Update a product (Member)' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  update(
    @Param('vendorId') vendorId: string,
    @Param('productId') productId: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.service.update(vendorId, productId, dto);
  }

  @Post(':productId/image')
  @ApiBearerAuth()
  @VendorMember({ roles: [VendorMemberRole.OWNER, VendorMemberRole.MANAGER] })
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
  @ApiOperation({ summary: 'Upload product image' })
  @ApiResponse({ status: 201, description: 'Image uploaded successfully' })
  uploadImage(
    @Param('vendorId') vendorId: string,
    @Param('productId') productId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.service.uploadImage(vendorId, productId, file);
  }

  @Delete(':productId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @VendorMember({ roles: [VendorMemberRole.OWNER, VendorMemberRole.MANAGER] })
  @ApiOperation({ summary: 'Delete a product (Member)' })
  @ApiResponse({ status: 200, description: 'Product removed successfully' })
  remove(
    @Param('vendorId') vendorId: string,
    @Param('productId') productId: string,
  ) {
    return this.service.remove(vendorId, productId);
  }

  // ─── Variants ─────────────────────────────────────────────────────────────

  @Post(':productId/variants')
  @ApiBearerAuth()
  @VendorMember({ roles: [VendorMemberRole.OWNER, VendorMemberRole.MANAGER] })
  @ApiOperation({ summary: 'Add a variant to a product' })
  @ApiResponse({ status: 201, description: 'Variant added successfully' })
  addVariant(
    @Param('vendorId') vendorId: string,
    @Param('productId') productId: string,
    @Body() dto: CreateProductVariantDto,
  ) {
    return this.service.addVariant(vendorId, productId, dto);
  }

  @Patch(':productId/variants/:variantId')
  @ApiBearerAuth()
  @VendorMember({ roles: [VendorMemberRole.OWNER, VendorMemberRole.MANAGER] })
  @ApiOperation({ summary: 'Update a product variant' })
  @ApiResponse({ status: 200, description: 'Variant updated successfully' })
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
  @ApiBearerAuth()
  @VendorMember({ roles: [VendorMemberRole.OWNER, VendorMemberRole.MANAGER] })
  @ApiOperation({ summary: 'Delete a product variant' })
  @ApiResponse({ status: 200, description: 'Variant removed successfully' })
  removeVariant(
    @Param('vendorId') vendorId: string,
    @Param('productId') productId: string,
    @Param('variantId') variantId: string,
  ) {
    return this.service.removeVariant(vendorId, productId, variantId);
  }

  // ─── Option groups (on product) ───────────────────────────────────────────

  @Post(':productId/option-groups')
  @ApiBearerAuth()
  @VendorMember({ roles: [VendorMemberRole.OWNER, VendorMemberRole.MANAGER] })
  @ApiOperation({ summary: 'Add an option group to a product' })
  @ApiResponse({ status: 201, description: 'Option group added successfully' })
  addOptionGroup(
    @Param('vendorId') vendorId: string,
    @Param('productId') productId: string,
    @Body() dto: CreateOptionGroupDto,
  ) {
    return this.service.addOptionGroup(vendorId, productId, dto);
  }

  @Patch(':productId/option-groups/:groupId')
  @ApiBearerAuth()
  @VendorMember({ roles: [VendorMemberRole.OWNER, VendorMemberRole.MANAGER] })
  @ApiOperation({ summary: 'Update a product option group' })
  @ApiResponse({ status: 200, description: 'Option group updated successfully' })
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
  @ApiBearerAuth()
  @VendorMember({ roles: [VendorMemberRole.OWNER, VendorMemberRole.MANAGER] })
  @ApiOperation({ summary: 'Delete a product option group' })
  @ApiResponse({ status: 200, description: 'Option group removed successfully' })
  removeOptionGroup(
    @Param('vendorId') vendorId: string,
    @Param('productId') productId: string,
    @Param('groupId') groupId: string,
  ) {
    return this.service.removeOptionGroup(vendorId, productId, groupId);
  }

  // ─── Option groups (on variant) ───────────────────────────────────────────

  @Post(':productId/variants/:variantId/option-groups')
  @ApiBearerAuth()
  @VendorMember({ roles: [VendorMemberRole.OWNER, VendorMemberRole.MANAGER] })
  @ApiOperation({ summary: 'Add an option group to a product variant' })
  @ApiResponse({ status: 201, description: 'Option group added successfully' })
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
  @ApiBearerAuth()
  @VendorMember({ roles: [VendorMemberRole.OWNER, VendorMemberRole.MANAGER] })
  @ApiOperation({ summary: 'Add an option to a group' })
  @ApiResponse({ status: 201, description: 'Option added successfully' })
  addOption(
    @Param('vendorId') vendorId: string,
    @Param('productId') productId: string,
    @Param('groupId') groupId: string,
    @Body() dto: CreateProductOptionDto,
  ) {
    return this.service.addOption(vendorId, productId, groupId, dto);
  }

  @Patch(':productId/option-groups/:groupId/options/:optionId')
  @ApiBearerAuth()
  @VendorMember({ roles: [VendorMemberRole.OWNER, VendorMemberRole.MANAGER] })
  @ApiOperation({ summary: 'Update an option in a group' })
  @ApiResponse({ status: 200, description: 'Option updated successfully' })
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
  @ApiBearerAuth()
  @VendorMember({ roles: [VendorMemberRole.OWNER, VendorMemberRole.MANAGER] })
  @ApiOperation({ summary: 'Delete an option from a group' })
  @ApiResponse({ status: 200, description: 'Option removed successfully' })
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
  @ApiBearerAuth()
  @RequirePermissions(Permission.MANAGE_PRODUCTS)
  @ApiOperation({ summary: 'Create a new product (Admin Override)' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  adminCreate(
    @Param('vendorId') vendorId: string,
    @Body() dto: CreateProductDto,
  ) {
    return this.service.create(vendorId, dto);
  }

  @Patch('admin/:productId')
  @ApiBearerAuth()
  @RequirePermissions(Permission.MANAGE_PRODUCTS)
  @ApiOperation({ summary: 'Update a product (Admin Override)' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  adminUpdate(
    @Param('vendorId') vendorId: string,
    @Param('productId') productId: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.service.update(vendorId, productId, dto);
  }

  @Delete('admin/:productId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @RequirePermissions(Permission.MANAGE_PRODUCTS)
  @ApiOperation({ summary: 'Delete a product (Admin Override)' })
  @ApiResponse({ status: 200, description: 'Product removed successfully' })
  adminRemove(
    @Param('vendorId') vendorId: string,
    @Param('productId') productId: string,
  ) {
    return this.service.remove(vendorId, productId);
  }
}