import { IsNotEmpty, IsEnum, IsUUID } from 'class-validator';
import { VendorMemberRole } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class AddVendorMemberDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  @IsNotEmpty()
  userId!: string;

  @ApiProperty({ enum: VendorMemberRole })
  @IsEnum(VendorMemberRole)
  @IsNotEmpty()
  role!: VendorMemberRole;
}

export class UpdateVendorMemberRoleDto {
  @ApiProperty({ enum: VendorMemberRole })
  @IsEnum(VendorMemberRole)
  @IsNotEmpty()
  role!: VendorMemberRole;
}
