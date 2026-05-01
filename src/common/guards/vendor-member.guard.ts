import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permission, Role, VendorMemberRole } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { JwtAccessPayload } from '../interfaces/jwt-payload.interface';
import {
  VENDOR_MEMBER_ROLES_KEY,
  VENDOR_ID_PARAM_KEY,
} from '../decorators/vendor-member.decorator';

@Injectable()
export class VendorMemberGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<{ user?: JwtAccessPayload; params: Record<string, string> }>();

    const user = request.user;
    if (!user?.sub) throw new UnauthorizedException();

    // SUPER_ADMIN always has full access across all vendors.
    if (user.role === Role.SUPER_ADMIN) return true;

    // ADMIN users with the MANAGE_VENDORS permission have full access across
    // all vendors without needing to be a member of any specific one.
    if (user.role === Role.ADMIN) {
      const dbUser = await this.prisma.user.findUnique({
        where:  { id: user.sub },
        select: { permissions: true },
      });

      if (dbUser?.permissions.includes(Permission.MANAGE_VENDORS)) return true;
    }

    // Resolve which route param holds the vendor id.
    const vendorIdParam = this.reflector.getAllAndOverride<string>(
      VENDOR_ID_PARAM_KEY,
      [context.getHandler(), context.getClass()],
    ) ?? 'vendorId';

    const vendorId = request.params[vendorIdParam];

    if (!vendorId) {
      // Guard is misconfigured — the param name doesn't match the route.
      throw new ForbiddenException(
        `VendorMemberGuard: route param "${vendorIdParam}" not found`,
      );
    }

    // Confirm the vendor exists before checking membership so we return 404
    // rather than a misleading 403 when the vendor id is simply wrong.
    const vendor = await this.prisma.vendor.findUnique({
      where:  { id: vendorId },
      select: { id: true },
    });

    if (!vendor) throw new NotFoundException('Vendor not found');

    // Look up the membership row for this user + vendor pair.
    const membership = await this.prisma.vendorMember.findUnique({
      where: {
        vendorId_userId: { vendorId, userId: user.sub },
      },
      select: { role: true },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this vendor');
    }

    const requiredRoles = this.reflector.getAllAndOverride<VendorMemberRole[]>(
      VENDOR_MEMBER_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    ) ?? [];

    if (requiredRoles.length > 0 && !requiredRoles.includes(membership.role)) {
      throw new ForbiddenException(
        `This action requires one of the following vendor roles: ${requiredRoles.join(', ')}`,
      );
    }
    
    (request as any).vendorMemberRole = membership.role;

    return true;
  }
}