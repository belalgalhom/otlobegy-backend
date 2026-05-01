import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  ConversationStatus,
  ConversationType,
  Role,
  Permission,
} from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import {
  CreateOrderConversationDto,
  CreateSupportConversationDto,
  QueryConversationsDto,
} from './dto/chat.dto';
import { JwtAccessPayload } from '../../common/interfaces/jwt-payload.interface';
import {
  ChatConversationCreatedEvent,
  ChatConversationClosedEvent,
} from '../../common/events';
import { EVENTS } from '../../common/events/event-names';
import { ChatErrors } from '../../common/constants/response.constants';

@Injectable()
export class ConversationsService {
  private readonly logger = new Logger(ConversationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private async canManageConversations(
    actorId: string,
    actorRole: Role,
  ): Promise<boolean> {
    if (actorRole === Role.SUPER_ADMIN) return true;

    const user = await this.prisma.user.findUnique({
      where: { id: actorId },
      select: { permissions: true },
    });

    return (
      !!user &&
      (user.permissions.includes(Permission.MANAGE_CONVERSATIONS) ||
        user.permissions.includes(Permission.MANAGE_TICKETS))
    );
  }

  async createOrderConversation(
    actor: JwtAccessPayload,
    dto: CreateOrderConversationDto,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      select: {
        id: true,
        customerId: true,
        vendorId: true,
        driverId: true,
        customer: { select: { userId: true } },
      },
    });

    if (!order) throw new NotFoundException(ChatErrors.ORDER_NOT_FOUND);

    const isCustomer = order.customer.userId === actor.sub;
    const isVendorMember =
      actor.role === Role.VENDOR_MEMBER ||
      (await this.canManageConversations(actor.sub, actor.role));

    if (!isCustomer && !isVendorMember) {
      throw new ForbiddenException(ChatErrors.NOT_AUTHORIZED);
    }

    const existing = await this.prisma.conversation.findFirst({
      where: {
        orderId: dto.orderId,
        type: ConversationType.ORDER,
        status: ConversationStatus.OPEN,
      },
      include: this.conversationIncludes(actor.sub),
    });

    if (existing) return this.formatConversation(existing, actor.sub);

    const vendorMembers = await this.prisma.vendorMember.findMany({
      where: { vendorId: order.vendorId },
      select: { userId: true },
    });

    const participantUserIds = [
      ...new Set([
        order.customer.userId,
        ...vendorMembers.map((m) => m.userId),
      ]),
    ];

    const conversation = await this.prisma.conversation.create({
      data: {
        type: ConversationType.ORDER,
        orderId: dto.orderId,
        vendorId: order.vendorId,
        status: ConversationStatus.OPEN,
        participants: {
          create: participantUserIds.map((userId) => ({ userId })),
        },
      },
      include: this.conversationIncludes(actor.sub),
    });

    this.eventEmitter.emit(
      EVENTS.CHAT_CONVERSATION_CREATED,
      new ChatConversationCreatedEvent(
        conversation.id,
        participantUserIds,
        ConversationType.ORDER,
        dto.orderId,
      ),
    );

