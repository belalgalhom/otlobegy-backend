import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { VendorMemberRole } from '@prisma/client';

export class AddVendorMemberDto {
  @IsUUID()
  @IsNotEmpty()
  userId!: string;

  @IsEnum(VendorMemberRole)
  @IsNotEmpty()
  role!: VendorMemberRole;
}

export class UpdateVendorMemberRoleDto {
  @IsEnum(VendorMemberRole)
  @IsNotEmpty()
  role!: VendorMemberRole;
}