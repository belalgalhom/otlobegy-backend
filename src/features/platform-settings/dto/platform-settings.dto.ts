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

export class UpdatePlatformSettingsDto {
  // ─── Financial ─────────────────────────────────────────────────────────────
  @IsString()
  @IsOptional()
  @MaxLength(10)
  currency?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  defaultCommissionRate?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  defaultTaxRate?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  minOrderAmount?: number;

  // ─── Delivery ──────────────────────────────────────────────────────────────
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  baseDeliveryFee?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  pricePerKm?: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  maxDeliveryRadiusKm?: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  driverSearchRadiusKm?: number;

  // ─── Order behaviour ───────────────────────────────────────────────────────
  @IsInt()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  autoCancelPendingMins?: number;

  @IsInt()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  driverAcceptTimeoutSecs?: number;

  // ─── Maintenance ───────────────────────────────────────────────────────────
  @IsBoolean()
  @IsOptional()
  isMaintenanceMode?: boolean;

  // ─── Android app ──────────────────────────────────────────────────────────
  @IsString()
  @IsOptional()
  @MaxLength(20)
  androidMinVersion?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  androidLatestVersion?: string;

  @IsBoolean()
  @IsOptional()
  androidForceUpdate?: boolean;

  @IsUrl()
  @IsOptional()
  androidStoreUrl?: string;

  // ─── iOS app ──────────────────────────────────────────────────────────────
  @IsString()
  @IsOptional()
  @MaxLength(20)
  iosMinVersion?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  iosLatestVersion?: string;

  @IsBoolean()
  @IsOptional()
  iosForceUpdate?: boolean;

  @IsUrl()
  @IsOptional()
  iosStoreUrl?: string;

  // ─── Support contact ──────────────────────────────────────────────────────
  @IsEmail()
  @IsOptional()
  supportEmail?: string;

  @IsString()
  @IsOptional()
  @MaxLength(30)
  supportPhone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(30)
  supportWhatsapp?: string;

  // ─── Legal ────────────────────────────────────────────────────────────────
  @IsUrl()
  @IsOptional()
  termsUrl?: string;

  @IsUrl()
  @IsOptional()
  privacyUrl?: string;
}

// Used by mobile clients to check app version requirements
export class AppVersionCheckDto {
  @IsString()
  platform!: 'android' | 'ios';

  @IsString()
  version!: string;
}
