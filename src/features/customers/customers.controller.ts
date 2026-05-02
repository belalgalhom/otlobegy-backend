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
import { CustomersService } from './customers.service';
import { CreateAddressDto, UpdateAddressDto } from './dto/customer.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Customers - Profile & Addresses')
@ApiBearerAuth()
@Roles(Role.CUSTOMER)
@Controller('customers/me')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get('addresses')
  @ApiOperation({ summary: 'Get all my addresses' })
  @ApiResponse({ status: 200, description: 'List of addresses returned' })
  getAddresses(@CurrentUser('sub') userId: string) {
    return this.customersService.getAddresses(userId);
  }

  @Post('addresses')
  @ApiOperation({ summary: 'Add a new address' })
  @ApiResponse({ status: 201, description: 'Address created successfully' })
  createAddress(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateAddressDto,
  ) {
    return this.customersService.createAddress(userId, dto);
  }

  @Patch('addresses/:id')
  @ApiOperation({ summary: 'Update an existing address' })
  @ApiResponse({ status: 200, description: 'Address updated successfully' })
  updateAddress(
    @CurrentUser('sub') userId: string,
    @Param('id') addressId: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.customersService.updateAddress(userId, addressId, dto);
  }

  @Delete('addresses/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an address' })
  @ApiResponse({ status: 204, description: 'Address deleted successfully' })
  deleteAddress(
    @CurrentUser('sub') userId: string,
    @Param('id') addressId: string,
  ) {
    return this.customersService.deleteAddress(userId, addressId);
  }

  @Get('favorites')
  @ApiOperation({ summary: 'Get all my favorites (vendors and products)' })
  @ApiResponse({ status: 200, description: 'List of favorites returned' })
  getFavorites(@CurrentUser('sub') userId: string) {
    return this.customersService.getFavorites(userId);
  }

  @Post('favorites/vendors/:vendorId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Toggle vendor favorite status' })
  @ApiResponse({ status: 200, description: 'Favorite status toggled successfully' })
  toggleFavoriteVendor(
    @CurrentUser('sub') userId: string,
    @Param('vendorId') vendorId: string,
  ) {
    return this.customersService.toggleFavoriteVendor(userId, vendorId);
  }

  @Post('favorites/products/:productId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Toggle product favorite status' })
  @ApiResponse({ status: 200, description: 'Favorite status toggled successfully' })
  toggleFavoriteProduct(
    @CurrentUser('sub') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.customersService.toggleFavoriteProduct(userId, productId);
  }
}
