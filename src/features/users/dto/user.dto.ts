import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';
import { Language } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ example: 'John Doe', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @ApiProperty({ example: 'user@example.com', required: false })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: '+201234567890', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ enum: Language, required: false })
  @IsEnum(Language)
  @IsOptional()
  language?: Language;
}

export class UpdateNotificationSettingsDto {
  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  pushEnabled?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  orderUpdates?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  chatMessages?: boolean;

  @ApiProperty({ example: false, required: false })
  @IsBoolean()
  @IsOptional()
  promotions?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  system?: boolean;
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'oldpassword123' })
  @IsString()
  @IsNotEmpty()
  currentPassword!: string;

  @ApiProperty({ example: 'newpassword123' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  newPassword!: string;
}

export class BanUserDto {
  @ApiProperty({ example: 'Violating terms of service', required: false })
  @IsString()
  @IsOptional()
  reason?: string;
}
