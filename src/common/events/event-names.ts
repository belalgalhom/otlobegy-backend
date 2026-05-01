export const EVENTS = {
  AUTH_OTP_REQUESTED:         'auth.otp.requested',
  CHAT_MESSAGE_SENT:          'chat.message.sent',
  CHAT_CONVERSATION_CREATED:  'chat.conversation.created',
  CHAT_CONVERSATION_CLOSED:   'chat.conversation.closed',
  TICKET_STATUS_UPDATED:      'ticket.status.updated',
} as const;

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];