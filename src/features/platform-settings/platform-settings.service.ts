import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import {
  UpdatePlatformSettingsDto,
  AppVersionCheckDto,
} from './dto/platform-settings.dto';

// Semantic version compare: returns true if `current` satisfies `minimum`
function semverGte(current: string, minimum: string): boolean {
  const parse = (v: string) =>
    v
      .replace(/^v/, '')
      .split('.')
      .map((n) => parseInt(n, 10) || 0);

  const [cMaj, cMin, cPat] = parse(current);
  const [mMaj, mMin, mPat] = parse(minimum);

  if (cMaj !== mMaj) return cMaj > mMaj;
  if (cMin !== mMin) return cMin > mMin;
  return cPat >= mPat;
}

@Injectable()
export class PlatformSettingsService {
  private readonly logger = new Logger(PlatformSettingsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── Get settings ─────────────────────────────────────────────────────────
  // Seeds a default row if it has never been written (first boot).

  async getSettings() {
    let settings = await this.prisma.platformSetting.findUnique({
      where: { id: 'default' },
    });

    if (!settings) {
      this.logger.log('Platform settings not found — seeding defaults');
      settings = await this.prisma.platformSetting.create({
        data: { id: 'default' },
      });
    }

    return settings;
  }

  // ─── Public projection — safe subset for unauthenticated callers ──────────
  // Exposes only what mobile/web clients need (maintenance flag, app versions,
  // support contacts, legal URLs). Hides financial/operational config.

  async getPublicSettings() {
    const s = await this.getSettings();

    return {
      isMaintenanceMode: s.isMaintenanceMode,
      android: {
        minVersion: s.androidMinVersion,
        latestVersion: s.androidLatestVersion,
        forceUpdate: s.androidForceUpdate,
        storeUrl: s.androidStoreUrl,
      },
      ios: {
        minVersion: s.iosMinVersion,
        latestVersion: s.iosLatestVersion,
        forceUpdate: s.iosForceUpdate,
        storeUrl: s.iosStoreUrl,
      },
      support: {
        email: s.supportEmail,
        phone: s.supportPhone,
        whatsapp: s.supportWhatsapp,
      },
      legal: {
        termsUrl: s.termsUrl,
        privacyUrl: s.privacyUrl,
      },
      currency: s.currency,
      minOrderAmount: s.minOrderAmount,
    };
  }

  // ─── Update settings ──────────────────────────────────────────────────────
  // Upserts: always updates the single 'default' row.

  async updateSettings(dto: UpdatePlatformSettingsDto) {
    const data: any = {};

    // Only include fields that were explicitly provided
    const fields: (keyof UpdatePlatformSettingsDto)[] = [
      'currency',
      'defaultCommissionRate',
      'defaultTaxRate',
      'minOrderAmount',
      'baseDeliveryFee',
      'pricePerKm',
      'maxDeliveryRadiusKm',
      'driverSearchRadiusKm',
      'autoCancelPendingMins',
      'driverAcceptTimeoutSecs',
      'isMaintenanceMode',
      'androidMinVersion',
      'androidLatestVersion',
      'androidForceUpdate',
      'androidStoreUrl',
      'iosMinVersion',
      'iosLatestVersion',
      'iosForceUpdate',
      'iosStoreUrl',
      'supportEmail',
      'supportPhone',
      'supportWhatsapp',
      'termsUrl',
      'privacyUrl',
    ];

    for (const field of fields) {
      if (dto[field] !== undefined) {
        data[field] = dto[field];
      }
    }

    const settings = await this.prisma.platformSetting.upsert({
      where: { id: 'default' },
      create: { id: 'default', ...data },
      update: data,
    });

    this.logger.log(
      `Platform settings updated: ${Object.keys(data).join(', ')}`,
    );
    return settings;
  }

  // ─── App version check ────────────────────────────────────────────────────
  // Mobile clients call this on startup to determine if they should force-update.

  async checkAppVersion(dto: AppVersionCheckDto) {
    const s = await this.getSettings();

    const isAndroid = dto.platform === 'android';
    const minVersion = isAndroid ? s.androidMinVersion : s.iosMinVersion;
    const latestVersion = isAndroid
      ? s.androidLatestVersion
      : s.iosLatestVersion;
    const forceUpdate = isAndroid ? s.androidForceUpdate : s.iosForceUpdate;
    const storeUrl = isAndroid ? s.androidStoreUrl : s.iosStoreUrl;

    const meetsMinimum = semverGte(dto.version, minVersion);
    const isLatest = semverGte(dto.version, latestVersion);

    return {
      platform: dto.platform,
      currentVersion: dto.version,
      minVersion,
      latestVersion,
      meetsMinimum,
      isLatest,
      // forceUpdate flag is only relevant if the version is below minimum
      mustUpdate: !meetsMinimum && forceUpdate,
      shouldUpdate: !isLatest,
      storeUrl,
      isMaintenanceMode: s.isMaintenanceMode,
    };
  }

  // ─── Delivery fee calculation helper (used by checkout) ───────────────────
  // Returns computed delivery fee based on distance and zone overrides.

  async calculateDeliveryFee(
    distanceKm: number,
    zoneBaseDeliveryFeeOverride?: number | null,
  ): Promise<number> {
    const s = await this.getSettings();

    // Zone override takes precedence over global base fee
    const baseFee =
      zoneBaseDeliveryFeeOverride != null
        ? Number(zoneBaseDeliveryFeeOverride)
        : Number(s.baseDeliveryFee);

    const perKm = Number(s.pricePerKm);
    const fee = baseFee + distanceKm * perKm;

    // Round to 2 decimal places
    return Math.round(fee * 100) / 100;
  }
}