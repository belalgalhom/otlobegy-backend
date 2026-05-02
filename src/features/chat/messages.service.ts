import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConversationStatus, MessageType } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { SendMessageDto, QueryMessagesDto, MarkReadDto } from './dto/chat.dto';
import { JwtAccessPayload } from '../../common/interfaces/jwt-payload.interface';
import { ChatMessageSentEvent } from '../../common/events';
import { EVENTS } from '../../common/events/event-names';
import { ChatErrors } from '../../common/constants/response.constants';

const MEDIA_TYPES = new Set<MessageType>([
  MessageType.IMAGE,
  MessageType.VIDEO,
  MessageType.AUDIO,
]);

// Minimal snapshot of the replied-to message shown inline
const REPLY_TO_INCLUDE = {
  select: {
    id: true,
    type: true,
    text: true,
    mediaUrl: true,
    deletedAt: true,
    sender: {
      select: { id: true, name: true, avatar: true },
    },
  },
};

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async send(
    actor: JwtAccessPayload,
    conversationId: string,
    dto: SendMessageDto,
  ) {
    if (dto.type === MessageType.SYSTEM) {
      throw new ForbiddenException(ChatErrors.CANNOT_SEND_SYSTEM_MESSAGE);
    }

    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { participants: true },
    });

    if (!conversation)
      throw new NotFoundException(ChatErrors.CONVERSATION_NOT_FOUND);

    const isParticipant = conversation.participants.some(
      (p) => p.userId === actor.sub,
    );
    if (!isParticipant)
      throw new ForbiddenException(ChatErrors.NOT_A_PARTICIPANT);

    if (conversation.status !== ConversationStatus.OPEN) {
      throw new BadRequestException(ChatErrors.CONVERSATION_CLOSED);
    }

    this.validateMessageContent(dto);

    if (dto.replyToId) {
      const replyTo = await this.prisma.message.findUnique({
        where: { id: dto.replyToId },
        select: { id: true, conversationId: true, deletedAt: true },
      });

      if (!replyTo || replyTo.conversationId !== conversationId) {
        throw new BadRequestException(ChatErrors.REPLY_TO_NOT_FOUND);
      }

      if (replyTo.deletedAt) {
        throw new BadRequestException(ChatErrors.REPLY_TO_DELETED);
      }
    }

    const message = await this.prisma.$transaction(async (tx) => {
      const msg = await tx.message.create({
        data: {
          conversationId,
          senderId: actor.sub,
          type: dto.type,
          text: dto.text ?? null,
          mediaUrl: dto.mediaUrl ?? null,
          metadata: (dto.metadata as Record<string, any>) ?? undefined,
          replyToId: dto.replyToId ?? null,
        },
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
          replyTo: REPLY_TO_INCLUDE,
        },
      });

      await tx.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });

      await tx.conversationParticipant.update({
        where: { conversationId_userId: { conversationId, userId: actor.sub } },
        data: { lastReadAt: msg.createdAt },
      });

      return msg;
    });

    const participantIds = conversation.participants.map((p) => p.userId);

    this.eventEmitter.emit(
      EVENTS.CHAT_MESSAGE_SENT,
      new ChatMessageSentEvent(
        message.id,
        conversationId,
        actor.sub,
        participantIds,
        message.text,
        message.type,
        message.mediaUrl,
        message.metadata as Record<string, any> | null,
        message.createdAt,
      ),
    );

    this.logger.log(
      `Message sent: ${message.id} [${message.type}] in ${conversationId}`,
    );
    return this.formatMessage(message);
  }

  async sendSystemMessage(
    conversationId: string,
    text: string,
    metadata?: Record<string, any>,
  ) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      select: {
        id: true,
        status: true,
        participants: { select: { userId: true } },
      },
    });

    if (!conversation || conversation.status !== ConversationStatus.OPEN)
      return null;

    const message = await this.prisma.message.create({
      data: {
        conversationId,
        senderId: 'system',
        type: MessageType.SYSTEM,
        text,
        metadata: metadata ?? undefined,
      },
    });

    const participantIds = conversation.participants.map((p) => p.userId);

    this.eventEmitter.emit(
      EVENTS.CHAT_MESSAGE_SENT,
      new ChatMessageSentEvent(
        message.id,
        conversationId,
        'system',
        participantIds,
        text,
        MessageType.SYSTEM,
        null,
        metadata ?? null,
        message.createdAt,
      ),
    );

    return this.formatMessage(message);
  }

  async list(
    actor: JwtAccessPayload,
    conversationId: string,
    dto: QueryMessagesDto,
  ) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { participants: true },
    });

    if (!conversation)
      throw new NotFoundException(ChatErrors.CONVERSATION_NOT_FOUND);

    const isParticipant = conversation.participants.some(
      (p) => p.userId === actor.sub,
    );
    if (!isParticipant)
      throw new ForbiddenException(ChatErrors.NOT_A_PARTICIPANT);

    const { before, limit = 30 } = dto;

    let cursorFilter: any = {};
    if (before) {
      const cursorMsg = await this.prisma.message.findUnique({
        where: { id: before },
        select: { createdAt: true },
      });
      if (cursorMsg) {
        cursorFilter = { createdAt: { lt: cursorMsg.createdAt } };
      }
    }

    const messages = await this.prisma.message.findMany({
      where: {
        conversationId,
        deletedAt: null,
        ...cursorFilter,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
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
        replyTo: REPLY_TO_INCLUDE,
      },
    });

    const ordered = [...messages].reverse();
    const myParticipant = conversation.participants.find(
      (p) => p.userId === actor.sub,
    );

    return {
      messages: ordered.map((m) => this.formatMessage(m)),
      hasMore: messages.length === limit,
      nextCursor:
        messages.length === limit ? messages[messages.length - 1].id : null,
      myLastReadAt: myParticipant?.lastReadAt ?? null,
    };
  }

  async markRead(
    actor: JwtAccessPayload,
    conversationId: string,
    dto: MarkReadDto,
  ) {
    const participant = await this.prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId: actor.sub } },
    });

    if (!participant)
      throw new ForbiddenException(ChatErrors.NOT_A_PARTICIPANT);

    let readAt = new Date();

    if (dto.lastReadMessageId) {
      const msg = await this.prisma.message.findUnique({
        where: { id: dto.lastReadMessageId },
        select: { createdAt: true, conversationId: true },
      });
      if (!msg || msg.conversationId !== conversationId) {
        throw new BadRequestException(ChatErrors.INVALID_MESSAGE_ID);
      }
      readAt = msg.createdAt;
    }

    await this.prisma.conversationParticipant.update({
      where: { conversationId_userId: { conversationId, userId: actor.sub } },
      data: { lastReadAt: readAt },
    });

    return { lastReadAt: readAt };
  }

  async deleteMessage(actor: JwtAccessPayload, messageId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
      select: { id: true, senderId: true, deletedAt: true, type: true },
    });

    if (!message || message.deletedAt) {
      throw new NotFoundException(ChatErrors.MESSAGE_NOT_FOUND);
    }

    if (message.type === MessageType.SYSTEM) {
      throw new ForbiddenException(ChatErrors.CANNOT_DELETE_SYSTEM_MESSAGE);
    }

    if (message.senderId !== actor.sub) {
      throw new ForbiddenException(ChatErrors.NOT_MESSAGE_SENDER);
    }

    await this.prisma.message.update({
      where: { id: messageId },
      data: { deletedAt: new Date() },
    });

    return { deleted: true };
  }

  async getUnreadCount(userId: string): Promise<number> {
    const result = await this.prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) as count
      FROM messages m
      JOIN conversation_participants cp ON m."conversationId" = cp."conversationId"
      WHERE cp."userId" = ${userId}::uuid
        AND m."senderId" != ${userId}::uuid
        AND m."deletedAt" IS NULL
        AND m."type" != 'SYSTEM'
        AND m."createdAt" > cp."lastReadAt"
    `;

    return Number(result[0]?.count || 0);
  }

  private validateMessageContent(dto: SendMessageDto) {
    if (dto.type === MessageType.TEXT && !dto.text?.trim()) {
      throw new BadRequestException(ChatErrors.TEXT_REQUIRED);
    }

    if (MEDIA_TYPES.has(dto.type) && !dto.mediaUrl) {
      throw new BadRequestException(ChatErrors.MEDIA_URL_REQUIRED);
    }

    if (dto.type === MessageType.LOCATION) {
      const meta = dto.metadata as any;
      if (!meta?.lat || !meta?.lng) {
        throw new BadRequestException(ChatErrors.LOCATION_REQUIRED);
      }
    }
  }

  private formatMessage(message: any) {
    return {
      id: message.id,
      conversationId: message.conversationId,
      type: message.type,
      text: message.text,
      mediaUrl: message.mediaUrl,
      metadata: message.metadata,
      sender: message.sender
        ? {
            id: message.sender.id,
            name: message.sender.name,
            avatar: message.sender.avatar,
          }
        : null,
      replyTo: message.replyTo
        ? {
            id: message.replyTo.id,
            type: message.replyTo.type,
            text: message.replyTo.deletedAt ? null : message.replyTo.text,
            mediaUrl: message.replyTo.deletedAt
              ? null
              : message.replyTo.mediaUrl,
            deleted: !!message.replyTo.deletedAt,
            sender: message.replyTo.sender
              ? {
                  id: message.replyTo.sender.id,
                  name: message.replyTo.sender.name,
                  avatar: message.replyTo.sender.avatar,
                }
              : null,
          }
        : null,
      isSystem: message.type === MessageType.SYSTEM,
      createdAt: message.createdAt,
      deletedAt: message.deletedAt ?? null,
    };
  }
}
