export const QUEUES = {
  MAIL: 'mail_queue',
  PUSH: 'push_queue',
} as const;

export const MAIL_JOBS = {
  SEND_EMAIL: 'send_email',
} as const;

export const PUSH_JOBS = {
  SEND_TO_DEVICES: 'send_devices',
  SEND_TO_TOPIC: 'send_topic',
  SUBSCRIBE_TO_TOPIC: 'subscribe_topic',
  UNSUBSCRIBE_FROM_TOPIC: 'unsubscribe_topic',
} as const;
