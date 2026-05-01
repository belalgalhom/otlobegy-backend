import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsArray,
  ArrayMinSize,
} from 'class-validator';

export class CreateZoneDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  nameAr?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @IsOptional()
  baseDeliveryFeeOverride?: number;

  @IsNumber()
  @IsOptional()
  minOrderAmountOverride?: number;

  @IsArray()
  @ArrayMinSize(1)
  boundary!: number[][][];
}

export class UpdateZoneDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  nameAr?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @IsOptional()
  baseDeliveryFeeOverride?: number;

  @IsNumber()
  @IsOptional()
  minOrderAmountOverride?: number;

  @IsArray()
  @IsOptional()
  boundary?: number[][][];
}

export class CheckLocationDto {
  @IsNumber()
  longitude!: number;

  @IsNumber()
  latitude!: number;
}
