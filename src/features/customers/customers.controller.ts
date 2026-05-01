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

@Roles(Role.CUSTOMER)
@Controller('customers/me')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get('addresses')
  getAddresses(@CurrentUser('sub') userId: string) {
    return this.customersService.getAddresses(userId);
  }

  @Post('addresses')
  createAddress(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateAddressDto,
  ) {
    return this.customersService.createAddress(userId, dto);
  }

  @Patch('addresses/:id')
  updateAddress(
    @CurrentUser('sub') userId: string,
    @Param('id') addressId: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.customersService.updateAddress(userId, addressId, dto);
  }

  @Delete('addresses/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteAddress(
    @CurrentUser('sub') userId: string,
    @Param('id') addressId: string,
  ) {
    return this.customersService.deleteAddress(userId, addressId);
  }

  @Get('favorites')
  getFavorites(@CurrentUser('sub') userId: string) {
    return this.customersService.getFavorites(userId);
  }

  @Post('favorites/vendors/:vendorId')
  @HttpCode(HttpStatus.OK)
  toggleFavoriteVendor(
    @CurrentUser('sub') userId: string,
    @Param('vendorId') vendorId: string,
  ) {
    return this.customersService.toggleFavoriteVendor(userId, vendorId);
  }

  @Post('favorites/products/:productId')
  @HttpCode(HttpStatus.OK)
  toggleFavoriteProduct(
    @CurrentUser('sub') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.customersService.toggleFavoriteProduct(userId, productId);
  }
}
