import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsInt,
  IsPositive,
  Min,
  MaxLength,
  IsUrl,
  IsEmail,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePlatformSettingsDto {
  // ─── Financial ─────────────────────────────────────────────────────────────
  @ApiProperty({ example: 'EGP', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(10)
  currency?: string;

  @ApiProperty({ example: 0.1, required: false })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  defaultCommissionRate?: number;

  @ApiProperty({ example: 0.14, required: false })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  defaultTaxRate?: number;

  @ApiProperty({ example: 50, required: false })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  minOrderAmount?: number;

  // ─── Delivery ──────────────────────────────────────────────────────────────
  @ApiProperty({ example: 10, required: false })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  baseDeliveryFee?: number;

  @ApiProperty({ example: 2, required: false })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  pricePerKm?: number;

  @ApiProperty({ example: 15, required: false })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  maxDeliveryRadiusKm?: number;

  @ApiProperty({ example: 5, required: false })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  driverSearchRadiusKm?: number;

  // ─── Order behaviour ───────────────────────────────────────────────────────
  @ApiProperty({ example: 10, required: false })
  @IsInt()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  autoCancelPendingMins?: number;

  @ApiProperty({ example: 60, required: false })
  @IsInt()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  driverAcceptTimeoutSecs?: number;

  // ─── Maintenance ───────────────────────────────────────────────────────────
  @ApiProperty({ example: false, required: false })
  @IsBoolean()
  @IsOptional()
  isMaintenanceMode?: boolean;

  // ─── Android app ──────────────────────────────────────────────────────────
  @ApiProperty({ example: '1.0.0', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  androidMinVersion?: string;

  @ApiProperty({ example: '1.1.0', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  androidLatestVersion?: string;

  @ApiProperty({ example: false, required: false })
  @IsBoolean()
  @IsOptional()
  androidForceUpdate?: boolean;

  @ApiProperty({ example: 'https://play.google.com/store/apps/details?id=com.otlobegy', required: false })
  @IsUrl()
  @IsOptional()
  androidStoreUrl?: string;

  // ─── iOS app ──────────────────────────────────────────────────────────────
  @ApiProperty({ example: '1.0.0', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  iosMinVersion?: string;

  @ApiProperty({ example: '1.1.0', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  iosLatestVersion?: string;

  @ApiProperty({ example: false, required: false })
  @IsBoolean()
  @IsOptional()
  iosForceUpdate?: boolean;

  @ApiProperty({ example: 'https://apps.apple.com/app/otlobegy', required: false })
  @IsUrl()
  @IsOptional()
  iosStoreUrl?: string;

  // ─── Support contact ──────────────────────────────────────────────────────
  @ApiProperty({ example: 'support@otlobegy.com', required: false })
  @IsEmail()
  @IsOptional()
  supportEmail?: string;

  @ApiProperty({ example: '+201234567890', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(30)
  supportPhone?: string;

  @ApiProperty({ example: '+201234567890', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(30)
  supportWhatsapp?: string;

  // ─── Legal ────────────────────────────────────────────────────────────────
  @ApiProperty({ example: 'https://otlobegy.com/terms', required: false })
  @IsUrl()
  @IsOptional()
  termsUrl?: string;

  @ApiProperty({ example: 'https://otlobegy.com/privacy', required: false })
  @IsUrl()
  @IsOptional()
  privacyUrl?: string;
}

// Used by mobile clients to check app version requirements
export class AppVersionCheckDto {
  @ApiProperty({ enum: ['android', 'ios'] })
  @IsString()
  platform!: 'android' | 'ios';

  @ApiProperty({ example: '1.0.0' })
  @IsString()
  version!: string;
}
