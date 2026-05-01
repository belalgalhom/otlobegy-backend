import { Global, Module } from '@nestjs/common';
import { MailListener } from './mail.listener';
import { ChatListener } from './chat.listener';
import { NotificationListener } from './notification.listener';

@Global()
@Module({
  providers: [MailListener, ChatListener, NotificationListener],
  exports: [MailListener, ChatListener, NotificationListener],
})
export class ListenersModule {}
