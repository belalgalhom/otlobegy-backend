import { Controller, Get, Query, Param } from '@nestjs/common';
import { VendorWalletService } from './vendor-wallet.service';
import { QueryVendorWalletDto } from './dto/vendor-wallet.dto';
import { VendorMember } from '../../../common/decorators/vendor-member.decorator';
import { RequirePermissions } from '../../../common/decorators/permissions.decorator';
import { Permission } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Vendors - Wallet & Transactions')
@ApiBearerAuth()
@Controller('vendors/:vendorId/wallet')
export class VendorWalletController {
  constructor(private readonly service: VendorWalletService) {}

  // Any vendor member can see their own wallet balance.
  @Get('balance')
  @VendorMember()
  @ApiOperation({ summary: 'Get vendor wallet balance (Member)' })
  @ApiResponse({ status: 200, description: 'Wallet balance returned' })
  getBalance(@Param('vendorId') vendorId: string) {
    return this.service.getBalance(vendorId);
  }

  // Any vendor member can see transaction history.
  @Get('transactions')
  @VendorMember()
  @ApiOperation({ summary: 'List vendor wallet transactions (Member)' })
  @ApiResponse({ status: 200, description: 'List of transactions returned' })
  listTransactions(
    @Param('vendorId') vendorId: string,
    @Query() dto: QueryVendorWalletDto,
  ) {
    return this.service.listTransactions(vendorId, dto);
  }

  // Admin can view any vendor's wallet.
  @Get('admin/balance')
  @RequirePermissions(Permission.MANAGE_VENDORS, Permission.VIEW_FINANCIALS)
  @ApiOperation({ summary: "Get any vendor's wallet balance (Admin)" })
  @ApiResponse({ status: 200, description: 'Wallet balance returned' })
  adminGetBalance(@Param('vendorId') vendorId: string) {
    return this.service.getBalance(vendorId);
  }

  @Get('admin/transactions')
  @RequirePermissions(Permission.MANAGE_VENDORS, Permission.VIEW_FINANCIALS)
  @ApiOperation({ summary: "List any vendor's wallet transactions (Admin)" })
  @ApiResponse({ status: 200, description: 'List of transactions returned' })
  adminListTransactions(
    @Param('vendorId') vendorId: string,
    @Query() dto: QueryVendorWalletDto,
  ) {
    return this.service.listTransactions(vendorId, dto);
  }
}
