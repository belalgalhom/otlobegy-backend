import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { AddVendorMemberDto, UpdateVendorMemberRoleDto } from './dto/vendor-member.dto';
import {
  VendorMemberErrors,
  VendorErrors,
} from 'src/common/constants/response.constants';
import { CommonSuccess } from '../../../common/constants/response.constants';
import { VendorMemberRole } from '@prisma/client';

@Injectable()
export class VendorMembersService {
  private readonly logger = new Logger(VendorMembersService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── List all members of a vendor ─────────────────────────────────────────

  async findAll(vendorId: string) {
    await this.assertVendorExists(vendorId);

    return this.prisma.vendorMember.findMany({
      where:   { vendorId },
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: {
            id:     true,
            name:   true,
            email:  true,
            avatar: true,
            title:  true,
            titleAr: true,
          },
        },
      },
    });
  }

  // ─── Add a new member ─────────────────────────────────────────────────────
  // Only OWNER (or admin with MANAGE_VENDORS) may add members.
  // The guard enforces the OWNER restriction at the route level;
  // this service just handles the business logic.

  async addMember(vendorId: string, dto: AddVendorMemberDto) {
    await this.assertVendorExists(vendorId);

    const user = await this.prisma.user.findUnique({
      where:  { id: dto.userId },
      select: { id: true },
    });
    if (!user) throw new NotFoundException(VendorMemberErrors.USER_NOT_FOUND);

    const existing = await this.prisma.vendorMember.findUnique({
      where: { vendorId_userId: { vendorId, userId: dto.userId } },
    });
    if (existing) throw new ConflictException(VendorMemberErrors.ALREADY_MEMBER);

    const member = await this.prisma.vendorMember.create({
      data: {
        vendorId,
        userId: dto.userId,
        role:   dto.role,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    });

    this.logger.log(
      `Member added to vendor ${vendorId}: user ${dto.userId} as ${dto.role}`,
    );

    return member;
  }

  // ─── Update a member's role ───────────────────────────────────────────────

  async updateRole(vendorId: string, memberId: string, dto: UpdateVendorMemberRoleDto) {
    const member = await this.findMember(vendorId, memberId);

    // Cannot demote the last OWNER — there must always be at least one.
    if (
      member.role === VendorMemberRole.OWNER &&
      dto.role    !== VendorMemberRole.OWNER
    ) {
      const ownerCount = await this.prisma.vendorMember.count({
        where: { vendorId, role: VendorMemberRole.OWNER },
      });

      if (ownerCount <= 1) {
        throw new BadRequestException(VendorMemberErrors.OWNER_REQUIRED);
      }
    }

    return this.prisma.vendorMember.update({
      where: { id: memberId },
      data:  { role: dto.role },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    });
  }

  // ─── Remove a member ──────────────────────────────────────────────────────

  async removeMember(vendorId: string, memberId: string, actorUserId: string) {
    const member = await this.findMember(vendorId, memberId);

    // Cannot remove yourself.
    if (member.userId === actorUserId) {
      throw new ForbiddenException(VendorMemberErrors.CANNOT_REMOVE_SELF);
    }

    // Cannot remove the last OWNER.
    if (member.role === VendorMemberRole.OWNER) {
      const ownerCount = await this.prisma.vendorMember.count({
        where: { vendorId, role: VendorMemberRole.OWNER },
      });

      if (ownerCount <= 1) {
        throw new BadRequestException(VendorMemberErrors.OWNER_REQUIRED);
      }
    }

    await this.prisma.vendorMember.delete({ where: { id: memberId } });

    this.logger.log(`Member ${memberId} removed from vendor ${vendorId}`);
    return { message: CommonSuccess.RESOURCE_DELETED };
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private async findMember(vendorId: string, memberId: string) {
    const member = await this.prisma.vendorMember.findFirst({
      where: { id: memberId, vendorId },
    });
    if (!member) throw new NotFoundException(VendorMemberErrors.NOT_FOUND);
    return member;
  }

  private async assertVendorExists(vendorId: string) {
    const vendor = await this.prisma.vendor.findFirst({
      where:  { id: vendorId, deletedAt: null },
      select: { id: true },
    });
    if (!vendor) throw new NotFoundException(VendorErrors.NOT_FOUND);
  }
}