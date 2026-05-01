import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  IsNumber,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateVendorBranchDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  nameAr?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  address!: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsNumber({}, { each: true })
  @IsNotEmpty()
  location!: [number, number];

  @IsUUID()
  @IsOptional()
  zoneId?: string;

  @IsBoolean()
  @IsOptional()
  isOpen?: boolean;
}

export class UpdateVendorBranchDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  nameAr?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  address?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsNumber({}, { each: true })
  @IsOptional()
  location?: [number, number];

  @IsUUID()
  @IsOptional()
  zoneId?: string;

  @IsBoolean()
  @IsOptional()
  isOpen?: boolean;
}
