import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateAddressDto, UpdateAddressDto } from './dto/customer.dto';
import { CustomerErrors } from 'src/common/constants/response.constants';
import { Prisma } from '@prisma/client';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async getCustomerByUserId(userId: string) {
    let customer = await this.prisma.customer.findUnique({
      where: { userId },
    });

    if (!customer) {
      customer = await this.prisma.customer.create({
        data: { userId },
      });
    }

    return customer;
  }

  async assertCanOrder(userId: string) {
    const customer = await this.getCustomerByUserId(userId);

    if (!customer.canOrder) {
      throw new ForbiddenException(CustomerErrors.CANNOT_ORDER);
    }

    return customer;
  }

  async getAddresses(userId: string) {
    const customer = await this.getCustomerByUserId(userId);

    return this.prisma.$queryRaw`
      SELECT 
        id, 
        label, 
        address, 
        details, 
        "isDefault", 
        ST_AsGeoJSON(location)::json as location, 
        "createdAt", 
        "updatedAt"
      FROM addresses
      WHERE "customerId" = ${customer.id}::uuid
      ORDER BY "createdAt" DESC;
    `;
  }

  async createAddress(userId: string, dto: CreateAddressDto) {
    const customer = await this.getCustomerByUserId(userId);

    if (dto.isDefault) {
      await this.prisma.address.updateMany({
        where: { customerId: customer.id },
        data: { isDefault: false },
      });
    }

    const [address] = await this.prisma.$queryRaw<any[]>`
      INSERT INTO addresses (id, "customerId", label, address, details, "isDefault", location, "updatedAt")
      VALUES (
        gen_random_uuid(), 
        ${customer.id}::uuid, 
        ${dto.label ?? 'Home'}, 
        ${dto.address}, 
        ${dto.details ?? null}, 
        ${dto.isDefault ?? false}, 
        ST_SetSRID(ST_MakePoint(${dto.location[0]}, ${dto.location[1]}), 4326),
        NOW()
      )
      RETURNING id, label, address, details, "isDefault", ST_AsGeoJSON(location)::json as location;
    `;

    return address;
  }

  async updateAddress(userId: string, addressId: string, dto: UpdateAddressDto) {
    const customer = await this.getCustomerByUserId(userId);

    const address = await this.prisma.address.findFirst({
      where: { id: addressId, customerId: customer.id },
    });

    if (!address) throw new NotFoundException(CustomerErrors.ADDRESS_NOT_FOUND);

    if (dto.isDefault) {
      await this.prisma.address.updateMany({
        where: { customerId: customer.id, id: { not: addressId } },
        data: { isDefault: false },
      });
    }

    const locationUpdate = dto.location
      ? Prisma.sql`ST_SetSRID(ST_MakePoint(${dto.location[0]}, ${dto.location[1]}), 4326)`
      : Prisma.sql`location`;

    const [updated] = await this.prisma.$queryRaw<any[]>`
      UPDATE addresses 
      SET 
        label = COALESCE(${dto.label ?? null}, label),
        address = COALESCE(${dto.address ?? null}, address),
        details = COALESCE(${dto.details ?? null}, details),
        "isDefault" = COALESCE(${dto.isDefault ?? null}, "isDefault"),
        location = ${locationUpdate},
        "updatedAt" = NOW()
      WHERE id = ${addressId}::uuid AND "customerId" = ${customer.id}::uuid
      RETURNING id, label, address, details, "isDefault", ST_AsGeoJSON(location)::json as location;
    `;

    return updated;
  }

  async deleteAddress(userId: string, addressId: string) {
    const customer = await this.getCustomerByUserId(userId);

    const result = await this.prisma.address.deleteMany({
      where: { id: addressId, customerId: customer.id },
    });

    if (result.count === 0) throw new NotFoundException(CustomerErrors.ADDRESS_NOT_FOUND);
    return { success: true };
  }

  async toggleFavoriteVendor(userId: string, vendorId: string) {
    const customer = await this.getCustomerByUserId(userId);

    const existing = await this.prisma.favoriteVendor.findUnique({
      where: { customerId_vendorId: { customerId: customer.id, vendorId } },
    });

    if (existing) {
      await this.prisma.favoriteVendor.delete({ where: { id: existing.id } });
      return { isFavorite: false };
    }

    const vendor = await this.prisma.vendor.findUnique({ where: { id: vendorId } });
    if (!vendor) throw new NotFoundException(CustomerErrors.FAVORITE_VENDOR_NOT_FOUND);

    await this.prisma.favoriteVendor.create({
      data: { customerId: customer.id, vendorId },
    });
    return { isFavorite: true };
  }

  async toggleFavoriteProduct(userId: string, productId: string) {
    const customer = await this.getCustomerByUserId(userId);

    const existing = await this.prisma.favoriteProduct.findUnique({
      where: { customerId_productId: { customerId: customer.id, productId } },
    });

    if (existing) {
      await this.prisma.favoriteProduct.delete({ where: { id: existing.id } });
      return { isFavorite: false };
    }

    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException(CustomerErrors.FAVORITE_PRODUCT_NOT_FOUND);

    await this.prisma.favoriteProduct.create({
      data: { customerId: customer.id, productId },
    });
    return { isFavorite: true };
  }

  async getFavorites(userId: string) {
    const customer = await this.getCustomerByUserId(userId);

    const [vendors, products] = await Promise.all([
      this.prisma.favoriteVendor.findMany({
        where: { customerId: customer.id },
        include: { vendor: { select: { id: true, storeName: true, logo: true } } },
      }),
      this.prisma.favoriteProduct.findMany({
        where: { customerId: customer.id },
        include: { product: { select: { id: true, name: true, imageUrl: true, basePrice: true } } },
      }),
    ]);

    return {
      vendors:  vendors.map((v) => v.vendor),
      products: products.map((p) => p.product),
    };
  }
}