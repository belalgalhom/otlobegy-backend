import { TicketStatus } from '@prisma/client';

export class OtpRequestedEvent {
  constructor(
    public readonly contact: string,
    public readonly code: string,
    public readonly method: 'EMAIL' | 'SMS',
    public readonly purpose: 'VERIFICATION' | 'PASSWORD_RESET' = 'VERIFICATION',
  ) {}
}

export class ChatMessageSentEvent {
  constructor(
    public readonly messageId: string,
    public readonly conversationId: string,
    public readonly senderId: string,
    public readonly participantIds: string[],
    public readonly text: string | null,
    public readonly type: string,
    public readonly mediaUrl: string | null,
    public readonly metadata: Record<string, any> | null,
    public readonly createdAt: Date,
  ) {}
}

export class ChatConversationCreatedEvent {
  constructor(
    public readonly conversationId: string,
    public readonly participantIds: string[],
    public readonly type: string,
    public readonly orderId: string | null,
  ) {}
}

export class ChatConversationClosedEvent {
  constructor(
    public readonly conversationId: string,
    public readonly participantIds: string[],
    public readonly closedBy: string,
  ) {}
}

export class TicketStatusUpdatedEvent {
  constructor(
    public readonly ticketId: string,
    public readonly ticketNumber: string,
    public readonly status: TicketStatus,
    public readonly creatorId: string,
    public readonly actorId: string,
  ) {}
}
