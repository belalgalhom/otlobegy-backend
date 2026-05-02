import { Controller, Get } from '@nestjs/common';
import { MessagesService } from '../chat/messages.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Inbox - Summary Counts')
@ApiBearerAuth()
@Controller('inbox')
export class InboxController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Get('counts')
  @ApiOperation({ summary: 'Get unread counts for chat and notifications' })
  @ApiResponse({ status: 200, description: 'Unread counts returned' })
  async getCounts(@CurrentUser('sub') userId: string) {
    const [chatUnread, notificationUnread] = await Promise.all([
      this.messagesService.getUnreadCount(userId),
      this.notificationsService.getUnreadCount(userId),
    ]);

    return {
      chat: chatUnread,
      notifications: notificationUnread,
      total: chatUnread + notificationUnread,
    };
  }
}
