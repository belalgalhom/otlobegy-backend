import { Module } from '@nestjs/common';

import { VendorVerticalsController } from './verticals/vendor-verticals.controller';
import { VendorsController } from './vendors.controller';
import { VendorMembersController } from './members/vendor-members.controller';
import { VendorBranchesController } from './branches/vendor-branches.controller';
import { VendorWalletController } from './wallet/vendor-wallet.controller';

import { VendorVerticalsService } from './verticals/vendor-verticals.service';
import { VendorsService } from './vendors.service';
import { VendorMembersService } from './members/vendor-members.service';
import { VendorBranchesService } from './branches/vendor-branches.service';
import { VendorWalletService } from './wallet/vendor-wallet.service';

import { VendorMemberGuard } from '../../common/guards/vendor-member.guard';

@Module({
  controllers: [
    VendorVerticalsController,
    VendorsController,
    VendorMembersController,
    VendorBranchesController,
    VendorWalletController,
  ],
  providers: [
    VendorVerticalsService,
    VendorsService,
    VendorMembersService,
    VendorBranchesService,
    VendorWalletService,
    VendorMemberGuard,
  ],
  exports: [
    VendorsService,
    VendorMembersService,
    VendorBranchesService,
    VendorWalletService,
  ],
})
export class VendorsModule {}