    this.logger.log(
      `Order conversation created: ${conversation.id} (order ${dto.orderId})`,
    );
    return this.formatConversation(conversation, actor.sub);
  }

  async createSupportConversation(
    actor: JwtAccessPayload,
    dto: CreateSupportConversationDto,
  ) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id: dto.vendorId },
      select: { id: true },
    });

    if (!vendor) throw new NotFoundException(ChatErrors.VENDOR_NOT_FOUND);

    if (!(await this.canManageConversations(actor.sub, actor.role))) {
      throw new ForbiddenException(ChatErrors.NOT_SUPPORT_AGENT);
    }

    const vendorMembers = await this.prisma.vendorMember.findMany({
      where: { vendorId: dto.vendorId },
      select: { userId: true },
    });

    const participantUserIds = [
      ...new Set([actor.sub, ...vendorMembers.map((m) => m.userId)]),
    ];

    const conversation = await this.prisma.conversation.create({
      data: {
        type: ConversationType.SUPPORT,
        vendorId: dto.vendorId,
        status: ConversationStatus.OPEN,
        participants: {
          create: participantUserIds.map((userId) => ({ userId })),
        },
      },
      include: this.conversationIncludes(actor.sub),
    });

    this.eventEmitter.emit(
      EVENTS.CHAT_CONVERSATION_CREATED,
      new ChatConversationCreatedEvent(
        conversation.id,
        participantUserIds,
        ConversationType.SUPPORT,
        null,
      ),
    );

    return this.formatConversation(conversation, actor.sub);
  }

  async listMyConversations(
    actor: JwtAccessPayload,
    dto: QueryConversationsDto,
  ) {
    const { page = 1, limit = 20 } = dto;
    const skip = (page - 1) * limit;

    const [conversations, total] = await Promise.all([
      this.prisma.conversation.findMany({
        where: {
          participants: { some: { userId: actor.sub } },
          status: { not: ConversationStatus.ARCHIVED },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
        include: this.conversationIncludes(actor.sub),
      }),
      this.prisma.conversation.count({
        where: {
          participants: { some: { userId: actor.sub } },
          status: { not: ConversationStatus.ARCHIVED },
        },
      }),
    ]);

    return {
      conversations: conversations.map((c) =>
        this.formatConversation(c, actor.sub),
      ),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getConversation(actor: JwtAccessPayload, conversationId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: this.conversationIncludes(actor.sub),
    });

    if (!conversation)
      throw new NotFoundException(ChatErrors.CONVERSATION_NOT_FOUND);

    await this.assertParticipant(conversation, actor);
    return this.formatConversation(conversation, actor.sub);
  }

  async closeConversation(actor: JwtAccessPayload, conversationId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { participants: true },
    });

    if (!conversation)
      throw new NotFoundException(ChatErrors.CONVERSATION_NOT_FOUND);

    await this.assertParticipant(conversation, actor);

    if (conversation.status !== ConversationStatus.OPEN) {
      throw new BadRequestException(ChatErrors.CONVERSATION_NOT_OPEN);
    }

    const updated = await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { status: ConversationStatus.CLOSED },
    });

    const participantIds = conversation.participants.map((p) => p.userId);

    this.eventEmitter.emit(
      EVENTS.CHAT_CONVERSATION_CLOSED,
      new ChatConversationClosedEvent(
        conversationId,
        participantIds,
        actor.sub,
      ),
    );

    return updated;
  }

  async assertParticipant(
    conversation: { participants: { userId: string }[] },
    actor: JwtAccessPayload,
  ) {
    if (conversation.participants.some((p) => p.userId === actor.sub)) {
      return;
    }

    const canManage = await this.canManageConversations(actor.sub, actor.role);

    if (!canManage) {
      throw new ForbiddenException(ChatErrors.NOT_A_PARTICIPANT);
    }
  }

  private conversationIncludes(viewerUserId: string) {
    return {
      participants: {
        include: {
          user: {
            select: { id: true, name: true, avatar: true, role: true },
          },
        },
      },
      messages: {
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' as const },
        take: 1,
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true,
              role: true,
              title: true,
            },
          },
        },
      },
      _count: {
        select: { messages: true },
      },
    };
  }

  private formatConversation(conversation: any, viewerUserId: string) {
    const myParticipant = conversation.participants.find(
      (p: any) => p.userId === viewerUserId,
    );

    const lastMessage = conversation.messages[0] ?? null;

    return {
      id: conversation.id,
      type: conversation.type,
      status: conversation.status,
      orderId: conversation.orderId,
      vendorId: conversation.vendorId,
      participants: conversation.participants.map((p: any) => ({
        userId: p.userId,
        name: p.user.name,
        avatar: p.user.avatar,
        role: p.user.role,
        lastReadAt: p.lastReadAt,
        joinedAt: p.joinedAt,
      })),
      lastMessage: lastMessage
        ? {
            id: lastMessage.id,
            type: lastMessage.type,
            text: lastMessage.text,
            mediaUrl: lastMessage.mediaUrl,
            senderId: lastMessage.senderId,
            senderName: lastMessage.sender.name,
            senderRole: lastMessage.sender.role,
            senderTitle: lastMessage.sender.title,
            createdAt: lastMessage.createdAt,
          }
        : null,
      myLastReadAt: myParticipant?.lastReadAt ?? null,
      totalMessages: conversation._count?.messages ?? 0,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    };
  }
}
