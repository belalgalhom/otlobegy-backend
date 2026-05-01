import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { StorageService } from 'src/infrastructure/storage/storage.service';
import {
  CreateVendorDto,
  UpdateVendorDto,
  UpdateVendorStatusDto,
  QueryVendorsDto,
} from './dto/vendor.dto';

import {
  CommonSuccess,
  VendorErrors,
} from 'src/common/constants/response.constants';

@Injectable()
export class VendorsService {
  private readonly logger = new Logger(VendorsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  // ─── Admin: create ────────────────────────────────────────────────────────

  async create(dto: CreateVendorDto) {
    const slug = await this.generateUniqueSlug(dto.storeName);

    return this.prisma.vendor.create({
      data: {
        storeName: dto.storeName,
        storeNameAr: dto.storeNameAr ?? null,
        slug,
        description: dto.description ?? null,
        descriptionAr: dto.descriptionAr ?? null,
        verticalId: dto.verticalId,
        taxId: dto.taxId ?? null,
        commissionRate: dto.commissionRate ?? 10.0,
      },
      include: this.vendorIncludes(),
    });
  }

  // ─── Public / member: list ─────────────────────────────────────────────────

  async findAll(dto: QueryVendorsDto) {
    const { page = 1, limit = 20 } = dto;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };

    if (dto.status) where.status = dto.status;
    if (dto.verticalId) where.verticalId = dto.verticalId;
    if (dto.search) {
      where.OR = [
        { storeName: { contains: dto.search, mode: 'insensitive' } },
        { storeNameAr: { contains: dto.search, mode: 'insensitive' } },
      ];
    }

    const [vendors, total] = await Promise.all([
      this.prisma.vendor.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: this.vendorIncludes(),
      }),
      this.prisma.vendor.count({ where }),
    ]);

    return {
      vendors,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const vendor = await this.prisma.vendor.findFirst({
      where: { id, deletedAt: null },
      include: this.vendorIncludes(),
    });
    if (!vendor) throw new NotFoundException(VendorErrors.NOT_FOUND);
    return vendor;
  }

  async findBySlug(slug: string) {
    const vendor = await this.prisma.vendor.findFirst({
      where: { slug, deletedAt: null },
      include: this.vendorIncludes(),
    });
    if (!vendor) throw new NotFoundException(VendorErrors.NOT_FOUND);
    return vendor;
  }

  // ─── Admin: update ────────────────────────────────────────────────────────

  async update(id: string, dto: UpdateVendorDto) {
    await this.findOne(id);

    // If storeName changes and no explicit slug change is needed,
    // we do NOT auto-regenerate the slug to avoid breaking existing URLs.
    // Slug is immutable after creation unless the admin explicitly sets it
    // via a dedicated endpoint (not implemented — intentional).

    return this.prisma.vendor.update({
      where: { id },
      data: {
        ...(dto.storeName !== undefined && { storeName: dto.storeName }),
        ...(dto.storeNameAr !== undefined && { storeNameAr: dto.storeNameAr }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.descriptionAr !== undefined && {
          descriptionAr: dto.descriptionAr,
        }),
        ...(dto.verticalId !== undefined && { verticalId: dto.verticalId }),
        ...(dto.taxId !== undefined && { taxId: dto.taxId }),
        ...(dto.commissionRate !== undefined && {
          commissionRate: dto.commissionRate,
        }),
      },
      include: this.vendorIncludes(),
    });
  }

  async updateStatus(id: string, dto: UpdateVendorStatusDto) {
    await this.findOne(id);

    return this.prisma.vendor.update({
      where: { id },
      data: { status: dto.status },
      include: this.vendorIncludes(),
    });
  }

  // ─── Admin: logo & cover image ────────────────────────────────────────────

  async uploadLogo(id: string, file: Express.Multer.File) {
    const vendor = await this.findOne(id);

    if (vendor.logo) {
      await this.storage.delete(vendor.logo);
    }

    const logoUrl = await this.storage.upload(file, 'vendors/logos');
    this.logger.log(`Logo uploaded for vendor ${id}: ${logoUrl}`);

    await this.prisma.vendor.update({
      where: { id },
      data: { logo: logoUrl },
    });

    return { logo: logoUrl };
  }

  async uploadCover(id: string, file: Express.Multer.File) {
    const vendor = await this.findOne(id);

    if (vendor.coverImage) {
      await this.storage.delete(vendor.coverImage);
    }

    const coverUrl = await this.storage.upload(file, 'vendors/covers');
    this.logger.log(`Cover uploaded for vendor ${id}: ${coverUrl}`);

    await this.prisma.vendor.update({
      where: { id },
      data: { coverImage: coverUrl },
    });

    return { coverImage: coverUrl };
  }

  // ─── Admin: soft delete ───────────────────────────────────────────────────

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.vendor.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: CommonSuccess.RESOURCE_DELETED };
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  /**
   * Derives a URL-safe slug from the store name and appends a numeric suffix
   * if the base slug is already taken, e.g. "my-shop" → "my-shop-2".
   */
  private async generateUniqueSlug(storeName: string): Promise<string> {
    const base = storeName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 80);

    let slug = base;
    let count = 2;

    while (true) {
      const existing = await this.prisma.vendor.findUnique({
        where: { slug },
        select: { id: true },
      });

      if (!existing) break;

      slug = `${base}-${count}`;
      count++;
    }

    return slug;
  }

  private vendorIncludes() {
    return {
      vertical: {
        select: {
          id: true,
          name: true,
          nameAr: true,
          slug: true,
          iconUrl: true,
        },
      },
    };
  }
}
