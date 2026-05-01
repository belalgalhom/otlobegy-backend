import { Controller, Get, Query, Param } from '@nestjs/common';
import { VendorWalletService } from './vendor-wallet.service';
import { QueryVendorWalletDto } from './dto/vendor-wallet.dto';
import { VendorMember } from '../../../common/decorators/vendor-member.decorator';
import { RequirePermissions } from '../../../common/decorators/permissions.decorator';
import { Permission } from '@prisma/client';

@Controller('vendors/:vendorId/wallet')
export class VendorWalletController {
  constructor(private readonly service: VendorWalletService) {}

  // Any vendor member can see their own wallet balance.
  @Get('balance')
  @VendorMember()
  getBalance(@Param('vendorId') vendorId: string) {
    return this.service.getBalance(vendorId);
  }

  // Any vendor member can see transaction history.
  @Get('transactions')
  @VendorMember()
  listTransactions(
    @Param('vendorId') vendorId: string,
    @Query() dto: QueryVendorWalletDto,
  ) {
    return this.service.listTransactions(vendorId, dto);
  }

  // Admin can view any vendor's wallet.
  @Get('admin/balance')
  @RequirePermissions(Permission.MANAGE_VENDORS, Permission.VIEW_FINANCIALS)
  adminGetBalance(@Param('vendorId') vendorId: string) {
    return this.service.getBalance(vendorId);
  }

  @Get('admin/transactions')
  @RequirePermissions(Permission.MANAGE_VENDORS, Permission.VIEW_FINANCIALS)
  adminListTransactions(
    @Param('vendorId') vendorId: string,
    @Query() dto: QueryVendorWalletDto,
  ) {
    return this.service.listTransactions(vendorId, dto);
  }
}
