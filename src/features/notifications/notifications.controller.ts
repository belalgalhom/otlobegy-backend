import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import {
  QueryNotificationsDto,
  MarkNotificationsReadDto,
} from './dto/notification.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}
  @Get()
  list(
    @CurrentUser('sub') userId: string,
    @Query() dto: QueryNotificationsDto,
  ) {
    return this.notificationsService.list(userId, dto);
  }

  @Get('unread-count')
  unreadCount(@CurrentUser('sub') userId: string) {
    return this.notificationsService.getUnreadCount(userId);
  }

  @Get(':id')
  getOne(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.notificationsService.getOne(userId, id);
  }

  @Patch('read')
  @HttpCode(HttpStatus.OK)
  markRead(
    @CurrentUser('sub') userId: string,
    @Body() dto: MarkNotificationsReadDto,
  ) {
    return this.notificationsService.markRead(userId, dto);
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  markOneRead(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.notificationsService.markOneRead(userId, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  deleteOne(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.notificationsService.deleteOne(userId, id);
  }

  @Delete('read')
  @HttpCode(HttpStatus.OK)
  deleteAllRead(@CurrentUser('sub') userId: string) {
    return this.notificationsService.deleteAllRead(userId);
  }
}
