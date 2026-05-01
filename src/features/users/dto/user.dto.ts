import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';
import { Language } from '@prisma/client';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEnum(Language)
  @IsOptional()
  language?: Language;
}

export class UpdateNotificationSettingsDto {
  @IsBoolean()
  @IsOptional()
  pushEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  orderUpdates?: boolean;

  @IsBoolean()
  @IsOptional()
  chatMessages?: boolean;

  @IsBoolean()
  @IsOptional()
  promotions?: boolean;

  @IsBoolean()
  @IsOptional()
  system?: boolean;
}

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  currentPassword!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  newPassword!: string;
}

export class BanUserDto {
  @IsString()
  @IsOptional()
  reason?: string;
}
