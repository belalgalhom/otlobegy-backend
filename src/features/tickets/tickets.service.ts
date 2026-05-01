import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { JwtAccessPayload } from '../../common/interfaces/jwt-payload.interface';
import {
  CreateTicketDto,
  UpdateTicketDto,
  QueryTicketsDto,
} from './dto/ticket.dto';
import { ConversationStatus, ConversationType, Role, TicketStatus, Permission } from '@prisma/client';
import { TicketErrors } from '../../common/constants/response.constants';
import { TicketStatusUpdatedEvent } from '../../common/events';
import { EVENTS } from '../../common/events/event-names';

const CREATOR_ROLES = new Set<Role>([
  Role.CUSTOMER,
  Role.DRIVER,
  Role.VENDOR_MEMBER,
]);

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private async canManageTickets(actorId: string, actorRole: Role): Promise<boolean> {
    if (actorRole === Role.SUPER_ADMIN) return true;

    const user = await this.prisma.user.findUnique({
      where: { id: actorId },
      select: { permissions: true },
    });

    return !!user?.permissions.includes(Permission.MANAGE_TICKETS);
  }

  async create(actor: JwtAccessPayload, dto: CreateTicketDto) {
    if (!CREATOR_ROLES.has(actor.role) && !(await this.canManageTickets(actor.sub, actor.role))) {
      throw new ForbiddenException(TicketErrors.CANNOT_CREATE);
    }

    if (dto.orderId)  await this.assertOrderExists(dto.orderId);
    if (dto.vendorId) await this.assertVendorExists(dto.vendorId);

    const ticketNumber = await this.generateTicketNumber();

    const ticket = await this.prisma.$transaction(async (tx) => {
      const created = await tx.supportTicket.create({
        data: {
          ticketNumber,
          subject:     dto.subject,
          description: dto.description ?? null,
          category:    dto.category,
          priority:    dto.priority,
          status:      TicketStatus.OPEN,
          creatorId:   actor.sub,
          orderId:     dto.orderId  ?? null,
          vendorId:    dto.vendorId ?? null,
        },
      });

      const conversation = await tx.conversation.create({
        data: {
          type:     ConversationType.SUPPORT,
          status:   ConversationStatus.OPEN,
          vendorId: dto.vendorId ?? null,
          participants: {
            create: [{ userId: actor.sub }],
          },
        },
      });

      const updated = await tx.supportTicket.update({
        where: { id: created.id },
        data:  { conversationId: conversation.id },
        include: this.ticketIncludes(),
      });

      return updated;
    });

    this.logger.log(`Ticket created: ${ticket.ticketNumber} by user ${actor.sub}`);
    return this.formatTicket(ticket);
  }

  async list(actor: JwtAccessPayload, dto: QueryTicketsDto) {
    const { page = 1, limit = 20 } = dto;
    const skip = (page - 1) * limit;

    const canManageAll = await this.canManageTickets(actor.sub, actor.role);

    const where: any = {};

    if (!canManageAll) {
      where.creatorId = actor.sub;
    } else {
      if (dto.creatorId)  where.creatorId  = dto.creatorId;
      if (dto.assigneeId) where.assigneeId = dto.assigneeId;
    }

    if (dto.status)   where.status   = dto.status;
    if (dto.priority) where.priority = dto.priority;
    if (dto.category) where.category = dto.category;

    const [tickets, total] = await Promise.all([
      this.prisma.supportTicket.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: this.ticketIncludes(),
      }),
      this.prisma.supportTicket.count({ where }),
    ]);

    return {
      tickets: tickets.map((t) => this.formatTicket(t)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getOne(actor: JwtAccessPayload, ticketId: string) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where:   { id: ticketId },
      include: this.ticketIncludes(),
    });

    if (!ticket) throw new NotFoundException(TicketErrors.NOT_FOUND);

    await this.assertAccess(actor, ticket);
    return this.formatTicket(ticket);
  }

  async update(actor: JwtAccessPayload, ticketId: string, dto: UpdateTicketDto) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) throw new NotFoundException(TicketErrors.NOT_FOUND);

    const canManageAll = await this.canManageTickets(actor.sub, actor.role);
    const isCreator    = ticket.creatorId === actor.sub;

    if (!canManageAll && !isCreator) {
      throw new ForbiddenException(TicketErrors.CANNOT_UPDATE);
    }

    if (!canManageAll) {
      const allowedKeys = new Set(['status']);
      const attemptedKeys = Object.keys(dto).filter(
        (k) => dto[k as keyof UpdateTicketDto] !== undefined,
      );

      if (attemptedKeys.some((k) => !allowedKeys.has(k))) {
        throw new ForbiddenException(TicketErrors.CANNOT_UPDATE);
      }

      if (dto.status && dto.status !== TicketStatus.CLOSED) {
        throw new ForbiddenException(TicketErrors.CANNOT_UPDATE);
      }
    }

    if (dto.assigneeId) {
      await this.assertAssigneeCanManage(dto.assigneeId);
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.supportTicket.update({
        where: { id: ticketId },
        data: {
          ...(dto.subject      !== undefined && { subject:      dto.subject }),
          ...(dto.description  !== undefined && { description:  dto.description }),
          ...(dto.status       !== undefined && { status:       dto.status }),
          ...(dto.priority     !== undefined && { priority:     dto.priority }),
          ...(dto.category     !== undefined && { category:     dto.category }),
          ...(dto.assigneeId   !== undefined && { assigneeId:   dto.assigneeId }),
        },
        include: this.ticketIncludes(),
      });

      if (dto.assigneeId && result.conversationId) {
        const alreadyIn = await tx.conversationParticipant.findUnique({
          where: {
            conversationId_userId: {
              conversationId: result.conversationId,
              userId:         dto.assigneeId,
            },
          },
        });

        if (!alreadyIn) {
          await tx.conversationParticipant.create({
            data: {
              conversationId: result.conversationId,
              userId:         dto.assigneeId,
            },
          });
        }
      }

      if (
        dto.status === TicketStatus.RESOLVED ||
        dto.status === TicketStatus.CLOSED
      ) {
        if (result.conversationId) {
          await tx.conversation.update({
            where: { id: result.conversationId },
            data:  { status: ConversationStatus.CLOSED },
          });
        }
      }

      return result;
    });

    if (dto.status && dto.status !== ticket.status) {
      this.eventEmitter.emit(
        EVENTS.TICKET_STATUS_UPDATED,
        new TicketStatusUpdatedEvent(
          updated.id,
          updated.ticketNumber,
          updated.status,
          updated.creatorId,
          actor.sub,
        ),
      );
    }

    this.logger.log(`Ticket ${ticket.ticketNumber} updated by user ${actor.sub}`);
    return this.formatTicket(updated);
  }

  async remove(actor: JwtAccessPayload, ticketId: string) {
    if (!(await this.canManageTickets(actor.sub, actor.role))) {
      throw new ForbiddenException(TicketErrors.CANNOT_DELETE);
    }

    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) throw new NotFoundException(TicketErrors.NOT_FOUND);

    await this.prisma.supportTicket.delete({ where: { id: ticketId } });

    this.logger.log(`Ticket ${ticket.ticketNumber} deleted by manager ${actor.sub}`);
    return { deleted: true };
  }

  private async generateTicketNumber(): Promise<string> {
    const result = await this.prisma.$queryRaw<[{ nextval: bigint }]>`
      SELECT nextval('ticket_number_seq')
    `;
    const seq = Number(result[0].nextval);
    return `TKT-${String(seq).padStart(6, '0')}`;
  }

  private async assertOrderExists(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where:  { id: orderId },
      select: { id: true },
    });
    if (!order) throw new NotFoundException(TicketErrors.ORDER_NOT_FOUND);
  }

  private async assertVendorExists(vendorId: string) {
    const vendor = await this.prisma.vendor.findUnique({
      where:  { id: vendorId },
      select: { id: true },
    });
    if (!vendor) throw new NotFoundException(TicketErrors.VENDOR_NOT_FOUND);
  }

  private async assertAssigneeCanManage(assigneeId: string) {
    const user = await this.prisma.user.findUnique({
      where:  { id: assigneeId },
      select: { role: true, permissions: true },
    });

    if (!user) throw new BadRequestException(TicketErrors.ASSIGNEE_MUST_BE_ADMIN);

    const canManage =
      user.role === Role.SUPER_ADMIN ||
      user.permissions.includes(Permission.MANAGE_TICKETS);

    if (!canManage) throw new BadRequestException(TicketErrors.ASSIGNEE_MUST_BE_ADMIN);
  }

  private async assertAccess(
    actor: JwtAccessPayload,
    ticket: { creatorId: string; assigneeId: string | null },
  ) {
    if (ticket.creatorId === actor.sub) return;
    if (await this.canManageTickets(actor.sub, actor.role)) return;
    throw new ForbiddenException(TicketErrors.CANNOT_VIEW);
  }

  private ticketIncludes() {
    return {
      creator: {
        select: { id: true, name: true, avatar: true, role: true },
      },
      assignee: {
        select: { id: true, name: true, avatar: true, role: true },
      },
      order: {
        select: { id: true, orderNumber: true, status: true },
      },
      vendor: {
        select: { id: true, storeName: true, logo: true },
      },
      conversation: {
        select: { id: true, status: true },
      },
    } as const;
  }

  private formatTicket(ticket: any) {
    return {
      id:             ticket.id,
      ticketNumber:   ticket.ticketNumber,
      subject:        ticket.subject,
      description:    ticket.description,
      status:         ticket.status,
      category:       ticket.category,
      priority:       ticket.priority,
      creator:        ticket.creator,
      assignee:       ticket.assignee       ?? null,
      order:          ticket.order          ?? null,
      vendor:         ticket.vendor         ?? null,
      conversationId: ticket.conversationId ?? null,
      conversation:   ticket.conversation   ?? null,
      createdAt:      ticket.createdAt,
      updatedAt:      ticket.updatedAt,
    };
  }
}