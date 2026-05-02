import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  IsNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAddressDto {
  @ApiProperty({ example: 'Home', required: false })
  @IsString()
  @IsOptional()
  label?: string;

  @ApiProperty({ example: '123 Street, Cairo' })
  @IsString()
  @IsNotEmpty()
  address!: string;

  @ApiProperty({ example: [30.0444, 31.2357], minItems: 2, maxItems: 2 })
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsNumber({}, { each: true })
  @IsNotEmpty()
  location!: [number, number];

  @ApiProperty({ example: 'Apartment 5, 2nd Floor', required: false })
  @IsString()
  @IsOptional()
  details?: string;

  @ApiProperty({ example: true, required: false, default: false })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}

export class UpdateAddressDto {
  @ApiProperty({ example: 'Work', required: false })
  @IsString()
  @IsOptional()
  label?: string;

  @ApiProperty({ example: '456 Avenue, Cairo', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: [30.0444, 31.2357], minItems: 2, maxItems: 2, required: false })
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsNumber({}, { each: true })
  @IsOptional()
  location?: [number, number];

  @ApiProperty({ example: 'Office 301', required: false })
  @IsString()
  @IsOptional()
  details?: string;

  @ApiProperty({ example: false, required: false })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
