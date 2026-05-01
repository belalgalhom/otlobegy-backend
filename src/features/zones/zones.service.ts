import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateZoneDto, UpdateZoneDto, CheckLocationDto } from './dto/zone.dto';
import { ZoneErrors, CommonSuccess } from '../../common/constants/response.constants';
import * as crypto from 'crypto';

@Injectable()
export class ZonesService {
  constructor(private readonly prisma: PrismaService) {}

  async createZone(dto: CreateZoneDto) {
    const id = crypto.randomUUID();

    const geoJson = JSON.stringify({
      type: 'Polygon',
      coordinates: dto.boundary,
    });

    try {
      await this.prisma.$executeRaw`
        INSERT INTO "zones" (
          "id", "name", "nameAr", "isActive", 
          "baseDeliveryFeeOverride", "minOrderAmountOverride", 
          "boundary", "createdAt", "updatedAt"
        ) VALUES (
          ${id}, 
          ${dto.name}, 
          ${dto.nameAr ?? null}, 
          ${dto.isActive ?? true}, 
          ${dto.baseDeliveryFeeOverride ?? null}, 
          ${dto.minOrderAmountOverride ?? null}, 
          ST_SetSRID(ST_GeomFromGeoJSON(${geoJson}), 4326), 
          NOW(), 
          NOW()
        );
      `;

      return await this.getZoneById(id);
    } catch (error) {
      throw new BadRequestException(ZoneErrors.INVALID_BOUNDARY);
    }
  }

  async getAllZones() {
    const zones = await this.prisma.$queryRaw<any[]>`
      SELECT 
        "id", "name", "nameAr", "isActive", 
        "baseDeliveryFeeOverride", "minOrderAmountOverride",
        "createdAt", "updatedAt",
        ST_AsGeoJSON("boundary")::json AS boundary
      FROM "zones"
      ORDER BY "createdAt" DESC;
    `;
    return zones;
  }

  async getZoneById(id: string) {
    const zones = await this.prisma.$queryRaw<any[]>`
      SELECT 
        "id", "name", "nameAr", "isActive", 
        "baseDeliveryFeeOverride", "minOrderAmountOverride",
        "createdAt", "updatedAt",
        ST_AsGeoJSON("boundary")::json AS boundary
      FROM "zones"
      WHERE "id" = ${id};
    `;

    if (!zones || zones.length === 0) {
      throw new NotFoundException(ZoneErrors.NOT_FOUND);
    }

    return zones[0];
  }

  async findZoneByLocation(dto: CheckLocationDto) {
    const zones = await this.prisma.$queryRaw<any[]>`
      SELECT 
        "id", "name", "nameAr", "isActive",
        "baseDeliveryFeeOverride", "minOrderAmountOverride"
      FROM "zones"
      WHERE ST_Contains("boundary", ST_SetSRID(ST_MakePoint(${dto.longitude}, ${dto.latitude}), 4326))
      AND "isActive" = true
      LIMIT 1;
    `;

    if (!zones || zones.length === 0) {
      throw new NotFoundException(ZoneErrors.NOT_FOUND);
    }

    return zones[0];
  }

  async updateZone(id: string, dto: UpdateZoneDto) {
    await this.getZoneById(id); 
    
    if (dto.boundary) {
      const geoJson = JSON.stringify({
        type: 'Polygon',
        coordinates: dto.boundary,
      });

      try {
        await this.prisma.$executeRaw`
          UPDATE "zones" SET 
            "boundary" = ST_SetSRID(ST_GeomFromGeoJSON(${geoJson}), 4326),
            "updatedAt" = NOW()
          WHERE "id" = ${id};
        `;
      } catch (error) {
        throw new BadRequestException(ZoneErrors.INVALID_BOUNDARY);
      }
    }
    
    const { boundary, ...standardFields } = dto;

    if (Object.keys(standardFields).length > 0) {
      await this.prisma.zone.update({
        where: { id },
        data: standardFields,
      });
    }

    return this.getZoneById(id);
  }

  async deleteZone(id: string) {
    await this.getZoneById(id);
    
    await this.prisma.zone.delete({ where: { id } });

    return { message: CommonSuccess.RESOURCE_DELETED };
  }
}