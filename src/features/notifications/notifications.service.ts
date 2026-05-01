import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { PushService } from '../../infrastructure/push/push.service';
import { SocketService } from '../../infrastructure/socket/socket.service';
import {
  QueryNotificationsDto,
  MarkNotificationsReadDto,
  CreateNotificationDto,
} from './dto/notification.dto';
import { Language, NotificationType } from '@prisma/client';
import { NotificationErrors } from '../../common/constants/response.constants';

export const SOCKET_EVENTS = {
  NOTIFICATION: 'notification.new',
  CHAT_MESSAGE: 'chat.message',
  CONVERSATION_CREATED: 'conversation.created',
  CONVERSATION_CLOSED: 'conversation.closed',
} as const;

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pushService: PushService,
    private readonly socketService: SocketService,
  ) {}

  async create(dto: CreateNotificationDto) {
    const notification = await this.prisma.notification.create({
      data: {
        userId: dto.userId,
        title: dto.title,
        titleAr: dto.titleAr ?? null,
        body: dto.body ?? null,
        bodyAr: dto.bodyAr ?? null,
        type: dto.type,
        data: dto.data,
        isRead: false,
      },
    });

    await this.socketService.emitToUser(
      dto.userId,
      SOCKET_EVENTS.NOTIFICATION,
      {
        id: notification.id,
        title: notification.title,
        titleAr: notification.titleAr,
        body: notification.body,
        bodyAr: notification.bodyAr,
        type: notification.type,
        data: notification.data,
        createdAt: notification.createdAt,
      },
    );

    await this.dispatchPush(
      dto.userId,
      dto.type,
      dto.title,
      dto.titleAr ?? null,
      dto.body ?? null,
      dto.bodyAr ?? null,
      dto.data as Record<string, string> | undefined,
    );

    return notification;
  }

  private async dispatchPush(
    userId: string,
    type: NotificationType,
    title: string,
    titleAr: string | null,
    body: string | null,
    bodyAr: string | null,
    data?: Record<string, string>,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        language: true,
        devices: { select: { token: true } },
        notificationSettings: {
          select: {
            pushEnabled: true,
            orderUpdates: true,
            chatMessages: true,
            promotions: true,
            system: true,
            ticketUpdates: true,
          },
        },
      },
    });

    if (!user) {
      this.logger.warn(`User ${userId} not found, skipping push`);
      return;
    }

    if (user.notificationSettings) {
      if (!this.isTypeAllowed(type, user.notificationSettings)) {
        this.logger.debug(
          `Push suppressed for user ${userId}: type ${type} disabled`,
        );
        return;
      }
    }

    if (!user.devices.length) {
      this.logger.debug(`No devices for user ${userId}, skipping push`);
      return;
    }

    const isArabic = user.language === Language.AR;
    const pushTitle = isArabic ? (titleAr ?? title) : title;
    const pushBody = isArabic ? (bodyAr ?? body ?? '') : (body ?? '');
    const tokens = user.devices.map((d) => d.token);

    await this.pushService.sendToDevices(tokens, pushTitle, pushBody, data);

    this.logger.debug(
      `Push dispatched → user ${userId} | lang: ${user.language} | ${tokens.length} device(s)`,
    );
  }

  private isTypeAllowed(
    type: NotificationType,
    settings: {
      pushEnabled: boolean;
      orderUpdates: boolean;
      chatMessages: boolean;
      promotions: boolean;
      system: boolean;
      ticketUpdates: boolean;
    },
  ): boolean {
    if (!settings.pushEnabled) return false;

    switch (type) {
      case NotificationType.ORDER_UPDATE:
        return settings.orderUpdates;
      case NotificationType.CHAT_MESSAGE:
        return settings.chatMessages;
      case NotificationType.PROMOTION:
        return settings.promotions;
      case NotificationType.SYSTEM:
      case NotificationType.PAYMENT:
        return settings.system;
      case NotificationType.TICKET_UPDATE:
        return settings.ticketUpdates;
      default:
        return true;
    }
  }

  async list(userId: string, dto: QueryNotificationsDto) {
    const { page = 1, limit = 20, unreadOnly, type } = dto;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (unreadOnly) where.isRead = false;
    if (type) where.type = type;

    const [notifications, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return {
      notifications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      unreadCount,
    };
  }

  async getOne(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification)
      throw new NotFoundException(NotificationErrors.NOT_FOUND);
    if (notification.userId !== userId) throw new ForbiddenException();

    return notification;
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  async markRead(userId: string, dto: MarkNotificationsReadDto) {
    if (dto.ids?.length) {
      const owned = await this.prisma.notification.count({
        where: { id: { in: dto.ids }, userId },
      });
      if (owned !== dto.ids.length) throw new ForbiddenException();

      await this.prisma.notification.updateMany({
        where: { id: { in: dto.ids }, userId },
        data: { isRead: true },
      });

      return { marked: dto.ids.length };
    }

    const { count } = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return { marked: count };
  }

  async markOneRead(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification)
      throw new NotFoundException(NotificationErrors.NOT_FOUND);
    if (notification.userId !== userId) throw new ForbiddenException();

    if (notification.isRead) return notification;

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async deleteOne(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification)
      throw new NotFoundException(NotificationErrors.NOT_FOUND);
    if (notification.userId !== userId) throw new ForbiddenException();

    await this.prisma.notification.delete({ where: { id: notificationId } });
    return { deleted: true };
  }

  async deleteAllRead(userId: string) {
    const { count } = await this.prisma.notification.deleteMany({
      where: { userId, isRead: true },
    });
    return { deleted: count };
  }
}
