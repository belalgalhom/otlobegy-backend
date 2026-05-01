import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsInt,
  Min,
  Max,
  MaxLength,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';
import { VendorStatus } from '@prisma/client';

export class CreateVendorDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  storeName!: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  storeNameAr?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  descriptionAr?: string;

  @IsString()
  @IsNotEmpty()
  verticalId!: string;

  @IsString()
  @IsOptional()
  taxId?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  commissionRate?: number;
}

export class UpdateVendorDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  storeName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  storeNameAr?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  descriptionAr?: string;

  @IsString()
  @IsOptional()
  verticalId?: string;

  @IsString()
  @IsOptional()
  taxId?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  commissionRate?: number;
}

export class UpdateVendorStatusDto {
  @IsEnum(VendorStatus)
  @IsNotEmpty()
  status!: VendorStatus;
}

export class QueryVendorsDto {
  @IsEnum(VendorStatus)
  @IsOptional()
  status?: VendorStatus;

  @IsString()
  @IsOptional()
  verticalId?: string;

  @IsString()
  @IsOptional()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 20;
}