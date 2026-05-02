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
import { Prisma } from '@prisma/client';
import { randomBytes } from 'crypto';

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
    const base = dto.storeName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 80) || 'vendor';

    let slug = base;
    let attempts = 0;

    while (attempts < 5) {
      try {
        return await this.prisma.vendor.create({
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
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          slug = `${base}-${randomBytes(3).toString('hex')}`;
          attempts++;
          continue;
        }
        throw error;
      }
    }
    throw new ConflictException('Unable to generate unique slug for vendor');
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
    const vendor = await this.prisma.vendor.findUnique({
      where: { id },
      select: { deletedAt: true },
    });
    if (!vendor || vendor.deletedAt) throw new NotFoundException(VendorErrors.NOT_FOUND);

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
    const vendor = await this.prisma.vendor.findUnique({
      where: { id },
      select: { deletedAt: true },
    });
    if (!vendor || vendor.deletedAt) throw new NotFoundException(VendorErrors.NOT_FOUND);

    return this.prisma.vendor.update({
      where: { id },
      data: { status: dto.status },
      include: this.vendorIncludes(),
    });
  }

  // ─── Admin: logo & cover image ────────────────────────────────────────────

  async uploadLogo(id: string, file: Express.Multer.File) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id },
      select: { deletedAt: true, logo: true },
    });
    if (!vendor || vendor.deletedAt) throw new NotFoundException(VendorErrors.NOT_FOUND);

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
    const vendor = await this.prisma.vendor.findUnique({
      where: { id },
      select: { deletedAt: true, coverImage: true },
    });
    if (!vendor || vendor.deletedAt) throw new NotFoundException(VendorErrors.NOT_FOUND);

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
    const vendor = await this.prisma.vendor.findUnique({
      where: { id },
      select: { deletedAt: true },
    });
    if (!vendor || vendor.deletedAt) throw new NotFoundException(VendorErrors.NOT_FOUND);

    await this.prisma.vendor.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: CommonSuccess.RESOURCE_DELETED };
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

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
