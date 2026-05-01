import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { TicketStatusUpdatedEvent } from '../events';
import { EVENTS } from '../events/event-names';
import { NotificationType, TicketStatus } from '@prisma/client';
import { NotificationsService } from '../../features/notifications/notifications.service';

const TICKET_STATUS_LABELS: Record<TicketStatus, { en: string; ar: string }> = {
  [TicketStatus.OPEN]:            { en: 'Open',           ar: 'مفتوحة' },
  [TicketStatus.IN_PROGRESS]:     { en: 'In Progress',    ar: 'قيد المعالجة' },
  [TicketStatus.WAITING_ON_USER]: { en: 'Waiting on You', ar: 'في انتظارك' },
  [TicketStatus.RESOLVED]:        { en: 'Resolved',       ar: 'تم الحل' },
  [TicketStatus.CLOSED]:          { en: 'Closed',         ar: 'مغلقة' },
};

@Injectable()
export class NotificationListener {
  private readonly logger = new Logger(NotificationListener.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  @OnEvent(EVENTS.TICKET_STATUS_UPDATED)
  async handleTicketStatusUpdated(event: TicketStatusUpdatedEvent) {
    if (event.creatorId === event.actorId) return;

    const label = TICKET_STATUS_LABELS[event.status];

    try {
      await this.notificationsService.create({
        userId:  event.creatorId,
        title:   `Ticket #${event.ticketNumber} Updated`,
        titleAr: `تم تحديث التذكرة #${event.ticketNumber}`,
        body:    `Your ticket status has been changed to: ${label.en}`,
        bodyAr:  `تم تغيير حالة تذكرتك إلى: ${label.ar}`,
        type:    NotificationType.TICKET_UPDATE,
        data: {
          ticketId:     event.ticketId,
          ticketNumber: event.ticketNumber,
          status:       event.status,
        },
      });

      this.logger.debug(
        `Ticket ${event.ticketNumber} → ${event.status} | notification created for user ${event.creatorId}`,
      );
    } catch (err: any) {
      this.logger.error(
        `Failed to notify user ${event.creatorId} for ticket ${event.ticketNumber}: ${err.message}`,
        err.stack,
      );
    }
  }
}