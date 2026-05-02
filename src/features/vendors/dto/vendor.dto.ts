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
import { ApiProperty } from '@nestjs/swagger';

export class CreateVendorDto {
  @ApiProperty({ example: 'My Awesome Store' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  storeName!: string;

  @ApiProperty({ example: 'متجري الرائع', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  storeNameAr?: string;

  @ApiProperty({ example: 'Best store in town', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ example: 'أفضل متجر في المدينة', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  descriptionAr?: string;

  @ApiProperty({ example: 'vertical-id-123' })
  @IsString()
  @IsNotEmpty()
  verticalId!: string;

  @ApiProperty({ example: 'TAX-123456', required: false })
  @IsString()
  @IsOptional()
  taxId?: string;

  @ApiProperty({ example: 0.1, required: false })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  commissionRate?: number;
}

export class UpdateVendorDto {
  @ApiProperty({ example: 'Updated Store Name', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  storeName?: string;

  @ApiProperty({ example: 'اسم المتجر المحدث', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  storeNameAr?: string;

  @ApiProperty({ example: 'Updated description', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ example: 'وصف محدث', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  descriptionAr?: string;

  @ApiProperty({ example: 'vertical-id-456', required: false })
  @IsString()
  @IsOptional()
  verticalId?: string;

  @ApiProperty({ example: 'TAX-654321', required: false })
  @IsString()
  @IsOptional()
  taxId?: string;

  @ApiProperty({ example: 0.12, required: false })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  commissionRate?: number;
}

export class UpdateVendorStatusDto {
  @ApiProperty({ enum: VendorStatus })
  @IsEnum(VendorStatus)
  @IsNotEmpty()
  status!: VendorStatus;
}

export class QueryVendorsDto {
  @ApiProperty({ enum: VendorStatus, required: false })
  @IsEnum(VendorStatus)
  @IsOptional()
  status?: VendorStatus;

  @ApiProperty({ example: 'vertical-id-123', required: false })
  @IsString()
  @IsOptional()
  verticalId?: string;

  @ApiProperty({ example: 'pizza', required: false })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ example: 1, required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ example: 20, required: false, default: 20, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 20;
}
