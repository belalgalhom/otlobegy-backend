import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsBoolean, 
  IsArray, 
  ArrayMinSize, 
  ArrayMaxSize, 
  IsNumber 
} from 'class-validator';

export class CreateAddressDto {
  @IsString()
  @IsOptional()
  label?: string;

  @IsString()
  @IsNotEmpty()
  address!: string;

  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsNumber({}, { each: true })
  @IsNotEmpty()
  location!: [number, number];

  @IsString()
  @IsOptional()
  details?: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}

export class UpdateAddressDto {
  @IsString()
  @IsOptional()
  label?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsNumber({}, { each: true })
  @IsOptional()
  location?: [number, number];

  @IsString()
  @IsOptional()
  details?: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}